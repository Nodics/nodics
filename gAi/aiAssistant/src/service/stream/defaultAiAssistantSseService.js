/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiAssistant/service/stream/DefaultAiAssistantSseService
 * @description Delivers authenticated normalized Assistant events with durable replay, heartbeats, and bounded buffering.
 * @layer service
 * @owner aiAssistant
 * @override Projects may replace transport delivery while preserving ownership, ordering, replay, and payload bounds.
 */
const conversationService = require('../conversation/defaultAiAssistantConversationService');
const guardrailService = require('../security/defaultAiAssistantGuardrailService');
const terminalTypes = new Set(['COMPLETED', 'CANCELLED', 'FAILED']);

module.exports = {
    /** Parses a standard Last-Event-ID or numeric replay cursor for the requested turn. */
    cursor: function (request) {
        const http = request.httpRequest || {};
        const raw = (typeof http.get === 'function' && http.get('Last-Event-ID')) ||
            (http.headers && http.headers['last-event-id']) || (request.query || {}).afterSequence;
        if (raw === undefined || raw === null || raw === '') return 0;
        if (/^[0-9]+$/.test(String(raw))) return Number(raw);
        const prefix = request.turnCode + '-';
        if (!String(raw).startsWith(prefix) || !/^[0-9]+$/.test(String(raw).slice(prefix.length))) {
            const error = new Error('Invalid AI Assistant Last-Event-ID');
            error.code = 'ERR_AIA_00004';
            throw error;
        }
        return Number(String(raw).slice(prefix.length));
    },

    /** Projects a persisted event into the stable provider-neutral stream contract. */
    project: function (event) {
        return {
            contractVersion: 1,
            conversationId: event.conversationCode,
            turnId: event.turnCode,
            eventId: event.eventCode,
            eventType: event.eventType,
            sequence: event.sequence,
            createdAt: new Date(event.createdAt).toISOString(),
            data: event.data || {}
        };
    },

    /** Opens one authorized SSE connection and resolves after terminal delivery or disconnect. */
    open: async function (request) {
        const configuration = CONFIG.get('aiAssistant') || {};
        const identity = guardrailService.authorize(request);
        const context = { configuration: configuration, identity: identity };
        const afterSequence = this.cursor(request);
        await conversationService.getOwnedTurn(
            request.conversationCode, request.turnCode, request, context
        );
        const earlyEvents = [];
        let liveSink = event => earlyEvents.push(event);
        const preSubscribed = SERVICE.DefaultAiAssistantTurnCoordinatorService.subscribe(
            identity.tenantCode, request.turnCode, event => liveSink(event)
        );
        let replay;
        try {
            replay = await conversationService.replayEvents(
                request.conversationCode, request.turnCode,
                Object.assign({}, request, {
                    query: { afterSequence: afterSequence, limit: configuration.api.maximumEventReplaySize }
                }), context
            );
        } catch (error) {
            preSubscribed();
            throw error;
        }
        if (afterSequence && replay.items.length && replay.items[0].sequence > afterSequence + 1) {
            preSubscribed();
            const error = new Error('AI Assistant replay window has expired');
            error.code = 'ERR_AIA_00005';
            throw error;
        }
        const response = request.httpResponse;
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        response.setHeader('Cache-Control', 'no-cache, no-transform');
        response.setHeader('Connection', 'keep-alive');
        response.setHeader('X-Accel-Buffering', 'no');
        if (typeof response.flushHeaders === 'function') response.flushHeaders();

        return new Promise(resolve => {
            let closed = false;
            let lastSequence = afterSequence;
            let bufferedBytes = 0;
            const queue = [];
            const maximum = configuration.streaming.maxEventBytes;
            const close = () => {
                if (closed) return;
                closed = true;
                clearInterval(heartbeat);
                unsubscribe();
                resolve({ metadata: { responseCommitted: true } });
            };
            const flush = () => {
                while (!closed && queue.length) {
                    const value = queue.shift();
                    bufferedBytes -= Buffer.byteLength(value);
                    if (response.write(value) === false) return;
                }
            };
            const send = event => {
                if (closed || event.sequence <= lastSequence) return;
                const projected = this.project(event);
                const payload = 'id: ' + projected.eventId + '\n' +
                    'event: ' + projected.eventType.toLowerCase() + '\n' +
                    'data: ' + JSON.stringify(projected) + '\n\n';
                const bytes = Buffer.byteLength(payload);
                if (bytes > maximum || bufferedBytes + bytes > maximum) {
                    response.write('event: failed\ndata: {"code":"SSE_BUFFER_LIMIT"}\n\n');
                    response.end();
                    close();
                    return;
                }
                lastSequence = event.sequence;
                queue.push(payload);
                bufferedBytes += bytes;
                flush();
                if (terminalTypes.has(event.eventType) && !queue.length) {
                    response.end();
                    close();
                }
            };
            const unsubscribe = preSubscribed;
            liveSink = send;
            const heartbeat = setInterval(() => {
                if (!closed) response.write(': heartbeat ' + Date.now() + '\n\n');
            }, configuration.streaming.heartbeatMs);
            if (typeof heartbeat.unref === 'function') heartbeat.unref();
            if (typeof response.on === 'function') {
                response.on('drain', flush);
                response.on('close', close);
                response.on('error', close);
            }
            replay.items.forEach(send);
            earlyEvents.sort((left, right) => left.sequence - right.sequence).forEach(send);
            if (!replay.items.length && !SERVICE.DefaultAiAssistantTurnCoordinatorService.isActive(
                identity.tenantCode, request.turnCode
            )) {
                response.end();
                close();
            }
        });
    }
};
