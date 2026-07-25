/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiProviders/test/AiProviderErrorObservabilityContract
 * @description Verifies safe provider failure normalization without raw response or credential leakage.
 * @layer test
 * @owner aiProviders
 */
const assert = require('assert');
const errorService = require('../src/service/observability/defaultAiProviderErrorService');
const transportService = require('../src/service/adapter/defaultAiProviderHttpTransportService');

function providerError(status, providerErrorCode) {
    const error = new Error('sensitive provider message must not survive');
    error.status = status;
    error.providerErrorCode = providerErrorCode;
    return error;
}

const cases = [
    [providerError(429, 'insufficient_quota'), 'AI_PROVIDER_QUOTA_EXCEEDED', 'QUOTA', false],
    [providerError(401), 'AI_PROVIDER_AUTHENTICATION_FAILED', 'AUTHENTICATION', false],
    [providerError(429, 'rate_limit_exceeded'), 'AI_PROVIDER_RATE_LIMITED', 'RATE_LIMIT', true],
    [providerError(503), 'AI_PROVIDER_UNAVAILABLE', 'UNAVAILABLE', true],
    [Object.assign(new Error('timeout'), { transportFailureType: 'TIMEOUT' }),
        'AI_PROVIDER_TIMEOUT', 'TIMEOUT', true],
    [Object.assign(new Error('bad JSON'), { transportFailureType: 'RESPONSE_INVALID' }),
        'AI_PROVIDER_RESPONSE_INVALID', 'RESPONSE', false]
];

cases.forEach(testCase => {
    const normalized = errorService.normalize(testCase[0], { providerInvocationStarted: true });
    assert.strictEqual(normalized.code, testCase[1]);
    assert.strictEqual(normalized.providerDiagnostics.category, testCase[2]);
    assert.strictEqual(normalized.retryable, testCase[3]);
    assert.strictEqual(normalized.message.includes('sensitive'), false);
    assert.deepStrictEqual(Object.keys(errorService.diagnostics(normalized)).sort(),
        ['category', 'retryable', 'status']);
});

const internal = new Error('AI token ledger reservation authority is unavailable');
assert.strictEqual(errorService.normalize(internal, { providerInvocationStarted: false }), internal);
const customRetryable = errorService.normalize(Object.assign(new Error('custom adapter failure'), {
    retryable: true
}), { providerInvocationStarted: true });
assert.strictEqual(customRetryable.code, 'AI_PROVIDER_REQUEST_FAILED');
assert.strictEqual(customRetryable.retryable, true);

Promise.resolve(transportService.request({
    url: 'https://provider.invalid/v1/generate',
    headers: { authorization: 'Bearer must-never-appear' },
    body: {},
    timeoutMs: 100,
    maximumResponseBytes: 1024,
    transport: () => Promise.resolve({
        ok: false,
        status: 429,
        text: () => Promise.resolve(JSON.stringify({
            error: {
                code: 'insufficient_quota',
                message: 'raw provider billing and account detail'
            }
        }))
    })
})).then(() => {
    throw new Error('Expected provider transport failure');
}).catch(error => {
    assert.strictEqual(error.status, 429);
    assert.strictEqual(error.providerErrorCode, 'insufficient_quota');
    assert.strictEqual(error.message.includes('billing'), false);
    assert.strictEqual(JSON.stringify(error).includes('must-never-appear'), false);
    console.log('AI provider error observability contract validated');
});
