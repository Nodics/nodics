/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
const assert = require('assert');
describe('KYC gNotify verification migration', function () {
  it('delegates mobile creation without returning OTP', async function () { global.SERVICE = { DefaultNotifyVerificationService: { create: async () => ({ challengeCode: 'c1', status: 'SENT' }) } }; let service = require('../src/service/mobile/defaultMobileNumberKycWorkflowService'), result = await service.initMobileOTP({ tenant: 't', authData: {}, workflowCarrier: { items: [{ mobileNumber: '971500000000', loginId: 'u1' }] } }, {}); assert.strictEqual(result.decision, 'NOTIFY'); assert.ok(!JSON.stringify(result).toLowerCase().includes('971500000000')); assert.ok(!Object.prototype.hasOwnProperty.call(result, 'otp')); });
  it('delegates email creation without returning OTP', async function () { global.SERVICE = { DefaultNotifyVerificationService: { create: async () => ({ challengeCode: 'c2', status: 'SENT' }) } }; let service = require('../src/service/email/defaultEmailKycWorkflowService'), result = await service.initEmailOTP({ tenant: 't', authData: {}, workflowCarrier: { items: [{ email: 'user@example.com', loginId: 'u1' }] } }, {}); assert.strictEqual(result.decision, 'NOTIFY'); assert.ok(!JSON.stringify(result).includes('user@example.com')); assert.ok(!Object.prototype.hasOwnProperty.call(result, 'otp')); });
});
