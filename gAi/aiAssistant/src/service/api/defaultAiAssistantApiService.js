/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiAssistant/service/api/DefaultAiAssistantApiService
 * @description Implements the employee-secured, provider-neutral Assistant HTTP application boundary.
 * @layer service
 * @owner aiAssistant
 * @override Projects may replace API orchestration while preserving Profile authentication, ownership, and provider isolation.
 */
const crypto = require('crypto');
const guardrailService = require('../security/defaultAiAssistantGuardrailService');
const conversationService = require('../conversation/defaultAiAssistantConversationService');

module.exports = {
    /** Resolves effective layered configuration without introducing another configuration authority. */
    configuration: function () {
        return CONFIG.get('aiAssistant') || {};
    },

    /** Builds the trusted persistence context from the authenticated request only. */
    context: function (request) {
        const configuration = this.configuration();
        return {
            configuration: configuration,
            identity: guardrailService.authorize(request)
        };
    },

    /** Returns a stable success envelope understood by the Nodics response handler. */
    response: function (code, data) {
        return { code: code, data: data };
    },

    /** Loads one enabled Assistant definition through its generated Nodics service. */
    definition: async function (definitionCode, request) {
        const response = await SERVICE.DefaultAssistantDefinitionService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: { definitionCode: definitionCode, active: true, enabled: true },
            searchOptions: { pageSize: 2, pageNumber: 1 }
        });
        const values = response && Array.isArray(response.result) ? response.result : [];
        if (values.length !== 1) {
            const error = new Error('Enabled AI Assistant definition was not found');
            error.code = 'ERR_AIA_00003';
            throw error;
        }
        return values[0];
    },

    /** Loads one enabled definition-owned tool policy only when governed tools are enabled. */
    toolPolicy: async function (definition, configuration, request) {
        if (!configuration.tools || configuration.tools.enabled !== true) return null;
        if (!definition.toolPolicyCode) {
            const error = new Error('Enabled AI Assistant definition has no tool policy');
            error.code = 'ERR_AIA_00003';
            throw error;
        }
        const response = await SERVICE.DefaultAssistantToolPolicyService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: {
                policyCode: definition.toolPolicyCode,
                contractVersion: 1,
                active: true,
                enabled: true
            },
            searchOptions: { pageSize: 2, pageNumber: 1 }
        });
        const values = response && Array.isArray(response.result) ? response.result : [];
        if (values.length !== 1) {
            const error = new Error('Enabled AI Assistant tool policy was not found');
            error.code = 'ERR_AIA_00003';
            throw error;
        }
        return values[0];
    },

    /** Builds provider-neutral runtime dependencies from existing Nodics authorities. */
    runtime: function (configuration, toolPolicy) {
        return {
            configuration: configuration,
            configurationRevision: crypto.createHash('sha256').update(JSON.stringify(configuration)).digest('hex'),
            providerConfiguration: CONFIG.get('aiProviders') || {},
            providerGateway: SERVICE.DefaultAiProviderGatewayService,
            promptService: SERVICE.DefaultAssistantPromptDefinitionService,
            knowledgeOperations: SERVICE.DefaultAiKnowledgeOperationsService,
            toolPolicy: toolPolicy,
            toolExecutor: SERVICE.DefaultAiAssistantToolExecutionService,
            toolEventPublisher: (turn, eventType, data, request, context) =>
                conversationService.appendEvent(turn, eventType, data, request, context)
        };
    },

    /** Creates an authenticated employee-owned conversation. */
    createConversation: async function (request) {
        const context = this.context(request);
        const input = request.body || {};
        await this.definition(input.definitionCode, request);
        const model = await conversationService.create(Object.assign({}, request, input), context.configuration, context);
        return this.response('SUC_AIA_00000', { conversation: model });
    },

    /** Lists only conversations owned by the authenticated employee in the active tenant. */
    listConversations: async function (request) {
        const context = this.context(request);
        return this.response('SUC_AIA_00001', await conversationService.listOwned(request, context));
    },

    /** Loads one owned conversation. */
    getConversation: async function (request) {
        const context = this.context(request);
        const model = await conversationService.getOwned(request.conversationCode, request, context);
        return this.response('SUC_AIA_00002', { conversation: model });
    },

    /** Accepts and starts one provider-neutral governed turn without blocking the HTTP request. */
    submitTurn: async function (request) {
        const baseConfiguration = this.configuration();
        const context = this.context(request);
        const conversation = await conversationService.getOwned(request.conversationCode, request, context);
        const definition = await this.definition(conversation.definitionCode, request);
        const configuration = Object.assign({}, baseConfiguration, {
            providerProfile: definition.providerProfile
        });
        const toolPolicy = await this.toolPolicy(definition, configuration, request);
        const input = Object.assign({}, request, request.body || {}, {
            conversationCode: request.conversationCode,
            promptCode: definition.promptCode,
            idempotencyKey: request.idempotencyKey || (request.body || {}).idempotencyKey
        });
        const prepared = await SERVICE.DefaultAiAssistantTurnCoordinatorService.start(
            input, this.runtime(configuration, toolPolicy)
        );
        return this.response('SUC_AIA_00003', {
            conversation: prepared.conversation,
            turn: prepared.turn
        });
    },

    /** Loads one owned turn. */
    getTurn: async function (request) {
        const context = this.context(request);
        const turn = await conversationService.getOwnedTurn(
            request.conversationCode, request.turnCode, request, context
        );
        return this.response('SUC_AIA_00004', { turn: turn });
    },

    /** Returns persisted replay events; live SSE transport is a separate Step 10 boundary. */
    replayEvents: async function (request) {
        const context = this.context(request);
        const events = await conversationService.replayEvents(
            request.conversationCode, request.turnCode, request, context
        );
        return this.response('SUC_AIA_00005', events);
    },

    /** Persists cancellation intent, then optimizes delivery to a matching local execution. */
    cancelTurn: async function (request) {
        const context = this.context(request);
        const turn = await conversationService.requestCancellation(
            request.conversationCode, request.turnCode,
            Object.assign({}, request, { reason: (request.body || {}).reason }), context
        );
        if (turn.state === 'CANCELLATION_REQUESTED') {
            SERVICE.DefaultAiAssistantTurnCoordinatorService.cancel(
            context.identity.tenantCode, context.identity.principalCode,
            request.conversationCode, request.turnCode, (request.body || {}).reason
            );
        }
        return this.response('SUC_AIA_00006', { turn: turn });
    },

    /** Reconciles a bounded tenant-scoped batch of abandoned turns for service-token callers. */
    recoverTurns: async function (request) {
        const configuration = this.configuration();
        const result = await SERVICE.DefaultAiAssistantTurnRecoveryService.reconcile(
            Object.assign({}, request, request.body || {}), this.runtime(configuration)
        );
        return this.response('SUC_AIA_00007', result);
    },

    /** Returns sanitized Assistant execution readiness and bounded telemetry. */
    diagnostics: async function (request) {
        const result = await SERVICE.DefaultAiAssistantOperationsService.diagnostics(request);
        return this.response('SUC_AIA_00008', result);
    }
};
