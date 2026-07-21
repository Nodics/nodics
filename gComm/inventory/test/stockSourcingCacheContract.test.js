/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** Validates provider-neutral sourcing cache hits, misses, isolation, TTL boundaries, invalidation, fallback, and layered selection. */
const assert = require('assert');
const properties = require('../config/properties');
const inventory = properties.inventory;
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError };
global.CONFIG = { get: key => key === 'inventory' ? inventory : key === 'cache' ? properties.cache : undefined };
global.SERVICE = {};
SERVICE.DefaultInventoryEnterpriseScopeService = require('../src/service/foundation/defaultInventoryEnterpriseScopeService');
const cache = require('../src/service/sourcing/defaultStockSourcingCacheService');
const interceptors = require('../src/interceptors/interceptors');
const authData = { tokenType: 'service', enterprise: { code: 'enterpriseA' } };
let evaluations = 0; let getMode = 'miss'; let puts = []; let gets = []; let flushes = [];
SERVICE.DefaultStockSourcingEvaluationService = { evaluate: async request => {
    evaluations += 1; return { enterpriseCode: request.authData.enterprise.code, poolCodes: ['uae'], matchedRuleCodes: ['rule'],
        evaluatedAt: new Date().toISOString(), nextEffectiveAt: new Date(Date.now() + 5000).toISOString() };
} };
SERVICE.DefaultCacheService = {
    get: async options => { gets.push(options); if (getMode === 'hit') return { enterpriseCode: 'enterpriseA', poolCodes: ['cached'],
        matchedRuleCodes: ['cached-rule'], evaluatedAt: new Date().toISOString() }; throw Object.assign(new Error('miss'), { code: 'ERR_CACHE_00001' }); },
    put: async options => { puts.push(options); return { code: 'SUC_CACHE_00000' }; },
    flushCache: async options => { flushes.push(options); return { code: 'SUC_CACHE_00000' }; }
};

(async () => {
    let request = { tenant: 'tenantA', authData: authData, context: { channelCode: 'WEB', countryCode: 'AE' } };
    let first = await cache.evaluate(request); assert.deepStrictEqual(first.poolCodes, ['uae']); assert.strictEqual(evaluations, 1);
    assert.strictEqual(puts.length, 1); assert(puts[0].ttl > 0 && puts[0].ttl <= 5); assert.strictEqual(puts[0].tenant, 'tenantA');
    let reorderedKey = cache.buildKey('enterpriseA', { countryCode: 'AE', channelCode: 'WEB' });
    assert.strictEqual(gets[0].key, reorderedKey, 'Context insertion order must not change the key');
    assert.notStrictEqual(cache.buildKey('enterpriseA', request.context), cache.buildKey('enterpriseB', request.context));

    getMode = 'hit'; let hit = await cache.evaluate(request); assert.deepStrictEqual(hit.poolCodes, ['cached']); assert.strictEqual(evaluations, 1);
    getMode = 'failure'; SERVICE.DefaultCacheService.get = async () => { throw new Error('provider unavailable'); };
    await cache.evaluate(request); assert.strictEqual(evaluations, 2, 'Provider failure must fall back to direct evaluation');
    let beforeHistorical = gets.length; await cache.evaluate(Object.assign({}, request, { at: '2026-07-21T00:00:00.000Z' }));
    assert.strictEqual(evaluations, 3); assert.strictEqual(gets.length, beforeHistorical, 'Explicit evaluation time must bypass cache by default');

    await cache.invalidate({ tenant: 'tenantA', authData: authData }); assert.strictEqual(flushes.length, 1);
    assert.strictEqual(flushes[0].moduleName, 'inventory'); assert.strictEqual(flushes[0].channelName, 'sourcing');
    assert.strictEqual(flushes[0].prefix, 'stockSourcing:'); assert.strictEqual(flushes[0].internalCacheOperation, true);
    ['stockPoolPostSaveInvalidateSourcing', 'stockPoolPostUpdateInvalidateSourcing',
        'stockPoolMemberPostSaveInvalidateSourcing', 'stockPoolMemberPostUpdateInvalidateSourcing',
        'stockSourcingPolicyPostSaveInvalidate', 'stockSourcingPolicyPostUpdateInvalidate',
        'stockSourcingRulePostSaveInvalidate', 'stockSourcingRulePostUpdateInvalidate'].forEach(name => assert(interceptors[name]));

    assert.strictEqual(properties.cache.inventory.channels.sourcing.engine, 'local');
    properties.cache.inventory.channels.sourcing.engine = 'redis'; assert.strictEqual(properties.cache.inventory.channels.sourcing.engine, 'redis');
    properties.cache.inventory.channels.sourcing.engine = 'hazelcast'; assert.strictEqual(properties.cache.inventory.channels.sourcing.engine, 'hazelcast');
    properties.cache.inventory.channels.sourcing.engine = 'local';
    assert(!require('fs').readFileSync(require.resolve('../src/service/sourcing/defaultStockSourcingCacheService'), 'utf8')
        .includes('DefaultRedisCacheService'), 'Inventory must not call a provider directly');
    console.log('Inventory Stock Sourcing cache contract validated');
})().catch(error => { console.error(error); process.exit(1); });
