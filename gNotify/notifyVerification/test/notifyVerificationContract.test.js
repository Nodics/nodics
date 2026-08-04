/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
const assert = require('assert');
const service = require('../src/service/defaultNotifyVerificationService');
const originalConfig = global.CONFIG;
const originalService = global.SERVICE;
describe('notifyVerification contract', function () {
  beforeEach(function () { global.CONFIG = { get: key => key === 'notifyVerification' ? { defaultMode: 'NODICS_OTP', providerManagedEnabled: false, expirySeconds: 300, attemptLimit: 5 } : {} }; });
  afterEach(function () { global.CONFIG = originalConfig; global.SERVICE = originalService; });
  it('rejects disabled provider-managed verification', async function () { await assert.rejects(() => service.create({ tenant: 't', authData: {} }, { mode: 'PROVIDER_MANAGED' }), /disabled/); });
  it('returns challenge evidence without returning raw OTP', async function () { let saved; global.SERVICE = { DefaultOtpService: { generateOtp: async () => ({ result: { value: '987654' } }) }, DefaultNotifyVerificationChallengeService: { save: async request => { saved = request.model; return { result: request.model }; }, update: async () => ({}) }, DefaultNotifyDeliveryService: { send: async () => ({ requestCode: 'r1', status: 'SENT' }) } }; let result = await service.create({ tenant: 't', authData: { enterpriseCode: 'e', tokenType: 'access' } }, { key: 'mobile', ops: 'login', channelCode: 'sms', recipientType: 'MOBILE', recipientReference: 'profile:1', maskedRecipient: '******1234', ownerModule: 'profile', idempotencyKey: 'i1', variables: { brandName: 'Nodics', supportContact: 'Help' } }); assert.strictEqual(result.status, 'SENT'); assert.ok(saved.otpKeyReference); assert.ok(!JSON.stringify(result).includes('987654')); assert.ok(!JSON.stringify(saved).includes('987654')); });
});
