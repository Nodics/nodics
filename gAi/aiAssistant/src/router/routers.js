/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiAssistant/src/router/routers
 * @description Defines employee-secured Assistant conversation and turn routes.
 * @layer definition
 * @owner aiAssistant
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
const contracts = require('../schemas/apiContracts');

module.exports = {
    aiAssistant: {
        operations: {
            diagnostics: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.assistant.operations.read',
                apiExposure: 'aiOperations', key: '/operations/ai-assistant/diagnostics', method: 'GET',
                controller: 'DefaultAiAssistantController', operation: 'diagnostics',
                responses: { '200': { description: 'Sanitized Assistant execution readiness and bounded telemetry' } }
            }
        },
        conversations: {
            create: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.assistant.use',
                apiExposure: 'aiAssistant', key: '/conversations', method: 'POST',
                controller: 'DefaultAiAssistantController', operation: 'createConversation',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.createConversationRequest } } },
                responses: { '200': { description: 'Employee-owned Assistant conversation created' } }
            },
            list: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.assistant.read',
                apiExposure: 'aiAssistant', key: '/conversations', method: 'GET',
                controller: 'DefaultAiAssistantController', operation: 'listConversations',
                help: { parameters: [
                    { name: 'state', in: 'query', required: false, schema: { type: 'string' } },
                    { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
                    { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100 } }
                ] },
                responses: { '200': { description: 'Bounded conversations owned by the authenticated employee' } }
            },
            getConversation: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.assistant.read',
                apiExposure: 'aiAssistant', key: '/conversations/:conversationCode', method: 'GET',
                controller: 'DefaultAiAssistantController', operation: 'getConversation',
                responses: { '200': { description: 'Employee-owned Assistant conversation' } }
            }
        },
        turns: {
            submit: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.assistant.use',
                apiExposure: 'aiAssistant', key: '/conversations/:conversationCode/turns', method: 'POST',
                controller: 'DefaultAiAssistantController', operation: 'submitTurn',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.submitTurnRequest } } },
                responses: { '202': { description: 'Governed Assistant turn durably accepted for background execution' } }
            },
            getTurn: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.assistant.read',
                apiExposure: 'aiAssistant', key: '/conversations/:conversationCode/turns/:turnCode', method: 'GET',
                controller: 'DefaultAiAssistantController', operation: 'getTurn',
                responses: { '200': { description: 'Employee-owned Assistant turn status' } }
            },
            replayEvents: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.assistant.read',
                apiExposure: 'aiAssistant', key: '/conversations/:conversationCode/turns/:turnCode/events', method: 'GET',
                controller: 'DefaultAiAssistantController', operation: 'replayEvents',
                help: { parameters: [
                    { name: 'afterSequence', in: 'query', required: false, schema: { type: 'integer', minimum: 0 } },
                    { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 500 } }
                ] },
                responses: { '200': { description: 'Bounded ordered persisted Assistant event replay' } }
            },
            stream: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.assistant.read',
                apiExposure: 'aiAssistant', key: '/conversations/:conversationCode/turns/:turnCode/stream', method: 'GET',
                controller: 'DefaultAiAssistantController', operation: 'streamTurn',
                responseHandler: 'aiAssistantSseResponseHandler',
                help: { parameters: [
                    { name: 'Last-Event-ID', in: 'header', required: false, schema: { type: 'string' } },
                    { name: 'afterSequence', in: 'query', required: false, schema: { type: 'integer', minimum: 0 } }
                ] },
                responses: { '200': { description: 'Authenticated normalized Assistant server-sent event stream',
                    content: { 'text/event-stream': { schema: contracts.streamEvent } } } }
            },
            cancel: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.assistant.cancel',
                apiExposure: 'aiAssistant', key: '/conversations/:conversationCode/turns/:turnCode/cancel', method: 'POST',
                controller: 'DefaultAiAssistantController', operation: 'cancelTurn',
                requestBody: { required: false, content: { 'application/json': { schema: contracts.cancelTurnRequest } } },
                responses: { '200': { description: 'Accepted Assistant turn cancelled idempotently' } }
            },
            recover: {
                secured: true, accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal', key: '/internal/assistant/turns/recover', method: 'POST',
                controller: 'DefaultAiAssistantController', operation: 'recoverTurns',
                requestBody: { required: false, content: { 'application/json': { schema: {
                    type: 'object', additionalProperties: false,
                    properties: {
                        limit: { type: 'integer', minimum: 1, maximum: 100 },
                        at: { type: 'string', format: 'date-time' }
                    }
                } } } },
                responses: { '200': { description: 'Bounded abandoned Assistant turn reconciliation' } }
            }
        },
        confirmations: {
            createConfirmation: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.assistant.use',
                apiExposure: 'aiAssistant', key: '/confirmations', method: 'POST',
                controller: 'DefaultAiAssistantController', operation: 'createConfirmation',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.createConfirmationRequest } } },
                responses: { '200': { description: 'Bound mutation confirmation created' } }
            },
            approveConfirmation: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.assistant.use',
                apiExposure: 'aiAssistant', key: '/confirmations/:confirmationCode/approve', method: 'POST',
                controller: 'DefaultAiAssistantController', operation: 'approveConfirmation',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.approveConfirmationRequest } } },
                responses: { '200': { description: 'Confirmation approved and bound to immutable arguments' } }
            },
            executeConfirmation: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.assistant.use',
                apiExposure: 'aiAssistant', key: '/confirmations/:confirmationCode/execute', method: 'POST',
                controller: 'DefaultAiAssistantController', operation: 'executeConfirmation',
                requestBody: { required: false, content: { 'application/json': { schema: {
                    type: 'object', additionalProperties: false
                } } } },
                responses: { '200': { description: 'Confirmed operation executed or handed to Workflow' } }
            }
        }
    }
};
