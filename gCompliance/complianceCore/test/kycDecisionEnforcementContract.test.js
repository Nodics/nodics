/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert'); const fs = require('fs'); const path = require('path'); const service = require('../src/service/defaultKycDecisionEnforcementService');
describe('Cross-capability KYC decision enforcement', function () {
    beforeEach(function () { global.CONFIG = { get: key => key === 'compliance' ? { kycEnforcement: { enabled: true, failClosed: true, requiredByEntryPoint: { ONBOARDING: true, CHECKOUT: true, PAYMENT: true, REFUND: true, ORDER: true } } } : {} }; });
    it('accepts only an unexpired KYC-owned eligible contract', async function () { global.SERVICE = { DefaultKycEligibilityService: { evaluate: async input => ({ eligible: true, decisionId: 'd1', expiresAt: new Date(Date.now() + 10000), entryPoint: input.entryPoint }) } }; const result = await service.enforce({ tenant: 't1', authData: {} }, 'CHECKOUT', { tenantCode: 't1', enterpriseCode: 'e1', subjectCode: 's1' }); assert.strictEqual(result.decisionId, 'd1'); global.SERVICE.DefaultKycEligibilityService.evaluate = async () => ({ eligible: false, decision: 'VERIFICATION_REQUIRED', expiresAt: new Date(Date.now() + 10000) }); await assert.rejects(() => service.enforce({ tenant: 't1', authData: {} }, 'PAYMENT', { tenantCode: 't1', enterpriseCode: 'e1', subjectCode: 's1' }), error => error.code === 'KYC_VERIFICATION_REQUIRED'); });
    it('is referenced by every required owner lifecycle without copying KYC state', function () { const root = path.resolve(__dirname, '../../..'); const files = ['gCore/profile/src/service/customer/defaultCustomerRegistrationService.js', 'gComm/checkout/order/src/service/placement/defaultOrderCheckoutPlacementValidationService.js', 'gComm/payment/paymentCore/src/service/checkout/defaultPaymentCheckoutAuthorizationService.js', 'gComm/payment/paymentCore/src/service/refund/defaultPaymentRefundService.js', 'gComm/checkout/order/src/service/lifecycle/defaultOrderLifecycleOrchestrationService.js']; files.forEach(file => { const text = fs.readFileSync(path.join(root, file), 'utf8'); assert.ok(text.includes('DefaultKycDecisionEnforcementService'), `${file} must enforce KYC`); assert.ok(!/kycStatus\s*=|kycProfile\s*=/.test(text), `${file} must not copy KYC authority`); }); });
});
