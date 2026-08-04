/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics source-available contract test. */
const assert = require('assert'); let histories = []; global.SERVICE = { DefaultOrderLifecycleOrchestrationService: { loadRequest: async () => ({ requestCode: 'refund-1', workflowCarrierCode: 'carrier-1' }) }, DefaultOrderLifecycleAuditService: { record: async (request, model, type, code) => { let existing = histories.find(value => value.historyCode === code); if (existing) return Object.assign({ idempotent: true }, existing); let value = { historyCode: code, type }; histories.push(value); return value; } } }; const service = require('../src/service/lifecycle/defaultOrderLifecycleNotificationResultService'), request = body => ({ tenant: 'default', authData: { tokenType: 'service', principalId: 'notification' }, body }); (async () => { let input = { enterpriseCode: 'ent-1', requestCode: 'refund-1', notificationCode: 'notification-1', deliveryCode: 'delivery-1', providerCallCode: 'provider-call-1', status: 'DELIVERED' }; let result = await service.record(request(input)); assert.strictEqual(result.correlationId, 'carrier-1'); assert.strictEqual(result.providerCallCode, 'provider-call-1'); assert.strictEqual((await service.record(request(input))).idempotent, true); await assert.rejects(service.record(request(Object.assign({}, input, { rawPayload: {} }))), /prohibited/); await assert.rejects(service.record({ tenant: 'default', authData: { tokenType: 'access' }, body: input }), /service identity/); let route = require('../src/router/routers').order.lifecycleOperations.notificationResult; assert.deepStrictEqual(route.authTokenTypes, ['service']); console.log('Order lifecycle Notification result contract validated'); })().catch(error => { console.error(error); process.exit(1); });
