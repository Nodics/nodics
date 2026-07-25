/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module anthropicProvider/service/DefaultAnthropicProviderAdapterService
 * @description Translates normalized generation requests to Anthropic Messages API contracts.
 * @layer service
 * @owner anthropicProvider
 * @override Projects may replace protocol translation while preserving the parent adapter port.
 */
const transportService = require('../../../src/service/adapter/defaultAiProviderHttpTransportService');

module.exports = {
    capabilities: ['GENERATION'],
    /** Provides a conservative UTF-8 estimator before provider invocation. */
    estimateTokens: function (input) {
        return {
            inputTokens: Math.ceil(Buffer.byteLength(JSON.stringify(input.request || {}), 'utf8') / 3),
            requestedOutputTokens: Number(input.request.maximumOutputTokens || 0),
            cachedInputTokens: 0, embeddingTokens: 0, estimator: 'CONSERVATIVE_UTF8'
        };
    },
    /** Invokes Anthropic Messages and normalizes content, tool calls, and usage. */
    generate: async function (input) {
        const config = input.providerConfiguration;
        const streaming = typeof input.context.onProviderEvent === 'function';
        const response = await transportService.request({
            url: config.baseUrl + '/messages',
            headers: {
                'content-type': 'application/json', 'x-api-key': input.credential,
                'anthropic-version': config.apiVersion
            },
            body: {
                model: input.model, messages: input.request.messages,
                system: input.request.instructions,
                tools: input.request.tools,
                max_tokens: input.request.maximumOutputTokens,
                stream: streaming
            },
            timeoutMs: config.timeoutMs,
            maximumResponseBytes: config.maximumResponseBytes,
            signal: input.context.signal,
            transport: input.context.transport,
            sse: streaming,
            onSseEvent: streaming ? event => {
                if (event.type === 'content_block_delta' && event.delta && event.delta.type === 'text_delta') {
                    return input.context.onProviderEvent({ type: 'TEXT_DELTA', text: event.delta.text || '' });
                }
            } : undefined
        });
        if (streaming) {
            let text = '';
            let usage = {};
            let message;
            response.forEach(event => {
                if (event.type === 'message_start') {
                    message = event.message;
                    usage = event.message && event.message.usage || usage;
                }
                if (event.type === 'content_block_delta' && event.delta && event.delta.type === 'text_delta') {
                    text += event.delta.text || '';
                }
                if (event.type === 'message_delta') usage = Object.assign({}, usage, event.usage || {});
            });
            return this.normalize(Object.assign({}, message, { content: [{ type: 'text', text: text }], usage: usage }), input);
        }
        return this.normalize(response, input);
    },
    /** Normalizes one completed Anthropic message. */
    normalize: function (response, input) {
        const content = response.content || [];
        const usage = response.usage || {};
        return {
            id: response.id, providerRequestId: response.id, model: response.model || input.model,
            text: content.filter(item => item.type === 'text').map(item => item.text).join(''),
            toolCalls: content.filter(item => item.type === 'tool_use').map(item => ({
                id: item.id, name: item.name, arguments: item.input
            })),
            finishReason: response.stop_reason || 'COMPLETED',
            usage: {
                inputTokens: usage.input_tokens || 0,
                outputTokens: usage.output_tokens || 0,
                cachedInputTokens: usage.cache_read_input_tokens || 0
            }
        };
    }
};
