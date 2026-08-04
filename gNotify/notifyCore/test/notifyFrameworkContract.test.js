/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
const assert = require('assert');
const originalConfig = global.CONFIG;
const configure = function () { global.CONFIG = { get: key => key === 'notify' ? require('../config/properties').notify : key === 'notifyLocalProvider' ? { enabled: true } : {} }; };
configure();
const rendering = require('../src/service/rendering/defaultNotifyRenderingService');
const policy = require('../src/service/policy/defaultNotifyPolicyService');
const local = require('../../localNotifyProvider/src/service/defaultLocalNotifyProviderAdapterService');
describe('gNotify framework contract', function () {
  beforeEach(configure);
  after(function () { global.CONFIG = originalConfig; });
  it('renders declared channel content and emits only hash evidence', function () { let result = rendering.render('sms', { content: { text: 'Code {{otpCode}}' } }, { values: { otpCode: '654321' }, sensitiveVariableCodes: ['otpCode'] }); assert.strictEqual(result.output.text, 'Code 654321'); assert.ok(result.evidence.hash); assert.deepStrictEqual(result.evidence.protectedVariableCodes, ['otpCode']); assert.ok(!JSON.stringify(result.evidence).includes('654321')); });
  it('uses fake protected values in preview', function () { let result = rendering.preview('sms', { content: { text: 'Code {{otpCode}}' } }, [{ variableCode: 'otpCode', protected: true }], { otpCode: '999999' }); assert.ok(result.output.text.includes('123456')); assert.ok(!result.output.text.includes('999999')); });
  it('rejects scenario-channel relationships before delivery', function () { assert.throws(() => policy.validate({ tenant: 't1', authData: { tokenType: 'service', enterpriseCode: 'e1' } }, { idempotencyKey: '1', scenarioCode: 'otpVerification', channelCode: 'push', messageTypeCode: 'verification', recipientReference: 'profile:1', recipientType: 'PROFILE', ownerModule: 'profile', correlationId: 'c1' }), /prohibited/); });
  it('local adapter is deterministic and never echoes content', async function () { let input = { requestCode: 'r1', idempotencyKey: 'i1', content: { text: 'secret' } }, first = await local.send(input), second = await local.send(input); assert.strictEqual(first.providerMessageReference, second.providerMessageReference); assert.ok(!JSON.stringify(first).includes('secret')); });
  it('qualifies local email and SMS through the same provider-neutral safe contract', async function () {
    let email = await local.send({ requestCode: 'email-r1', idempotencyKey: 'email-i1', channelCode: 'email', recipientReference: 'profile:email', content: { subject: 'Order update', plainTextBody: 'private email content' } });
    let sms = await local.send({ requestCode: 'sms-r1', idempotencyKey: 'sms-i1', channelCode: 'sms', recipientReference: 'profile:sms', content: { text: 'private sms content' } });
    [email, sms].forEach(result => {
      assert.strictEqual(result.status, 'SENT');
      assert.strictEqual(result.resultCode, 'LOCAL_ACCEPTED');
      assert.strictEqual(result.safeEvidence.adapter, 'local');
      assert.strictEqual(result.safeEvidence.simulated, true);
      assert.ok(!JSON.stringify(result).includes('private'));
    });
    assert.notStrictEqual(email.providerMessageReference, sms.providerMessageReference);
  });
});
