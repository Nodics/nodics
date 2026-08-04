/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const test = require('node:test');

const coreProperties = require('../config/properties');
const corePipelines = require('../src/pipelines/pipelines');

const merge = (base, later) => {
  if (!base || typeof base !== 'object' || Array.isArray(base)) return later;
  const result = Object.assign({}, base);
  Object.entries(later || {}).forEach(([key, value]) => {
    result[key] = value && typeof value === 'object' && !Array.isArray(value)
      ? merge(result[key] || {}, value)
      : value;
  });
  return result;
};

test('a later customer module customizes policy, notification and providers without changing core', () => {
  const customerProperties = { order: { orderLifecycle: {
    cancellationEligibility: { cancellationWindowMinutes: 120 },
    policy: { cancellationWindows: [{ policyCode: 'PARTNER_EXPRESS', windowMinutes: 120 }], returnWindows: [{ policyCode: 'PARTNER_RETURN', deliveryAgeDays: 14 }] },
    returnCompletion: { nonRefundableDispositionCodes: ['MISSING', 'QUARANTINE', 'DESTROY'] },
    refundApproval: { autoApprovalEnabled: true, autoApprovalMaximumAmount: '25.00', autoApprovalRequesterTypes: ['CUSTOMER'], approvalRules: [{ ruleCode: 'PARTNER_LOW_VALUE', maximumAmount: '25.00', route: 'AUTO_APPROVE' }] },
    events: { notificationByEventType: { REFUND_EXECUTED: { templateCode: 'PARTNER_REFUND_PAID', audiences: ['CUSTOMER'] } } },
    cancellationExecution: { paymentService: 'PartnerPaymentCancellationExecutionService' },
  } } };
  const effective = merge(coreProperties, customerProperties);
  assert.strictEqual(effective.order.orderLifecycle.cancellationEligibility.cancellationWindowMinutes, 120);
  assert.deepStrictEqual(effective.order.orderLifecycle.returnCompletion.nonRefundableDispositionCodes, ['MISSING', 'QUARANTINE', 'DESTROY']);
  assert.strictEqual(effective.order.orderLifecycle.refundApproval.autoApprovalMaximumAmount, '25.00');
  assert.strictEqual(effective.order.orderLifecycle.events.notificationByEventType.REFUND_EXECUTED.templateCode, 'PARTNER_REFUND_PAID');
  assert.strictEqual(effective.order.orderLifecycle.cancellationExecution.paymentService, 'PartnerPaymentCancellationExecutionService');
  assert.strictEqual(coreProperties.order.orderLifecycle.cancellationEligibility.cancellationWindowMinutes, 1440, 'the customer layer must not mutate core');
});

test('a later module replaces one service and one pipeline node while retaining owner boundaries', () => {
  const serviceRegistry = merge({
    DefaultOrderCancellationEligibilityService: { owner: 'order', operation: 'evaluate' },
    DefaultPaymentRefundExecutionService: { owner: 'payment', operation: 'execute' },
  }, {
    DefaultOrderCancellationEligibilityService: { owner: 'partnerOrder', operation: 'evaluate', extends: 'order' },
  });
  const customerPipeline = merge(corePipelines.orderCancellationEligibilityPipeline, { nodes: {
    evaluateEligibility: { type: 'function', handler: 'DefaultOrderCancellationEligibilityService.evaluateCustomerEligibility' },
  } });
  assert.strictEqual(serviceRegistry.DefaultOrderCancellationEligibilityService.owner, 'partnerOrder');
  assert.strictEqual(serviceRegistry.DefaultPaymentRefundExecutionService.owner, 'payment');
  assert.strictEqual(customerPipeline.nodes.evaluateEligibility.handler, 'DefaultOrderCancellationEligibilityService.evaluateCustomerEligibility');
  assert.strictEqual(customerPipeline.startNode, corePipelines.orderCancellationEligibilityPipeline.startNode);
});
