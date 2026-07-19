/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/*
 * @module nCache/cache/test/cacheRuntimeLifecycleContract
 * @description Validates cache readiness and central shutdown contribution without requiring a live provider.
 * @layer test
 * @owner nCache/cache
 */
const assert = require('assert');

let lifecycleContributors = {};
let readinessContributors = {};
global.SERVICE = {
    DefaultRuntimeLifecycleService: { registerContributor: (name, value) => { lifecycleContributors[name] = value; } },
    DefaultHealthService: { registerReadinessContributor: (name, value) => { readinessContributors[name] = value; } }
};
const definition = require('../src/service/engine/defaultCacheEngineService');
let closed = 0;
let service = Object.assign({}, definition, {
    cacheClients: { cms: { data: {} } },
    engineClients: { cms: { redis: { isReady: true, quit: () => { closed++; return Promise.resolve(); } } } }
});

service.init();
assert(lifecycleContributors.cacheEngines, 'cache lifecycle contributor must be registered');
assert(readinessContributors.cacheEngines, 'cache readiness contributor must be registered');
assert.strictEqual(service.getCacheReadiness(), true);
service.engineClients.cms.redis.isReady = false;
assert.strictEqual(service.getCacheReadiness(), false);
service.engineClients.cms.redis.isReady = true;
lifecycleContributors.cacheEngines.shutdown().then(() => {
    assert.strictEqual(closed, 1);
    assert.deepStrictEqual(service.engineClients, {});
    console.log('Cache runtime lifecycle contract validated');
}).catch(error => { console.error(error); process.exit(1); });
