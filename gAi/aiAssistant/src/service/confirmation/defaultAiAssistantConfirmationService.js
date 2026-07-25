/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiAssistant/service/confirmation/DefaultAiAssistantConfirmationService
 * @description Owns immutable employee mutation confirmation and delegates execution to Profile or durable work to Workflow.
 * @layer service
 * @owner aiAssistant
 * @override Projects may add approved operations while preserving immutable argument binding, target authorization, idempotency, and Workflow authority.
 */
const crypto = require('crypto');
const guardrail = require('../security/defaultAiAssistantGuardrailService');

function fail(code, message) {
    if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(code, message);
    const error = new Error(message);
    error.code = code;
    return error;
}

module.exports = {
    /** Extracts a generated-service optimistic update count. */
    affected: function (response) {
        const result = response && (response.result || response);
        return Number(result && (result.modifiedCount || result.nModified || result.matchedCount || result.n) || 0);
    },
    /** Returns the configured confirmation policy. */
    policy: function () {
        return (CONFIG.get('aiAssistant') || {}).confirmations || {};
    },
    /** Returns the client-safe confirmation lifecycle projection. */
    projection: function (model) {
        const expired = new Date(model.expiresAt).getTime() <= Date.now() &&
            ['PENDING', 'APPROVED'].includes(model.state);
        return {
            confirmationCode: model.confirmationCode,
            conversationCode: model.conversationCode,
            operationId: model.operationId,
            state: expired ? 'EXPIRED' : model.state,
            argumentsDigest: model.argumentsDigest,
            revision: model.revision,
            expiresAt: model.expiresAt,
            impact: model.impact,
            workflowCarrierCode: model.workflowCarrierCode
        };
    },
    /** Produces a stable digest independent of object insertion order. */
    digest: function (value) {
        const stable = object => object && typeof object === 'object' && !Array.isArray(object) ?
            Object.keys(object).sort().reduce((result, key) => {
                result[key] = stable(object[key]); return result;
            }, {}) : Array.isArray(object) ? object.map(stable) : object;
        return crypto.createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
    },
    /** Loads one confirmation owned by the authenticated employee. */
    load: async function (request) {
        const identity = guardrail.authorize(request);
        const response = await SERVICE.DefaultAssistantConfirmationService.get({
            tenant: request.tenant, authData: request.authData,
            query: { confirmationCode: request.confirmationCode, tenantCode: identity.tenantCode,
                principalCode: identity.principalCode },
            searchOptions: { pageSize: 2, pageNumber: 1 }
        });
        const values = response && Array.isArray(response.result) ? response.result : [];
        if (values.length !== 1) throw fail('ERR_AIA_00001', 'Assistant confirmation not found');
        return { identity: identity, model: values[0] };
    },
    /** Retrieves one employee-owned confirmation without disclosing mutation arguments. */
    get: async function (request) {
        const loaded = await this.load(request);
        return { code: 'SUC_AIA_00013', data: { confirmation: this.projection(loaded.model) } };
    },
    /** Creates a pending confirmation from a fixed supported operation identity. */
    create: async function (request) {
        const identity = guardrail.authorize(request);
        const input = request.body || {};
        if (input.operationId !== 'profile_createenterprise') {
            throw fail('ERR_AIA_00006', 'Assistant mutation is not approved');
        }
        const now = Date.now();
        const ttl = Math.max(60, Math.min(3600, Number(this.policy().ttlSeconds || 600)));
        const confirmationCode = 'confirmation-' + crypto.randomUUID();
        const model = {
            code: confirmationCode, confirmationCode: confirmationCode,
            tenantCode: identity.tenantCode, principalCode: identity.principalCode,
            conversationCode: input.conversationCode, turnCode: input.turnCode,
            operationId: input.operationId, arguments: input.arguments,
            argumentsDigest: this.digest(input.arguments),
            impact: { type: 'CREATE', ownerModule: 'profile', resource: 'enterprise',
                summary: 'Create enterprise ' + input.arguments.code },
            state: 'PENDING', expiresAt: new Date(now + ttl * 1000),
            workflowCode: input.workflowCode, idempotencyKey: input.idempotencyKey, revision: 0, active: true
        };
        const saved = await SERVICE.DefaultAssistantConfirmationService.save({
            tenant: request.tenant, authData: request.authData, model: model
        });
        const persisted = saved && saved.result !== undefined ? saved.result : saved;
        return {
            code: 'SUC_AIA_00009',
            data: { confirmation: this.projection(Array.isArray(persisted) ? persisted[0] : persisted) }
        };
    },
    /** Approves only the unchanged, unexpired pending confirmation. */
    approve: async function (request) {
        const loaded = await this.load(request);
        const input = request.body || {}, model = loaded.model;
        if (new Date(model.expiresAt).getTime() <= Date.now()) throw fail('ERR_AIA_00008', 'Assistant confirmation has expired');
        if (model.state !== 'PENDING' || input.argumentsDigest !== model.argumentsDigest ||
            Number(input.expectedRevision) !== Number(model.revision)) throw fail('ERR_AIA_00007', 'Assistant confirmation is stale or changed');
        model.state = 'APPROVED'; model.approvedAt = new Date(); model.revision = Number(model.revision) + 1;
        const saved = await SERVICE.DefaultAssistantConfirmationService.update({
            tenant: request.tenant, authData: request.authData,
            query: { code: model.code, revision: Number(input.expectedRevision) }, model: model
        });
        if (this.affected(saved) !== 1) throw fail('ERR_AIA_00007', 'Assistant confirmation approval conflict');
        return { code: 'SUC_AIA_00010', data: { confirmation: this.projection(model) } };
    },
    /** Rejects an unchanged pending or approved confirmation before execution begins. */
    reject: async function (request) {
        const loaded = await this.load(request);
        const input = request.body || {}, model = loaded.model;
        if (new Date(model.expiresAt).getTime() <= Date.now()) {
            throw fail('ERR_AIA_00008', 'Assistant confirmation has expired');
        }
        if (!['PENDING', 'APPROVED'].includes(model.state) ||
            input.argumentsDigest !== model.argumentsDigest ||
            Number(input.expectedRevision) !== Number(model.revision)) {
            throw fail('ERR_AIA_00007', 'Assistant confirmation is stale or changed');
        }
        const previousState = model.state;
        model.state = 'REJECTED';
        model.rejectedAt = new Date();
        model.rejectionReason = input.reason;
        model.revision = Number(model.revision) + 1;
        const saved = await SERVICE.DefaultAssistantConfirmationService.update({
            tenant: request.tenant,
            authData: request.authData,
            query: {
                code: model.code,
                state: previousState,
                revision: Number(input.expectedRevision)
            },
            model: model
        });
        if (this.affected(saved) !== 1) {
            throw fail('ERR_AIA_00007', 'Assistant confirmation rejection conflict');
        }
        return { code: 'SUC_AIA_00014', data: { confirmation: this.projection(model) } };
    },
    /** Executes an approved atomic command or hands a durable process to Workflow without duplicating its state. */
    execute: async function (request) {
        const loaded = await this.load(request), model = loaded.model;
        if (new Date(model.expiresAt).getTime() <= Date.now()) throw fail('ERR_AIA_00008', 'Assistant confirmation has expired');
        if (model.state !== 'APPROVED') throw fail('ERR_AIA_00007', 'Assistant confirmation is not executable');
        let approvedRevision = Number(model.revision);
        model.state = 'EXECUTING'; model.revision = approvedRevision + 1;
        let claim = await SERVICE.DefaultAssistantConfirmationService.update({
            tenant: request.tenant, authData: request.authData,
            query: { code: model.code, state: 'APPROVED', revision: approvedRevision }, model: model
        });
        if (this.affected(claim) !== 1) {
            throw fail('ERR_AIA_00007', 'Assistant confirmation execution conflict');
        }
        let result;
        try {
            if (model.workflowCode) {
                const workflowRequest = {
                    workflowCode: model.workflowCode, releaseCarrier: true,
                    carrier: { code: 'assistant-' + model.confirmationCode,
                        items: [{ code: model.operationId, active: true, refId: model.confirmationCode,
                            callbackData: { confirmationCode: model.confirmationCode },
                            itemDetail: { operationId: model.operationId, arguments: model.arguments } }] }
                };
                const descriptor = SERVICE.DefaultModuleService.buildRequest({
                    moduleName: 'workflow', apiVersion: 'v0', apiName: '/carrier/init', methodName: 'PUT',
                    header: { Authorization: request.authToken,
                        'x-enterprise-code': request.authData && request.authData.entCode },
                    requestBody: workflowRequest,
                    timeoutMs: Number(this.policy().executionTimeoutMs || 5000), maxAttempts: 1,
                    maxResponseBytes: 262144, followRedirects: false
                });
                const response = await SERVICE.DefaultModuleService.fetch(descriptor);
                result = response && (response.data && (response.data.data || response.data) || response.result || response);
                model.workflowCarrierCode = result && (result.carrierCode || result.workflowCarrier && result.workflowCarrier.code);
            } else {
                const descriptor = SERVICE.DefaultModuleService.buildRequest({
                    moduleName: 'profile', apiVersion: 'v0', apiName: '/enterprises', methodName: 'POST',
                    header: { Authorization: request.authToken,
                        'x-enterprise-code': request.authData && request.authData.entCode },
                    requestBody: Object.assign({}, model.arguments, { idempotencyKey: model.idempotencyKey }),
                    timeoutMs: Number(this.policy().executionTimeoutMs || 5000), maxAttempts: 1,
                    maxResponseBytes: 262144, followRedirects: false
                });
                const response = await SERVICE.DefaultModuleService.fetch(descriptor);
                result = response && response.data && (response.data.data || response.data);
            }
        } catch (error) {
            model.state = 'UNCERTAIN'; model.revision = Number(model.revision) + 1;
            await SERVICE.DefaultAssistantConfirmationService.update({
                tenant: request.tenant, authData: request.authData,
                query: { code: model.code, state: 'EXECUTING' }, model: model
            });
            throw error;
        }
        model.state = 'CONSUMED'; model.consumedAt = new Date(); model.revision = Number(model.revision) + 1;
        const consumed = await SERVICE.DefaultAssistantConfirmationService.update({
            tenant: request.tenant, authData: request.authData,
            query: { code: model.code, state: 'EXECUTING', revision: approvedRevision + 1 }, model: model
        });
        if (this.affected(consumed) !== 1) throw fail('ERR_AIA_00007', 'Assistant confirmation completion conflict');
        return { code: 'SUC_AIA_00011', data: { confirmationCode: model.confirmationCode,
            state: model.state, workflowCarrierCode: model.workflowCarrierCode, result: result } };
    }
};
