/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
const assert = require('assert');
const properties = require('../config/properties');
const policy = require('../src/service/policy/defaultNotifyPolicyService');
const operations = require('../src/service/operations/defaultNotifyOperationsService');

describe('gNotify effective policy and test-send contract', function () {
  const originalConfig = global.CONFIG;
  const originalService = global.SERVICE;
  beforeEach(function () { global.CONFIG = { get: key => key === 'notify' ? properties.notify : {} }; });
  afterEach(function () { global.CONFIG = originalConfig; global.SERVICE = originalService; });

  it('resolves active enterprise policy overrides without changing the core service', async function () {
    global.SERVICE = { DefaultNotifyDeliveryPolicyService: { get: async () => ({ result: [{ policyCode: 'customer-transactional', status: 'ACTIVE', priority: 10, scenarioCodes: ['orderConfirmation'], channelCodes: ['email'], maximumPerWindow: 2, windowMs: 5000, providerCodes: ['customerSmtp'] }] }) } };
    const result = await policy.resolve({ tenant: 'tenant1', authData: { tokenType: 'service', enterpriseCode: 'enterprise1' } }, { idempotencyKey: 'id1', scenarioCode: 'orderConfirmation', channelCode: 'email', messageTypeCode: 'transactional', recipientReference: 'profile:1', recipientType: 'PROFILE', ownerModule: 'order', correlationId: 'correlation1' });
    assert.strictEqual(result.effectivePolicy.maximumPerWindow, 2);
    assert.deepStrictEqual(result.effectivePolicy.providerCodes, ['customerSmtp']);
  });

  it('executes an allowlisted sandbox test through the replaceable delivery authority', async function () {
    let captured;
    global.SERVICE = { DefaultNotifyDeliveryService: { send: async (request, input) => { captured = input; return { requestCode: 'notify-test-1', status: 'SENT' }; } } };
    const result = await operations.testSend({ tenant: 'tenant1', environmentCode: 'test', authData: { tokenType: 'access', enterpriseCode: 'enterprise1', principalId: 'operator1', permissions: ['notify.test.send'] } }, { templateCode: 'welcome', scenarioCode: 'orderConfirmation', channelCode: 'email', messageTypeCode: 'transactional', recipientReference: 'test-email', recipientType: 'PROFILE', maskedRecipient: 't***@example.invalid', values: { customerName: 'Test' } });
    assert.strictEqual(captured.testSend, true);
    assert.strictEqual(captured.ownerReferenceType, 'TEST_SEND');
    assert.strictEqual(result.secretsExposed, false);
  });

  it('fails closed for production, arbitrary recipients, or secret-like samples', async function () {
    global.SERVICE = { DefaultNotifyDeliveryService: { send: async () => ({}) } };
    const base = { tenant: 'tenant1', authData: { tokenType: 'access', enterpriseCode: 'enterprise1', principalId: 'operator1', permissions: ['notify.test.send'] } };
    await assert.rejects(() => operations.testSend(Object.assign({ environmentCode: 'production' }, base), { templateCode: 'welcome', recipientReference: 'test-email' }), /denied/);
    await assert.rejects(() => operations.testSend(Object.assign({ environmentCode: 'test' }, base), { templateCode: 'welcome', recipientReference: 'arbitrary-email' }), /denied/);
    await assert.rejects(() => operations.testSend(Object.assign({ environmentCode: 'test' }, base), { templateCode: 'welcome', recipientReference: 'test-email', values: { password: 'never' } }), /prohibited/);
  });
});
