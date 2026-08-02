/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module openAiProvider/service/DefaultOpenAiProviderAdapterService
 * @description Translates normalized generation requests to OpenAI Responses API contracts.
 * @layer service
 * @owner openAiProvider
 * @override Projects may replace protocol translation while preserving the parent adapter port.
 */
const transportService = require('../../../src/service/adapter/defaultAiProviderHttpTransportService');

function textSize(request) {
    return Buffer.byteLength(JSON.stringify(request || {}), 'utf8');
}

module.exports = {
    capabilities: ['GENERATION'],
    /** Provides conservative preflight estimation until a project supplies a tokenizer. */
    estimateTokens: function (input) {
        return {
            inputTokens: Math.ceil(textSize(input.request) / 3),
            requestedOutputTokens: Number(input.request.maximumOutputTokens || 0),
            cachedInputTokens: 0,
            embeddingTokens: 0,
            estimator: 'CONSERVATIVE_UTF8'
        };
    },
    /** Invokes OpenAI and normalizes completed response and usage evidence. */
    generate: async function (input) {
        const config = input.providerConfiguration;
        const body = {
            model: input.model,
            input: input.request.messages || input.request.input,
            instructions: input.request.instructions,
            tools: input.request.tools,
            max_output_tokens: input.request.maximumOutputTokens,
            store: false
        };
        const streaming = typeof input.context.onProviderEvent === 'function';
        if (streaming) body.stream = true;
        const response = await transportService.request({
            url: config.baseUrl + '/responses',
            headers: { 'content-type': 'application/json', authorization: 'Bearer ' + input.credential },
            body: body,
            timeoutMs: config.timeoutMs,
            maximumResponseBytes: config.maximumResponseBytes,
            signal: input.context.signal,
            transport: input.context.transport,
            sse: streaming,
            onSseEvent: streaming ? event => {
                if (event.type === 'response.output_text.delta') {
                    return input.context.onProviderEvent({ type: 'TEXT_DELTA', text: event.delta || '' });
                }
            } : undefined
        });
        if (streaming) {
            const completed = response.find(event => event.type === 'response.completed');
            if (!completed || !completed.response) throw new Error('OpenAI stream ended without a completed response');
            return this.normalize(completed.response, input);
        }
        return this.normalize(response, input);
    },
    /** Normalizes one completed OpenAI response object. */
    normalize: function (response, input) {
        const output = response.output || [];
        const text = output.flatMap(item => item.content || []).filter(item => item.type === 'output_text')
            .map(item => item.text).join('');
        const toolCalls = output.filter(item => item.type === 'function_call').map(item => ({
            id: item.call_id || item.id, name: item.name, arguments: item.arguments
        }));
        const usage = response.usage || {};
        return {
            id: response.id, providerRequestId: response.id, model: response.model || input.model,
            text: text, toolCalls: toolCalls, finishReason: response.status || 'COMPLETED',
            usage: {
                inputTokens: usage.input_tokens || 0,
                outputTokens: usage.output_tokens || 0,
                cachedInputTokens: usage.input_tokens_details && usage.input_tokens_details.cached_tokens || 0,
                reasoningTokens: usage.output_tokens_details && usage.output_tokens_details.reasoning_tokens || 0
            }
        };
    },
    /** Retrieves positive OpenAI response usage for uncertain-ledger repair. */
    lookupUsage: async function (input) {
        const response = await transportService.request({
            method: 'GET',
            url: input.providerConfiguration.baseUrl +
                '/responses/' + encodeURIComponent(input.providerRequestId),
            headers: { authorization: 'Bearer ' + input.credential },
            timeoutMs: input.providerConfiguration.timeoutMs,
            maximumResponseBytes: input.providerConfiguration.maximumResponseBytes,
            signal: input.context.signal, transport: input.context.transport
        });
        if (!response || !response.usage) return { found: false };
        return {
            found: true, providerRequestId: response.id,
            usage: this.normalize(response, {
                model: response.model || input.model
            }).usage
        };
    }
};
