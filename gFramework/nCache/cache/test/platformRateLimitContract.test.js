/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const service = require('../src/service/rate/defaultRateLimitService');
let calls = [];
global.SERVICE = {
    DefaultCacheEngineService: {
        getCacheEngine: () => ({ engineOptions: { distributed: true, atomicBoundedIncrement: true, capabilities: { distributed: true, atomicBoundedIncrement: true } } })
    },
    DefaultCacheService: {
        incrementBounded: options => {
            calls.push(options);
            return Promise.resolve({ allowed: calls.length < 2, value: 1, maximum: 1 });
        }
    }
};

(async () => {
    const input = { tenant: 'tenant-a', capability: 'kyc', operation: 'submit', identity: 'private-subject', limit: 1, windowSeconds: 60, requireDistributed: true };
    const accepted = await service.enforce(input);
    assert.strictEqual(accepted.distributed, true);
    assert.strictEqual(calls[0].key.includes('private-subject'), false, 'Raw identities must not be stored in counter keys');
    await assert.rejects(() => service.enforce(input), error => error.code === 'ERR_CACHE_00011');
    SERVICE.DefaultCacheEngineService.getCacheEngine = () => ({ engineOptions: { distributed: false, atomicBoundedIncrement: true, capabilities: { distributed: false, atomicBoundedIncrement: true } } });
    await assert.rejects(() => service.enforce(input), error => error.code === 'ERR_CACHE_00012');
    console.log('Platform rate limit contract tests passed');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
