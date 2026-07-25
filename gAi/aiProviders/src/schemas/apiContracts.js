/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiProviders/src/schemas/apiContracts
 * @description Defines versioned provider-neutral generation, embedding, capability, result, and usage contracts.
 * @layer schema
 * @owner aiProviders
 * @override Later modules may extend compatible capabilities while preserving normalized caller isolation.
 */
const identifier = { type: 'string', pattern: '^[A-Za-z][A-Za-z0-9._-]{0,127}$' };
const usage = {
    type: 'object',
    additionalProperties: false,
    required: ['inputTokens', 'outputTokens'],
    properties: {
        inputTokens: { type: 'integer', minimum: 0 },
        outputTokens: { type: 'integer', minimum: 0 },
        cachedInputTokens: { type: 'integer', minimum: 0 },
        reasoningTokens: { type: 'integer', minimum: 0 },
        embeddingTokens: { type: 'integer', minimum: 0 }
    }
};

module.exports = {
    contractVersion: 1,
    capabilities: ['GENERATION', 'EMBEDDING', 'STREAMING', 'TOOL_CALLS', 'STRUCTURED_OUTPUT'],
    adapterRegistration: {
        type: 'object',
        additionalProperties: false,
        required: ['contractVersion', 'providerCode', 'adapterService', 'capabilities'],
        properties: {
            contractVersion: { const: 1 },
            providerCode: identifier,
            adapterService: identifier,
            capabilities: { type: 'array', uniqueItems: true, items: { type: 'string' } }
        }
    },
    generationRequest: {
        type: 'object',
        additionalProperties: false,
        required: ['messages'],
        properties: {
            messages: { type: 'array', minItems: 1, items: { type: 'object' } },
            tools: { type: 'array', items: { type: 'object' } },
            responseSchema: { type: 'object' },
            continuationState: { type: 'object' }
        }
    },
    generationResult: {
        type: 'object',
        additionalProperties: false,
        required: ['provider', 'model', 'finishReason', 'usage'],
        properties: {
            provider: identifier,
            model: { type: 'string', minLength: 1 },
            finishReason: { enum: ['STOP', 'LENGTH', 'TOOL_CALL', 'CONTENT_FILTER', 'CANCELLED', 'ERROR'] },
            text: { type: 'string' },
            toolCalls: { type: 'array', items: { type: 'object' } },
            continuationState: { type: 'object' },
            usage: usage
        }
    },
    embeddingRequest: {
        type: 'object',
        additionalProperties: false,
        required: ['inputs'],
        properties: {
            inputs: { type: 'array', minItems: 1, items: { type: 'string', minLength: 1 } }
        }
    },
    embeddingResult: {
        type: 'object',
        additionalProperties: false,
        required: ['provider', 'model', 'embeddings', 'usage'],
        properties: {
            provider: identifier,
            model: { type: 'string', minLength: 1 },
            embeddings: { type: 'array', items: { type: 'array', items: { type: 'number' } } },
            usage: usage
        }
    },
    usage: usage,
    tokenPlan: {
        type: 'object',
        additionalProperties: false,
        required: ['contractVersion', 'profileCode', 'provider', 'model', 'estimatedInputTokens',
            'reservedOutputTokens', 'estimatedCost', 'currencyCode', 'configurationRevision', 'pricingRevision'],
        properties: {
            contractVersion: { const: 1 },
            profileCode: identifier,
            provider: identifier,
            model: { type: 'string', minLength: 1 },
            estimatedInputTokens: { type: 'integer', minimum: 0 },
            reservedOutputTokens: { type: 'integer', minimum: 0 },
            estimatedCost: { type: 'string', pattern: '^(0|[1-9][0-9]*)(\\.[0-9]+)?$' },
            currencyCode: { type: 'string', pattern: '^[A-Z]{3}$' },
            configurationRevision: { type: 'string', minLength: 1 },
            pricingRevision: { type: 'string', minLength: 1 },
            pricingEffectiveAt: { type: 'string', format: 'date-time' },
            pricingExpiresAt: { type: 'string', format: 'date-time' },
            optimizations: { type: 'array', uniqueItems: true, items: { type: 'string' } }
        }
    },
    tokenReservation: {
        type: 'object',
        additionalProperties: false,
        required: ['reservationId', 'idempotencyKey', 'state', 'tokenPlan', 'reservedAt'],
        properties: {
            reservationId: identifier,
            idempotencyKey: { type: 'string', minLength: 8, maxLength: 256 },
            state: { enum: ['PENDING', 'RESERVED', 'RECONCILING', 'RECONCILED', 'RELEASING',
                'RELEASED', 'UNCERTAIN', 'EXPIRED', 'REJECTED'] },
            tokenPlan: { type: 'object' },
            reservedAt: { type: 'string', format: 'date-time' },
            reconciledAt: { type: 'string', format: 'date-time' }
        }
    },
    usageReconciliation: {
        type: 'object',
        additionalProperties: false,
        required: ['reservationId', 'actualUsage', 'actualCost', 'currencyCode', 'state'],
        properties: {
            reservationId: identifier,
            actualUsage: usage,
            actualCost: { type: 'string', pattern: '^(0|[1-9][0-9]*)(\\.[0-9]+)?$' },
            currencyCode: { type: 'string', pattern: '^[A-Z]{3}$' },
            state: { enum: ['RECONCILED', 'OVERAGE'] }
        }
    }
};
