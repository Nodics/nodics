/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/test/storefrontContextAccessPerformanceContract
 * @description Benchmarks context lifecycle operations and validates refresh, revoke, bulk-revoke, outage, recovery, and audit-sampling races.
 * @layer test
 * @owner storefront
 * @override Environments may tighten property-backed budgets after representative provider and topology capacity tests.
 */
const assert = require('assert');
const properties = require('../config/properties');
const service = require('../src/service/defaultStorefrontContextAccessService');
const audit = Object.assign({}, require('../src/service/defaultStorefrontContextAuditService'), { LOG: { info: () => {}, warn: () => {} } });
const values = new Map(), auditEvents = [];
global.CONFIG = { get: name => name === 'storefront' ? properties.storefront : {} };
global.SERVICE = {
    DefaultStorefrontEnterpriseScopeService: { error: (code, message) => Object.assign(new Error(message), { code: code }) },
    DefaultStorefrontContextAuditService: { record: event => { auditEvents.push(event); return Promise.resolve(true); } },
    DefaultCacheService: {
        put: options => { values.set(options.key, options.value); return Promise.resolve(true); },
        get: options => values.has(options.key) ? Promise.resolve(values.get(options.key)) : Promise.reject(Object.assign(new Error('miss'), { code: 'ERR_CACHE_00001' })),
        consume: options => { let value = values.get(options.key); values.delete(options.key); return Promise.resolve(value); },
        flushCache: options => { options.keys.forEach(key => values.delete(key)); return Promise.resolve(true); }
    }
};
const resolved = { _authority: { tenantCode: 'tenantA', enterpriseCode: 'enterpriseA' }, storefrontCode: 'electronics',
    downstream: { product: { catalogCode: 'electronicsProduct' } } };
const elapsed = async function (executor) { let start = process.hrtime.bigint(); await executor(); return Number(process.hrtime.bigint() - start) / 1000000; };
(async () => {
    service.lifecycleMetrics = { issued: 0, refreshed: 0, revoked: 0, bulkRevoked: 0, rejected: 0 };
    service._issueAuditSequence = 0;
    let budget = properties.storefront.contextAccess.performance, iterations = Number(budget.iterations), handles = [], rotated = [];
    let issueMs = await elapsed(async () => { for (let index = 0; index < iterations; index += 1) handles.push((await service.issue(resolved)).handle); });
    let introspectionMs = await elapsed(async () => { for (let handle of handles) assert.strictEqual((await service.introspect({
        authData: { tokenType: 'service' }, body: { handle: handle, audience: 'product' } })).active, true); });
    let refreshMs = await elapsed(async () => { for (let handle of handles) rotated.push((await service.refresh({ body: { handle: handle } })).handle); });
    let revokeMs = await elapsed(async () => { for (let handle of rotated) await service.revoke({ authData: { tokenType: 'service' }, body: { handle: handle } }); });
    let bulkMs = await elapsed(async () => { for (let index = 0; index < iterations; index += 1) await service.revokeScope({
        tenantCode: 'tenantA', enterpriseCode: 'enterpriseA', storefrontCode: 'electronics' }); });
    let auditPolicy = properties.storefront.contextAccess.audit;
    let previousRate = auditPolicy.issueSuccessSampleRate;
    auditPolicy.issueSuccessSampleRate = 0.1;
    service._issueAuditSequence = 0;
    auditEvents.length = 0;
    let auditMs = await elapsed(async () => { for (let index = 0; index < iterations; index += 1) service.audit({}, {
        eventType: 'storefront.context.issued', operation: 'issue', outcome: 'success' }); });
    assert.strictEqual(auditEvents.length, Math.floor(iterations / 10));
    service.audit({}, { eventType: 'storefront.context.revoked', operation: 'revoke', outcome: 'failure' });
    assert.strictEqual(auditEvents.length, Math.floor(iterations / 10) + 1, 'security failures must never be sampled');
    auditPolicy.issueSuccessSampleRate = previousRate;
    assert(issueMs <= Number(budget.maximumIssueBatchMs));
    assert(introspectionMs <= Number(budget.maximumIntrospectionBatchMs));
    assert(refreshMs <= Number(budget.maximumRefreshBatchMs));
    assert(revokeMs <= Number(budget.maximumIndividualRevokeBatchMs));
    assert(bulkMs <= Number(budget.maximumBulkRevokeBatchMs));
    assert(auditMs <= Number(budget.maximumAuditBatchMs));

    let race = await service.issue(resolved);
    let refreshRace = await Promise.allSettled([service.refresh({ body: { handle: race.handle } }), service.refresh({ body: { handle: race.handle } })]);
    assert.strictEqual(refreshRace.filter(result => result.status === 'fulfilled').length, 1);
    assert.strictEqual(refreshRace.filter(result => result.status === 'rejected').length, 1);
    let revokeRace = await service.issue(resolved);
    await Promise.allSettled([service.introspect({ authData: { tokenType: 'service' }, body: { handle: revokeRace.handle, audience: 'product' } }),
        service.revoke({ authData: { tokenType: 'service' }, body: { handle: revokeRace.handle } })]);
    assert.strictEqual((await service.introspect({ authData: { tokenType: 'service' }, body: { handle: revokeRace.handle, audience: 'product' } })).active, false);
    let outageHandle = await service.issue(resolved), originalGet = SERVICE.DefaultCacheService.get;
    SERVICE.DefaultCacheService.get = () => Promise.reject(new Error('provider unavailable'));
    assert.strictEqual((await service.introspect({ authData: { tokenType: 'service' }, body: { handle: outageHandle.handle, audience: 'product' } })).active, false);
    SERVICE.DefaultCacheService.get = originalGet;
    assert.strictEqual((await service.introspect({ authData: { tokenType: 'service' }, body: { handle: outageHandle.handle, audience: 'product' } })).active, true);
    let event = await audit.record({ eventType: 'storefront.context.performance', outcome: 'success', handle: 'forbidden' });
    assert.strictEqual(event.handle, undefined);
    console.log('Storefront context access performance validated: iterations=' + iterations + ', issueMs=' + issueMs.toFixed(3) +
        ', introspectionMs=' + introspectionMs.toFixed(3) + ', refreshMs=' + refreshMs.toFixed(3) + ', revokeMs=' + revokeMs.toFixed(3) +
        ', bulkMs=' + bulkMs.toFixed(3) + ', auditMs=' + auditMs.toFixed(3));
})().catch(error => { console.error(error); process.exitCode = 1; });
