/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/test/orderLifecycleIntentContract @description Protects customer ownership and support site/channel scope for Return and Refund intent APIs. @layer test @owner order */
const assert = require('assert'); let createdType; let createdIntent;
global.SERVICE = {
    DefaultOrderCancellationIntentService: {
        enterprise: (request, value) => value, principal: request => request.authData.principalId,
        rateLimit: async () => ({ allowed: true }),
        loadOrder: async () => ({ code: 'order-1', customerCode: 'customer-1', siteCode: 'site-1', channelCode: 'web', currencyCode: 'USD', locale: 'en-AE', countryCode: 'AE' }),
        customerCode: (request, order, support) => { let code = support ? request.body.customerCode || order.customerCode : request.authData.customerCode; if (code !== order.customerCode) throw new Error('Customer can access only their own Order'); return code; },
        snapshotItems: async () => [{ orderEntryCode: 'entry-1', requestedQuantity: '1', unitCode: 'EA', immutableEvidence: { orderedQuantity: '2' } }],
    },
    DefaultOrderLifecycleOrchestrationService: {
        createDraft: async request => { createdType = request.orderLifecycle.requestType; createdIntent = request.orderLifecycle; return { request: { requestCode: createdType.toLowerCase() + '-1', entCode: 'ent-1' }, items: request.orderLifecycle.items }; },
        submit: async request => ({ request: { requestCode: request.orderLifecycle.requestCode, requestType: createdType, entCode: 'ent-1', workflowCarrierCode: 'carrier-1' }, items: [] }),
    },
    DefaultOrderLifecycleAuditService: { record: async () => true },
};
const service = require('../src/service/lifecycle/defaultOrderLifecycleIntentService');
const customer = type => ({ tenant: 'default', authData: { tokenType: 'access', principalId: 'customer-1', customerCode: 'customer-1' }, body: { entCode: 'ent-1', orderCode: 'order-1', idempotencyKey: type.toLowerCase() + '-key', reasonCode: type === 'RETURN' ? 'CUSTOMER_RETURN' : 'GOODWILL', items: [{ orderEntryCode: 'entry-1', requestedQuantity: '1' }] } });
(async () => {
    let spoofed = customer('RETURN'); spoofed.body.currencyCode = 'ATTACKER'; spoofed.body.countryCode = 'XX'; let returned = await service.create(spoofed, 'RETURN', false); assert.strictEqual(returned.request.requestType, 'RETURN'); assert.strictEqual(createdIntent.currencyCode, 'USD'); assert.strictEqual(createdIntent.countryCode, 'AE'); assert.strictEqual(createdIntent.locale, 'en-AE');
    let refunded = await service.create(customer('REFUND'), 'REFUND', false); assert.strictEqual(refunded.request.requestType, 'REFUND');
    let support = customer('RETURN'); support.authData = { tokenType: 'access', principalId: 'support-1', siteCodes: ['other-site'], channelCodes: ['web'] }; support.body.customerCode = 'customer-1'; await assert.rejects(() => service.create(support, 'RETURN', true), /outside assigned scope/);
    let other = customer('REFUND'); other.authData.customerCode = 'customer-2'; await assert.rejects(() => service.create(other, 'REFUND', false), /own Order/);
    console.log('Order lifecycle Return and Refund intent contract validated');
})().catch(error => { console.error(error); process.exit(1); });
