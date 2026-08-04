/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/test/orderCancellationIntentContract @description Protects customer ownership and support-scoped cancellation intent APIs. @layer test @owner order */
const assert = require('assert');
const properties = require('../config/properties');
const service = require('../src/service/lifecycle/defaultOrderCancellationIntentService');
const auditService = require('../src/service/lifecycle/defaultOrderLifecycleAuditService');
global.CONFIG = { get: key => key === 'order' ? properties.order : undefined };
global.CLASSES = { NodicsError: class NodicsError extends Error { constructor(message, cause, code) { super(String(message)); this.code = code; this.cause = cause; } } };
const order = { entCode: 'enterprise-1', code: 'order-1', customerCode: 'customer-1', status: 'PLACED', siteCode: 'site-1', channelCode: 'web', currencyCode: 'USD', locale: 'en-AE', countryCode: 'AE' };
const entry = { entCode: 'enterprise-1', orderCode: 'order-1', entryCode: 'entry-1', quantity: '3', cancelledQuantity: '0', unitCode: 'EA', catalogCode: 'catalog-1', itemType: 'SKU', itemCode: 'sku-1', allocationCode: 'allocation-1', lifecycleRevision: 2 };
let createdInput; let requestRecord; let requestItems;
let auditEvents = [];
let histories = [];
global.SERVICE = {
  DefaultOrderLifecycleRateLimitService: { assertAllowed: async () => ({ allowed: true }) },
  DefaultOrderLifecycleStatusProjectionService: require('../src/service/lifecycle/defaultOrderLifecycleStatusProjectionService'),
  DefaultOrderLifecycleAuditService: { record: async (request, model, eventType) => { auditEvents.push(eventType); return true; } },
  DefaultOrderHistoryEntryService: { get: async request => ({ result: histories.filter(value => value.historyCode === request.query.historyCode) }), save: async request => { histories.push(request.model); return { result: [request.model] }; } },
  DefaultOrderService: { get: async request => ({ result: request.query.code === order.code && request.query.entCode === order.entCode ? [order] : [] }) },
  DefaultOrderEntryService: { get: async () => ({ result: [entry] }) },
  DefaultOrderLifecycleOrchestrationService: {
    createDraft: async request => { createdInput = request.orderLifecycle; requestRecord = { entCode: request.orderLifecycle.entCode, requestCode: 'request-1', orderCode: request.orderLifecycle.orderCode, requestType: 'CANCELLATION', state: 'DRAFT', version: 1, customerCode: request.orderLifecycle.customerCode }; requestItems = request.orderLifecycle.items; return { request: requestRecord, items: requestItems, idempotent: false }; },
    submit: async () => { requestRecord = Object.assign({}, requestRecord, { state: 'SUBMITTED' }); return { request: requestRecord, items: requestItems }; },
    loadRequest: async () => requestRecord,
    loadItems: async () => requestItems,
    updateState: async (request, current, expected, patch) => { assert(expected.includes(current.state)); requestRecord = Object.assign({}, current, patch); return requestRecord; },
  },
};
const customerRequest = customerCode => ({ tenant: 'tenant-1', authData: { tokenType: 'access', principalId: customerCode, customerCode: customerCode, enterpriseCode: 'enterprise-1' }, body: { entCode: 'enterprise-1', orderCode: 'order-1', idempotencyKey: 'cancel-key-1', reasonCode: 'CUSTOMER_REQUEST', items: [{ orderEntryCode: 'entry-1', requestedQuantity: '1', immutableEvidence: { orderedQuantity: '999' } }] } });
(async () => {
  let created = await service.create(customerRequest('customer-1'), false);
  assert.strictEqual(created.request.state, 'SUBMITTED');
  assert.strictEqual(createdInput.requesterType, 'CUSTOMER');
  assert.strictEqual(createdInput.customerCode, 'customer-1');
  assert.strictEqual(createdInput.siteCode, 'site-1');
  assert.strictEqual(createdInput.channelCode, 'web');
  assert.strictEqual(createdInput.currencyCode, 'USD');
  assert.strictEqual(createdInput.locale, 'en-AE');
  assert.strictEqual(createdInput.countryCode, 'AE');
  assert.strictEqual(createdInput.items[0].immutableEvidence.orderedQuantity, '3');
  assert.strictEqual(createdInput.items[0].immutableEvidence.itemCode, 'sku-1');
  assert(auditEvents.includes('CANCELLATION_SUBMITTED'));
  await assert.rejects(service.create(customerRequest('customer-2'), false), error => error.code === 'ERR_ORD_00056');
  let status = await service.status({ tenant: 'tenant-1', authData: { tokenType: 'access', customerCode: 'customer-1', enterpriseCode: 'enterprise-1' }, query: { entCode: 'enterprise-1' }, params: { requestCode: 'request-1' } }, false);
  assert.strictEqual(status.request.customerCode, 'customer-1');
  let supportRequest = customerRequest('employee-1'); supportRequest.body.customerCode = 'customer-1';
  let supported = await service.create(supportRequest, true); assert.strictEqual(createdInput.requesterType, 'EMPLOYEE'); assert.strictEqual(supported.request.customerCode, 'customer-1');
  requestRecord = Object.assign({}, requestRecord, { state: 'DRAFT' });
  let cancelled = await service.cancelDraft({ tenant: 'tenant-1', authData: { tokenType: 'access', customerCode: 'customer-1', enterpriseCode: 'enterprise-1' }, body: { entCode: 'enterprise-1', requestCode: 'request-1' } }, false);
  assert.strictEqual(cancelled.request.state, 'CANCELLED');
  assert(auditEvents.includes('CANCELLATION_DRAFT_CANCELLED'));
  const routes = require('../src/router/routers').order;
  assert.strictEqual(routes.cancellationCustomerIntent.create.permission, 'order.cancellation.customer.create');
  assert.strictEqual(routes.cancellationSupportIntent.create.permission, 'order.cancellation.support.create');
  assert.strictEqual(routes.cancellationCustomerIntent.create.authTokenTypes[0], 'access');
  let audit = await auditService.record(customerRequest('customer-1'), requestRecord, 'CANCELLATION_TESTED', 'test', 'Safe audit event');
  let auditReplay = await auditService.record(customerRequest('customer-1'), requestRecord, 'CANCELLATION_TESTED', 'test', 'Safe audit event');
  assert.strictEqual(audit.eventType, 'CANCELLATION_TESTED'); assert.strictEqual(auditReplay.idempotent, true); assert.strictEqual(histories.length, 1);
  console.log('Order cancellation intent contract validated');
})().catch(error => { console.error(error); process.exit(1); });
