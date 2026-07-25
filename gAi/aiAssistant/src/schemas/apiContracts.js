/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiAssistant/src/schemas/apiContracts
 * @description Defines versioned AI Assistant conversation, streaming, and governed-tool API contracts.
 * @layer schema
 * @owner aiAssistant
 * @override Later modules may extend compatible enums and metadata while preserving authority and security invariants.
 */
const identifier = { type: 'string', pattern: '^[A-Za-z][A-Za-z0-9._-]{0,127}$' };
const context = {
    type: 'object',
    additionalProperties: false,
    required: ['tenant', 'principalId'],
    properties: {
        tenant: identifier,
        enterprise: identifier,
        project: identifier,
        principalId: { type: 'string', minLength: 1, maxLength: 256 },
        locale: { type: 'string', maxLength: 32 }
    }
};
const streamEvent = {
    type: 'object',
    additionalProperties: false,
    required: ['contractVersion', 'conversationId', 'turnId', 'eventId', 'eventType', 'createdAt'],
    properties: {
        contractVersion: { const: 1 },
        conversationId: identifier,
        turnId: identifier,
        eventId: identifier,
        eventType: {
            enum: ['TURN_ACCEPTED', 'STATUS', 'TEXT_DELTA', 'CLARIFICATION', 'TOOL_PLAN',
                'CONFIRMATION_REQUIRED', 'TOOL_STARTED', 'TOOL_RESULT', 'CITATIONS',
                'USAGE', 'COMPLETED', 'CANCELLED', 'FAILED']
        },
        sequence: { type: 'integer', minimum: 0 },
        createdAt: { type: 'string', format: 'date-time' },
        data: { type: 'object' }
    }
};

module.exports = {
    contractVersion: 1,
    context: context,
    createConversationRequest: {
        type: 'object',
        additionalProperties: false,
        required: ['definitionCode'],
        properties: {
            definitionCode: identifier,
            title: { type: 'string', minLength: 1, maxLength: 256 }
        }
    },
    submitTurnRequest: {
        type: 'object',
        additionalProperties: false,
        required: ['message', 'idempotencyKey'],
        properties: {
            message: { type: 'string', minLength: 1, maxLength: 32000 },
            idempotencyKey: { type: 'string', minLength: 8, maxLength: 256 },
            maximumOutputTokens: { type: 'integer', minimum: 1, maximum: 32000 },
            knowledge: {
                type: 'object',
                additionalProperties: false,
                required: ['corpusCode', 'audience', 'allowedClassifications', 'query'],
                properties: {
                    corpusCode: identifier,
                    audience: { type: 'string', minLength: 1, maxLength: 64 },
                    allowedClassifications: {
                        type: 'array', minItems: 1, uniqueItems: true,
                        items: { type: 'string', minLength: 1, maxLength: 64 }
                    },
                    mode: { enum: ['INDEXED', 'LIVE', 'HYBRID'] },
                    searchMode: { enum: ['LEXICAL', 'VECTOR', 'HYBRID'] },
                    locale: { type: 'string', maxLength: 32 },
                    query: { type: 'string', minLength: 1, maxLength: 8000 },
                    maximumResults: { type: 'integer', minimum: 1, maximum: 100 }
                }
            }
        }
    },
    createConfirmationRequest: {
        type: 'object', additionalProperties: false,
        required: ['conversationCode', 'operationId', 'arguments', 'idempotencyKey'],
        properties: {
            conversationCode: identifier, turnCode: identifier,
            operationId: { const: 'profile_createenterprise' },
            arguments: { type: 'object', additionalProperties: false, required: ['code', 'name'],
                properties: { code: identifier, name: { type: 'string', minLength: 1, maxLength: 256 },
                    tenantCode: identifier, superEnterpriseCode: identifier, active: { type: 'boolean' } } },
            workflowCode: identifier,
            idempotencyKey: { type: 'string', minLength: 8, maxLength: 256 }
        }
    },
    approveConfirmationRequest: {
        type: 'object', additionalProperties: false, required: ['expectedRevision', 'argumentsDigest'],
        properties: { expectedRevision: { type: 'integer', minimum: 0 },
            argumentsDigest: { type: 'string', pattern: '^[a-f0-9]{64}$' } }
    },
    cancelTurnRequest: {
        type: 'object',
        additionalProperties: false,
        properties: {
            reason: { type: 'string', minLength: 1, maxLength: 256 }
        }
    },
    startTurnRequest: {
        type: 'object',
        additionalProperties: false,
        required: ['contractVersion', 'message', 'context'],
        properties: {
            contractVersion: { const: 1 },
            conversationId: identifier,
            message: { type: 'string', minLength: 1, maxLength: 32000 },
            context: context,
            idempotencyKey: { type: 'string', minLength: 8, maxLength: 256 }
        }
    },
    streamEvent: streamEvent,
    toolContribution: {
        type: 'object',
        additionalProperties: false,
        required: ['contractVersion', 'toolId', 'ownerModule', 'operationId', 'mode', 'requiredPermissions'],
        properties: {
            contractVersion: { const: 1 },
            toolId: identifier,
            ownerModule: identifier,
            operationId: identifier,
            mode: { enum: ['READ', 'MUTATION', 'WORKFLOW'] },
            requiredPermissions: { type: 'array', uniqueItems: true, items: { type: 'string' } },
            inputSchema: { type: 'object' },
            outputSchema: { type: 'object' },
            confirmationRequired: { type: 'boolean' }
        }
    }
};
