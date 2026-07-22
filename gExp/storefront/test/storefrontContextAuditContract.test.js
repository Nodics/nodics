/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/test/storefrontContextAuditContract
 * @description Validates lifecycle evidence redaction, optional audit and NEMS delegation, fail-open delivery, and sanitized diagnostics.
 * @layer test
 * @owner storefront
 */
const assert = require('assert');
const policy = { enabled: true, publisherService: 'EvidencePublisher', events: { enabled: true,
    publisherService: 'EventPublisher', eventName: 'storefront.context.lifecycle', target: 'storefront', type: 'ASYNC' } };
global.CONFIG = { get: name => name === 'storefront' ? { contextResolution: { defaultTenant: 'default' }, contextAccess: { audit: policy } } : {} };
global.NODICS = { getNodeName: () => 'nodeA' };
global.ENUMS = { TargetType: { MODULE: { key: 'MODULE' } } };
const persisted = [], events = [];
global.SERVICE = {
    EvidencePublisher: { record: event => { persisted.push(event); return Promise.resolve(true); } },
    EventPublisher: { publish: event => { events.push(event); return Promise.resolve(true); } }
};
const service = Object.assign({}, require('../src/service/defaultStorefrontContextAuditService'), { LOG: { info: () => {}, warn: () => {} } });
(async () => {
    const recorded = await service.record({ eventType: 'storefront.context.bulk-revoked', outcome: 'success', reasonCode: 'OPERATOR_REQUEST',
        operation: 'bulkRevoke', actorType: 'human', principalId: 'operatorA', tokenType: 'access', tenantCode: 'tenantA',
        enterpriseCode: 'enterpriseA', storefrontCode: 'electronics', requestId: 'requestA', handle: 'secret-handle',
        binding: 'secret-binding', bindingHash: 'secret-hash', generation: 'secret-generation', context: { catalog: 'secret' },
        Authorization: 'Bearer secret', password: 'secret' });
    assert.strictEqual(recorded.storefrontCode, 'electronics');
    ['handle', 'binding', 'bindingHash', 'generation', 'context', 'Authorization', 'password'].forEach(key => assert.strictEqual(recorded[key], undefined));
    assert.deepStrictEqual(persisted[0], recorded);
    assert.deepStrictEqual(events[0].data, recorded);
    assert.strictEqual(events[0].tenant, 'tenantA');
    SERVICE.EvidencePublisher.record = () => Promise.reject(new Error('audit unavailable'));
    SERVICE.EventPublisher.publish = () => Promise.reject(new Error('event unavailable'));
    const failOpen = await service.record({ eventType: 'storefront.context.revoked', outcome: 'success', tenantCode: 'tenantA' });
    assert.strictEqual(failOpen.outcome, 'success');
    const diagnostics = service.diagnostics();
    assert.strictEqual(diagnostics.recorded, 2);
    assert.strictEqual(diagnostics.publisherFailures, 1);
    assert.strictEqual(diagnostics.eventFailures, 1);
    console.log('Storefront context audit contract validated');
})().catch(error => { console.error(error); process.exitCode = 1; });
