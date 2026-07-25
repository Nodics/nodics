/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiProviders/service/adapter/DefaultAiProviderAdapterContractService
 * @description Validates and normalizes provider adapters without exposing vendor contracts to callers.
 * @layer service
 * @owner aiProviders
 * @override Projects may extend normalized capabilities while preserving provider isolation and usage evidence.
 */
module.exports = {
    /** Validates one adapter registration against the provider-neutral port. */
    validate: function (providerCode, adapter) {
        if (!providerCode || !adapter || !Array.isArray(adapter.capabilities) || !adapter.capabilities.length) {
            throw new Error('AI provider registration requires providerCode and capabilities');
        }
        adapter.capabilities.forEach(capability => {
            if (!['GENERATION', 'EMBEDDING'].includes(capability)) {
                throw new Error('Unsupported AI provider capability: ' + capability);
            }
        });
        if (typeof adapter.estimateTokens !== 'function') {
            throw new Error('AI provider adapter requires token estimation');
        }
        if (adapter.capabilities.includes('GENERATION') && typeof adapter.generate !== 'function') {
            throw new Error('Generation adapter requires generate');
        }
        if (adapter.capabilities.includes('EMBEDDING') && typeof adapter.embed !== 'function') {
            throw new Error('Embedding adapter requires embed');
        }
        return true;
    },

    /** Creates a normalized safe integer usage object. */
    normalizeUsage: function (usage) {
        const source = usage || {};
        const normalized = {
            inputTokens: Number(source.inputTokens || 0),
            outputTokens: Number(source.outputTokens || 0),
            cachedInputTokens: Number(source.cachedInputTokens || 0),
            reasoningTokens: Number(source.reasoningTokens || 0),
            embeddingTokens: Number(source.embeddingTokens || 0)
        };
        Object.keys(normalized).forEach(key => {
            if (!Number.isSafeInteger(normalized[key]) || normalized[key] < 0) {
                throw new Error('AI provider returned invalid normalized usage: ' + key);
            }
        });
        return Object.freeze(normalized);
    },

    /** Validates the normalized result returned by every adapter. */
    normalizeResult: function (result) {
        if (!result || !result.id || !result.model) throw new Error('AI provider result requires id and model');
        const output = {
            id: String(result.id),
            model: String(result.model),
            finishReason: result.finishReason || 'COMPLETED',
            text: result.text === undefined ? '' : String(result.text),
            toolCalls: Array.isArray(result.toolCalls) ? result.toolCalls : [],
            embeddings: Array.isArray(result.embeddings) ? result.embeddings : undefined,
            usage: this.normalizeUsage(result.usage),
            providerRequestId: result.providerRequestId ? String(result.providerRequestId) : String(result.id)
        };
        return Object.freeze(output);
    }
};
