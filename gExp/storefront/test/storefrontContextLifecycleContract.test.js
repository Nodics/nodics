/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/test/storefrontContextLifecycleContract
 * @description Validates one-time rotation, explicit revocation, optional binding, fail-closed cache behavior, and service-identity separation.
 * @layer test
 * @owner storefront
 */
const assert = require('assert');
const service = require('../src/service/defaultStorefrontContextAccessService');
const interceptors = require('../src/interceptors/interceptors');
const policy = { enabled: true, headerName: 'x-nodics-storefront-context', moduleName: 'storefront',
    channelName: 'contextAccess', keyPrefix: 'storefrontContextAccess:', ttlSeconds: 120, tokenBytes: 32,
    maximumHandleLength: 256, binding: { enabled: true, headerName: 'x-nodics-storefront-binding', minimumLength: 32, maximumLength: 256 },
    audiences: ['product'] };
const values = new Map();
const auditEvents = [];
global.CONFIG = { get: name => name === 'storefront' ? { contextResolution: { defaultTenant: 'default' }, contextAccess: policy } : {} };
global.SERVICE = {
    DefaultStorefrontContextAuditService: { record: event => { auditEvents.push(event); return Promise.resolve(true); } },
    DefaultStorefrontEnterpriseScopeService: {
        error: (code, message) => Object.assign(new Error(message), { code: code }),
        validateBusinessCode: value => value
    },
    DefaultStorefrontManagementService: {
        authorize: request => {
            if (!request.authData || request.authData.tokenType !== 'access') throw Object.assign(new Error('human required'), { code: 'ERR_STOREFRONT_00011' });
            return request.authData.enterpriseCode;
        }
    },
    DefaultCacheService: {
        put: options => { values.set(options.key, options.value); return Promise.resolve(true); },
        get: options => values.has(options.key) ? Promise.resolve(values.get(options.key)) : Promise.reject(Object.assign(new Error('miss'), { code: 'ERR_CACHE_00001' })),
        consume: options => { let value = values.get(options.key); values.delete(options.key); return Promise.resolve(value); },
        flushCache: options => { options.keys.forEach(key => values.delete(key)); return Promise.resolve(true); }
    }
};
(async () => {
    assert.strictEqual(interceptors.storefrontPreUpdateRevokeContextAccess.trigger, 'preUpdate');
    assert.strictEqual(interceptors.storefrontPreUpdateRevokeContextAccess.handler, 'DefaultStorefrontContextAccessService.revokeForLifecycle');
    const binding = 'browser-generated-binding-value-0001';
    const wrongBinding = 'browser-generated-binding-value-0002';
    const resolved = { _authority: { tenantCode: 'tenantA', enterpriseCode: 'enterpriseA' }, storefrontCode: 'electronics',
        downstream: { product: { catalogCode: 'electronicsProduct' } } };
    await assert.rejects(service.issue(resolved, { headers: {} }), error => error.code === 'ERR_STOREFRONT_00017');
    const access = await service.issue(resolved, { headers: { 'x-nodics-storefront-binding': binding } });
    assert.strictEqual((await service.introspect({ authData: { tokenType: 'service' },
        body: { handle: access.handle, audience: 'product', binding: wrongBinding } })).active, false);
    assert.strictEqual((await service.introspect({ authData: { tokenType: 'service' },
        body: { handle: access.handle, audience: 'product', binding: binding } })).active, true);
    await assert.rejects(service.refresh({ body: { handle: access.handle, binding: wrongBinding } }),
        error => error.code === 'ERR_STOREFRONT_00018');
    assert.strictEqual(values.has(service.key(access.handle)), true, 'wrong binding must not revoke a valid handle');
    const second = await service.issue(resolved, { headers: { 'x-nodics-storefront-binding': binding } });
    const rotated = await service.refresh({ body: { handle: second.handle, binding: binding } });
    assert.notStrictEqual(rotated.handle, second.handle);
    await assert.rejects(service.refresh({ body: { handle: second.handle, binding: binding } }),
        error => error.code === 'ERR_STOREFRONT_00018');
    await service.revoke({ authData: { tokenType: 'service' }, body: { handle: rotated.handle, reason: 'incident' } });
    assert.strictEqual((await service.introspect({ authData: { tokenType: 'service' },
        body: { handle: rotated.handle, audience: 'product', binding: binding } })).active, false);
    const bulkCandidate = await service.issue(resolved, { headers: { 'x-nodics-storefront-binding': binding } });
    await service.revokeStorefront({ tenant: 'tenantA', authData: { tokenType: 'access', enterpriseCode: 'enterpriseA' },
        body: { storefrontCode: 'electronics', reason: 'security incident' } });
    assert.strictEqual((await service.introspect({ authData: { tokenType: 'service' },
        body: { handle: bulkCandidate.handle, audience: 'product', binding: binding } })).active, false);
    await assert.rejects(service.revokeStorefront({ tenant: 'tenantA', authData: { tokenType: 'service' },
        body: { storefrontCode: 'electronics' } }), error => error.code === 'ERR_STOREFRONT_00011');
    const lifecycleCandidate = await service.issue(resolved, { headers: { 'x-nodics-storefront-binding': binding } });
    await service.revokeForLifecycle({ tenant: 'tenantA', authData: { enterpriseCode: 'enterpriseA' },
        query: { enterpriseCode: 'enterpriseA', storefrontCode: 'electronics' }, model: { status: 'SUSPENDED' } });
    assert.strictEqual((await service.introspect({ authData: { tokenType: 'service' },
        body: { handle: lifecycleCandidate.handle, audience: 'product', binding: binding } })).active, false);
    assert(service.diagnostics().issued >= 5 && service.diagnostics().refreshed >= 1 && service.diagnostics().revoked >= 1 &&
        service.diagnostics().bulkRevoked >= 2);
    assert(auditEvents.some(event => event.eventType === 'storefront.context.issued'));
    assert(auditEvents.some(event => event.eventType === 'storefront.context.refresh' && event.outcome === 'rejected'));
    assert(auditEvents.some(event => event.eventType === 'storefront.context.revoked'));
    assert(auditEvents.some(event => event.eventType === 'storefront.context.bulk-revoked' && event.reasonCode === 'OPERATOR_REQUEST'));
    assert(auditEvents.some(event => event.reasonCode === 'LIFECYCLE_SUSPENDED'));
    assert(auditEvents.every(event => event.handle === undefined && event.binding === undefined && event.generation === undefined));
    console.log('Storefront context lifecycle contract validated');
})().catch(error => { console.error(error); process.exitCode = 1; });
