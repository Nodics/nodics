/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiProviders/test/AiVendorAdapterConformanceContract
 * @description Verifies OpenAI, Anthropic, and Gemini translation against one normalized adapter contract.
 * @layer test
 * @owner aiProviders
 */
const assert = require('assert');
const contract = require('../src/service/adapter/defaultAiProviderAdapterContractService');
const openAi = require('../openAiProvider/src/service/defaultOpenAiProviderAdapterService');
const anthropic = require('../anthropicProvider/src/service/defaultAnthropicProviderAdapterService');
const gemini = require('../geminiProvider/src/service/defaultGeminiProviderAdapterService');

function response(value, status) {
    return Promise.resolve({
        ok: !status || status < 400, status: status || 200,
        text: () => Promise.resolve(JSON.stringify(value))
    });
}

const common = {
    model: 'test-model', credential: 'not-logged',
    request: { messages: [{ role: 'user', content: 'hello' }], maximumOutputTokens: 10 },
    providerConfiguration: { timeoutMs: 1000, maximumResponseBytes: 10000 },
    context: {}
};

contract.validate('openAi', openAi);
contract.validate('anthropic', anthropic);
contract.validate('gemini', gemini);

Promise.resolve()
    .then(() => openAi.generate(Object.assign({}, common, {
        providerConfiguration: Object.assign({}, common.providerConfiguration, { baseUrl: 'https://openai.test' }),
        context: {
            transport: (url, options) => {
                assert.strictEqual(url, 'https://openai.test/responses');
                assert.strictEqual(options.headers.authorization, 'Bearer not-logged');
                return response({
                    id: 'openai-1', model: 'test-model', status: 'completed',
                    output: [{ type: 'message', content: [{ type: 'output_text', text: 'openai' }] }],
                    usage: { input_tokens: 2, output_tokens: 1, input_tokens_details: { cached_tokens: 1 } }
                });
            }
        }
    })))
    .then(result => {
        assert.strictEqual(contract.normalizeResult(result).text, 'openai');
        return anthropic.generate(Object.assign({}, common, {
            providerConfiguration: Object.assign({}, common.providerConfiguration, {
                baseUrl: 'https://anthropic.test', apiVersion: '2023-06-01'
            }),
            context: {
                transport: (url, options) => {
                    assert.strictEqual(url, 'https://anthropic.test/messages');
                    assert.strictEqual(options.headers['x-api-key'], 'not-logged');
                    return response({
                        id: 'anthropic-1', model: 'test-model', stop_reason: 'end_turn',
                        content: [{ type: 'text', text: 'anthropic' }],
                        usage: { input_tokens: 2, output_tokens: 1 }
                    });
                }
            }
        }));
    })
    .then(result => {
        assert.strictEqual(contract.normalizeResult(result).text, 'anthropic');
        return gemini.generate(Object.assign({}, common, {
            providerConfiguration: Object.assign({}, common.providerConfiguration, {
                connectionMode: 'GEMINI_API', baseUrl: 'https://gemini.test'
            }),
            context: {
                transport: (url, options) => {
                    assert.strictEqual(url, 'https://gemini.test/models/test-model:generateContent');
                    assert.strictEqual(options.headers['x-goog-api-key'], 'not-logged');
                    return response({
                        responseId: 'gemini-1', modelVersion: 'test-model',
                        candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'gemini' }] } }],
                        usageMetadata: { promptTokenCount: 2, candidatesTokenCount: 1 }
                    });
                }
            }
        }));
    })
    .then(result => {
        assert.strictEqual(contract.normalizeResult(result).text, 'gemini');
        return assert.rejects(openAi.generate(Object.assign({}, common, {
            providerConfiguration: Object.assign({}, common.providerConfiguration, { baseUrl: 'https://openai.test' }),
            context: { transport: () => response({ error: 'limited' }, 429) }
        })), error => error.status === 429 && error.retryable === true);
    })
    .then(() => console.log('AI vendor adapter conformance contract validated'));
