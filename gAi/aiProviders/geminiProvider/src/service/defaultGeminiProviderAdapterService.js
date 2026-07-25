/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module geminiProvider/service/DefaultGeminiProviderAdapterService
 * @description Translates normalized requests to Gemini API or Vertex AI generateContent contracts.
 * @layer service
 * @owner geminiProvider
 * @override Projects may replace Google protocol translation while preserving the parent adapter port.
 */
const transportService = require('../../../src/service/adapter/defaultAiProviderHttpTransportService');

function contents(messages) {
    return (messages || []).map(message => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(message.content || '') }]
    }));
}

module.exports = {
    capabilities: ['GENERATION', 'EMBEDDING'],
    /** Provides conservative estimation for generation and embedding requests. */
    estimateTokens: function (input) {
        const tokens = Math.ceil(Buffer.byteLength(JSON.stringify(input.request || {}), 'utf8') / 3);
        return {
            inputTokens: input.operation === 'embed' ? 0 : tokens,
            requestedOutputTokens: input.operation === 'embed' ? 0 : Number(input.request.maximumOutputTokens || 0),
            cachedInputTokens: 0,
            embeddingTokens: input.operation === 'embed' ? tokens : 0,
            estimator: 'CONSERVATIVE_UTF8'
        };
    },
    /** Builds the configured Gemini API or Vertex AI endpoint and authentication. */
    endpoint: function (input, operation) {
        const config = input.providerConfiguration;
        if (config.connectionMode === 'VERTEX') {
            return {
                url: config.vertexBaseUrl + '/projects/' + encodeURIComponent(config.projectId) +
                    '/locations/' + encodeURIComponent(config.location) + '/publishers/google/models/' +
                    encodeURIComponent(input.model) + ':' + operation,
                headers: { authorization: 'Bearer ' + input.credential, 'content-type': 'application/json' }
            };
        }
        return {
            url: (config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta') +
                '/models/' + encodeURIComponent(input.model) + ':' + operation,
            headers: { 'x-goog-api-key': input.credential, 'content-type': 'application/json' }
        };
    },
    /** Invokes Google generation and normalizes response usage. */
    generate: async function (input) {
        const streaming = typeof input.context.onProviderEvent === 'function';
        const endpoint = this.endpoint(input, streaming ? 'streamGenerateContent?alt=sse' : 'generateContent');
        const response = await transportService.request({
            url: endpoint.url, headers: endpoint.headers,
            body: {
                contents: contents(input.request.messages),
                systemInstruction: input.request.instructions ?
                    { parts: [{ text: input.request.instructions }] } : undefined,
                tools: input.request.tools,
                generationConfig: { maxOutputTokens: input.request.maximumOutputTokens }
            },
            timeoutMs: input.providerConfiguration.timeoutMs,
            maximumResponseBytes: input.providerConfiguration.maximumResponseBytes,
            signal: input.context.signal, transport: input.context.transport, sse: streaming,
            onSseEvent: streaming ? chunk => {
                const parts = chunk.candidates && chunk.candidates[0] &&
                    chunk.candidates[0].content && chunk.candidates[0].content.parts || [];
                const delta = parts.filter(part => part.text).map(part => part.text).join('');
                if (delta) return input.context.onProviderEvent({ type: 'TEXT_DELTA', text: delta });
            } : undefined
        });
        if (streaming) {
            let text = '';
            let finalResponse;
            response.forEach(chunk => {
                const parts = chunk.candidates && chunk.candidates[0] &&
                    chunk.candidates[0].content && chunk.candidates[0].content.parts || [];
                const delta = parts.filter(part => part.text).map(part => part.text).join('');
                if (delta) {
                    text += delta;
                }
                finalResponse = chunk;
            });
            if (!finalResponse) throw new Error('Gemini stream ended without a response');
            const candidate = finalResponse.candidates && finalResponse.candidates[0] || {};
            finalResponse = Object.assign({}, finalResponse, {
                candidates: [Object.assign({}, candidate, { content: { parts: [{ text: text }] } })]
            });
            return this.normalizeGeneration(finalResponse, input);
        }
        return this.normalizeGeneration(response, input);
    },
    /** Normalizes one completed Gemini generation response. */
    normalizeGeneration: function (response, input) {
        const parts = response.candidates && response.candidates[0] &&
            response.candidates[0].content && response.candidates[0].content.parts || [];
        const usage = response.usageMetadata || {};
        return {
            id: response.responseId, providerRequestId: response.responseId,
            model: response.modelVersion || input.model,
            text: parts.filter(part => part.text).map(part => part.text).join(''),
            toolCalls: parts.filter(part => part.functionCall).map((part, index) => ({
                id: response.responseId + ':' + index,
                name: part.functionCall.name, arguments: part.functionCall.args
            })),
            finishReason: response.candidates && response.candidates[0] &&
                response.candidates[0].finishReason || 'COMPLETED',
            usage: {
                inputTokens: usage.promptTokenCount || 0,
                outputTokens: usage.candidatesTokenCount || 0,
                cachedInputTokens: usage.cachedContentTokenCount || 0,
                reasoningTokens: usage.thoughtsTokenCount || 0
            }
        };
    },
    /** Invokes Google embedding and normalizes vector plus usage evidence. */
    embed: async function (input) {
        const endpoint = this.endpoint(input, 'embedContent');
        const response = await transportService.request({
            url: endpoint.url, headers: endpoint.headers,
            body: { content: { parts: [{ text: String(input.request.text || '') }] } },
            timeoutMs: input.providerConfiguration.timeoutMs,
            maximumResponseBytes: input.providerConfiguration.maximumResponseBytes,
            signal: input.context.signal, transport: input.context.transport
        });
        const estimate = await this.estimateTokens({ operation: 'embed', request: input.request });
        return {
            id: response.responseId || input.context.requestId,
            providerRequestId: response.responseId || input.context.requestId,
            model: input.model, embeddings: [response.embedding && response.embedding.values || []],
            usage: { embeddingTokens: estimate.embeddingTokens }
        };
    }
};
