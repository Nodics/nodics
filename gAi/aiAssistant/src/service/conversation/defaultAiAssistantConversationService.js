/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiAssistant/service/conversation/DefaultAiAssistantConversationService
 * @description Persists tenant/principal-owned conversations, ordered messages, turns, and replayable events.
 * @layer service
 * @owner aiAssistant
 * @override Projects may replace retention storage while preserving ordering, ownership, and idempotency.
 */
const crypto = require('crypto');
const executionTelemetry = require('../observability/defaultAiAssistantExecutionTelemetryService');

function id(prefix) {
    return prefix + '-' + crypto.randomUUID();
}

function items(result) {
    return result && Array.isArray(result.result) ? result.result : [];
}

function affected(response) {
    const result = response && response.result !== undefined ? response.result : response;
    if (!result) return 0;
    if (Array.isArray(result)) return result.length;
    return Number(result.modifiedCount || result.nModified || result.matchedCount || result.n || 0);
}

function fail(code, message) {
    if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(code, message);
    const error = new Error(message);
    error.code = code;
    return error;
}

module.exports = {
    /** Resolves generated services or focused-test replacements. */
    services: function (context) {
        return context.services || {
            conversations: SERVICE.DefaultAssistantConversationService,
            messages: SERVICE.DefaultAssistantMessageService,
            turns: SERVICE.DefaultAssistantTurnService,
            events: SERVICE.DefaultAssistantTurnEventService
        };
    },

    /** Creates one employee-owned conversation. */
    create: async function (request, configuration, context) {
        const services = this.services(context || {});
        const identity = context.identity;
        const now = new Date();
        const code = id('conversation');
        const model = {
            code: code, active: true, conversationCode: code,
            definitionCode: request.definitionCode, tenantCode: identity.tenantCode,
            enterpriseCode: identity.enterpriseCode, applicationCode: identity.applicationCode,
            principalCode: identity.principalCode, title: request.title,
            state: 'ACTIVE', lastSequence: 0,
            expiresAt: new Date(now.getTime() + configuration.retention.conversationDays * 86400000), revision: 0
        };
        await services.conversations.save({ tenant: identity.tenantCode, authData: request.authData, model: model });
        return model;
    },

    /** Loads one conversation and enforces tenant plus principal ownership. */
    getOwned: async function (conversationCode, request, context) {
        const identity = context.identity;
        const found = items(await this.services(context).conversations.get({
            tenant: identity.tenantCode, authData: request.authData,
            query: { conversationCode: conversationCode, tenantCode: identity.tenantCode, principalCode: identity.principalCode },
            searchOptions: { pageSize: 2, pageNumber: 1 }
        }));
        if (found.length !== 1) {
            throw fail('ERR_AIA_00001', 'AI Assistant conversation was not found for authenticated principal');
        }
        return found[0];
    },

    /** Lists a bounded page of conversations owned by the authenticated employee. */
    listOwned: async function (request, context) {
        const identity = context.identity;
        const query = request.query || {};
        const configuredMaximum = Number(context.configuration.api.maximumPageSize || 50);
        const limit = Math.min(configuredMaximum, Math.max(1, Number(query.limit) || 20));
        const page = Math.max(1, Number(query.page) || 1);
        const filter = {
            tenantCode: identity.tenantCode,
            principalCode: identity.principalCode
        };
        if (query.state) filter.state = query.state;
        const result = await this.services(context).conversations.get({
            tenant: identity.tenantCode,
            authData: request.authData,
            query: filter,
            searchOptions: { pageSize: limit, pageNumber: page, sort: { updatedAt: -1, conversationCode: 1 } }
        });
        return { page: page, limit: limit, items: items(result) };
    },

    /** Loads one turn only after its parent conversation ownership is established. */
    getOwnedTurn: async function (conversationCode, turnCode, request, context) {
        await this.getOwned(conversationCode, request, context);
        const identity = context.identity;
        const found = items(await this.services(context).turns.get({
            tenant: identity.tenantCode,
            authData: request.authData,
            query: {
                conversationCode: conversationCode,
                turnCode: turnCode,
                tenantCode: identity.tenantCode,
                principalCode: identity.principalCode
            },
            searchOptions: { pageSize: 2, pageNumber: 1 }
        }));
        if (found.length !== 1) {
            throw fail('ERR_AIA_00001', 'AI Assistant turn was not found for authenticated principal');
        }
        return found[0];
    },

    /** Replays a bounded ordered event page after conversation and turn ownership checks. */
    replayEvents: async function (conversationCode, turnCode, request, context) {
        await this.getOwnedTurn(conversationCode, turnCode, request, context);
        const query = request.query || {};
        const configuredMaximum = Number(context.configuration.api.maximumEventReplaySize || 500);
        const limit = Math.min(configuredMaximum, Math.max(1, Number(query.limit) || 100));
        const afterSequence = Math.max(0, Number(query.afterSequence) || 0);
        const response = await this.services(context).events.get({
            tenant: context.identity.tenantCode,
            authData: request.authData,
            query: {
                tenantCode: context.identity.tenantCode,
                conversationCode: conversationCode,
                turnCode: turnCode,
                sequence: { $gt: afterSequence }
            },
            searchOptions: { pageSize: limit, pageNumber: 1, sort: { sequence: 1 } }
        });
        return { afterSequence: afterSequence, limit: limit, items: items(response) };
    },

    /** Cancels only a not-yet-running accepted turn and records the terminal event. */
    cancelAcceptedTurn: async function (conversationCode, turnCode, request, context) {
        return this.requestCancellation(conversationCode, turnCode, request, context);
    },

    /** Persists idempotent employee cancellation intent before any process-local abort. */
    requestCancellation: async function (conversationCode, turnCode, request, context) {
        const turn = await this.getOwnedTurn(conversationCode, turnCode, request, context);
        if (['CANCELLED', 'COMPLETED', 'FAILED'].includes(turn.state)) return turn;
        if (turn.state === 'CANCELLATION_REQUESTED') return turn;
        if (!['ACCEPTED', 'PROCESSING'].includes(turn.state)) {
            throw fail('ERR_AIA_00002', 'AI Assistant turn state does not allow cancellation');
        }
        const now = new Date();
        const model = {
            state: turn.state === 'ACCEPTED' ? 'CANCELLED' : 'CANCELLATION_REQUESTED',
            cancellationRequestedAt: now,
            cancellationRequestedBy: context.identity.principalCode,
            cancellationReason: 'EMPLOYEE_REQUEST'
        };
        if (turn.state === 'ACCEPTED') model.completedAt = now;
        const response = await this.services(context).turns.update({
            tenant: context.identity.tenantCode, authData: request.authData,
            query: {
                turnCode: turnCode, conversationCode: conversationCode,
                tenantCode: context.identity.tenantCode,
                principalCode: context.identity.principalCode, state: turn.state
            },
            model: model
        });
        if (affected(response) !== 1) {
            return this.getOwnedTurn(conversationCode, turnCode, request, context);
        }
        executionTelemetry.record('cancellationRequests');
        const updated = Object.assign({}, turn, model);
        if (updated.state === 'CANCELLED') {
            await this.appendEvent(updated, 'CANCELLED', { reason: 'EMPLOYEE_REQUEST' }, request, context);
        }
        return updated;
    },

    /** Creates an idempotent accepted turn and its user message. */
    acceptTurn: async function (conversation, request, snapshot, redacted, context) {
        const services = this.services(context);
        const existing = items(await services.turns.get({
            tenant: context.identity.tenantCode, authData: request.authData,
            query: { tenantCode: context.identity.tenantCode, idempotencyKey: request.idempotencyKey },
            searchOptions: { pageSize: 2, pageNumber: 1 }
        }));
        if (existing.length) return existing[0];
        const turnCode = id('turn');
        const now = new Date();
        const turn = {
            code: turnCode, active: true, turnCode: turnCode,
            conversationCode: conversation.conversationCode, idempotencyKey: request.idempotencyKey,
            tenantCode: context.identity.tenantCode, principalCode: context.identity.principalCode,
            state: 'ACCEPTED', configurationSnapshot: snapshot, acceptedAt: now, revision: 0
        };
        await services.turns.save({ tenant: context.identity.tenantCode, authData: request.authData, model: turn });
        const messageCode = id('message');
        await services.messages.save({
            tenant: context.identity.tenantCode, authData: request.authData,
            model: {
                code: messageCode, active: true, messageCode: messageCode,
                conversationCode: conversation.conversationCode, turnCode: turnCode,
                tenantCode: context.identity.tenantCode, principalCode: context.identity.principalCode,
                sequence: Number(conversation.lastSequence || 0) + 1, role: 'user',
                content: redacted.content, redactionMetadata: redacted.metadata, createdAt: now
            }
        });
        await this.appendEvent(turn, 'TURN_ACCEPTED', {}, request, context);
        return turn;
    },

    /** Appends one immutable replay event with a deterministic turn-local sequence. */
    appendEvent: async function (turn, eventType, data, request, context) {
        const services = this.services(context);
        const existing = items(await services.events.get({
            tenant: context.identity.tenantCode, authData: request.authData,
            query: { tenantCode: context.identity.tenantCode, turnCode: turn.turnCode },
            searchOptions: { pageSize: 1, pageNumber: 1, sort: { sequence: -1 } }
        }));
        const sequence = existing.length ? Number(existing[0].sequence) + 1 : 1;
        const eventCode = turn.turnCode + '-' + sequence;
        const now = new Date();
        const event = {
            code: eventCode, active: true, eventCode: eventCode,
            conversationCode: turn.conversationCode, turnCode: turn.turnCode,
            tenantCode: context.identity.tenantCode, sequence: sequence, eventType: eventType,
            data: data, createdAt: now,
            expiresAt: new Date(now.getTime() + context.configuration.streaming.reconnectWindowMs)
        };
        await services.events.save({ tenant: context.identity.tenantCode, authData: request.authData, model: event });
        if (typeof context.eventPublisher === 'function') await context.eventPublisher(event);
        return event;
    }
};
