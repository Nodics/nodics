/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/test/orderLifecycleInformationWorkflowContract @description Protects Workflow-authorized information requests, versioned customer evidence, media references, and resubmission. @layer test @owner order */
const assert = require('assert'); const properties = require('../config/properties'); global.CONFIG = { get: key => key === 'order' ? properties.order : undefined };
let record = { requestCode: 'return-1', requestType: 'RETURN', entCode: 'ent-1', orderCode: 'order-1', customerCode: 'customer-1', state: 'AUTHORIZATION_PENDING', version: 1, evidence: {} }; let submitted;
global.SERVICE = {
    DefaultOrderLifecycleStatusProjectionService: require('../src/service/lifecycle/defaultOrderLifecycleStatusProjectionService'),
    DefaultOrderLifecycleOrchestrationService: { loadRequest: async () => record, loadItems: async () => [], updateState: async (request, current, states, patch, increment) => { assert(states.includes(current.state)); record = Object.assign({}, current, patch, { version: increment === false ? current.version : current.version + 1 }); return record; }, submit: async () => { submitted = true; record = Object.assign({}, record, { state: 'SUBMITTED', version: record.version + 1 }); return { request: record, items: [] }; } },
    DefaultOrderLifecycleAuditService: { record: async () => true },
    DefaultOrderCancellationIntentService: { principal: request => request.authData.customerCode || request.authData.principalId, enterprise: () => true, loadOrder: async () => ({ code: 'order-1', customerCode: 'customer-1' }), customerCode: () => 'customer-1' },
};
const review = require('../src/service/lifecycle/defaultOrderLifecycleReviewWorkflowService'); const intent = require('../src/service/lifecycle/defaultOrderLifecycleIntentService');
const carrier = { tenant: 'default', authData: { tokenType: 'access', principalId: 'approver-1' }, workflowDecision: { message: 'Please attach package photographs' }, workflowCarrier: { code: 'carrier-1', sourceDetail: { processType: 'orderLifecycleRequest', requestType: 'RETURN', requestCode: 'return-1', requestVersion: 1, entCode: 'ent-1', orderCode: 'order-1' } } };
(async () => { let requested = await review.requestInformation(carrier); assert.strictEqual(requested.decision, 'SUCCESS'); assert.strictEqual(record.state, 'INFORMATION_REQUESTED'); assert.strictEqual(record.version, 2); let customer = { tenant: 'default', authData: { tokenType: 'access', principalId: 'customer-1', customerCode: 'customer-1', entCode: 'ent-1' }, params: { requestCode: 'return-1' }, body: { requestCode: 'return-1', expectedVersion: 2, message: 'Attached package and item photographs', mediaCodes: ['media-proof-1'], pickupOption: 'PICKUP' } }; let result = await intent.provideInformation(customer, 'RETURN', false); assert.strictEqual(submitted, true); assert.strictEqual(result.request.state, 'SUBMITTED'); assert.deepStrictEqual(record.evidence.informationResponse.mediaCodes, ['media-proof-1']); assert.strictEqual(record.version, 4); console.log('Order lifecycle information Workflow contract validated'); })().catch(error => { console.error(error); process.exit(1); });
