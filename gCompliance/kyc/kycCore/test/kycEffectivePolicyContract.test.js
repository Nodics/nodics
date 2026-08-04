/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const assert = require('assert'); const service = require('../src/service/defaultKycPolicyService'); const defaults = require('../config/properties').kyc;
describe('KYC effective policy and step-up contract', function () {
    const request = { tenantCode: 'tenant-a', enterpriseCode: 'enterprise-a', siteCode: 'site-a', channelCode: 'web', jurisdiction: 'AE', subjectType: 'CUSTOMER', entryPoint: 'CHECKOUT', productCodes: ['regulated-1'], categoryCodes: ['regulated'], orderMinorUnits: '900719925474099312345', paymentMethodCode: 'wallet', riskScore: 88, documentValidityDays: 5, priorAttempts: 3, deviceSignalCodes: ['NEW_DEVICE'], consentStatus: 'ACTIVE', previousCheckResultCodes: ['INCONCLUSIVE'], previousDecision: 'REVIEW_REQUIRED' };
    it('matches scoped multi-signal rules and compares money exactly', function () {
        const configuration = { policy: Object.assign({}, defaults.policy, { rules: [{ ruleCode: 'CUSTOMER_STEP_UP', enabled: true, priority: 500, reasonCode: 'REGULATED_HIGH_RISK', when: { tenantCodes: ['tenant-a'], enterpriseCodes: ['enterprise-a'], siteCodes: ['site-a'], channelCodes: ['web'], jurisdictions: ['AE'], subjectTypes: ['CUSTOMER'], productCodes: ['regulated-1'], categoryCodes: ['regulated'], minimumOrderMinorUnits: '900719925474099312344', paymentMethodCodes: ['wallet'], minimumRiskScore: 80, maximumDocumentValidityDays: 10, minimumPriorAttempts: 2, deviceSignalCodes: ['NEW_DEVICE'], consentStatuses: ['ACTIVE'], previousCheckResultCodes: ['INCONCLUSIVE'], previousDecisions: ['REVIEW_REQUIRED'] }, apply: { verificationLevel: 'ENHANCED', additionalCheckTypes: ['SANCTIONS'], additionalDocumentTypes: ['SOURCE_OF_FUNDS'], manualReviewRequired: true, reusableDecision: { enabled: false } } }] }) };
        const result = service.resolvePolicy(request, configuration);
        assert.strictEqual(result.verificationLevel, 'ENHANCED'); assert.ok(result.checkTypes.includes('SANCTIONS')); assert.ok(result.requiredDocumentTypes.includes('SOURCE_OF_FUNDS')); assert.strictEqual(result.manualReviewOnInconclusive, true); assert.strictEqual(result.reusableDecision.enabled, false); assert.deepStrictEqual(result.matchedRuleCodes, ['CUSTOMER_STEP_UP']);
    });
    it('allows later customer configuration to replace rules without core edits', function () { const config = { policy: Object.assign({}, defaults.policy, { rules: [{ ruleCode: 'CUSTOMER_CHANNEL_RULE', priority: 1, when: { channelCodes: ['partner'] }, apply: { verificationLevel: 'ENHANCED' } }] }) }; const result = service.resolvePolicy(Object.assign({}, request, { channelCode: 'partner', riskScore: 0 }), config); assert.deepStrictEqual(result.matchedRuleCodes, ['CUSTOMER_CHANNEL_RULE']); });
    it('rejects non-exact monetary evidence', function () { assert.throws(() => service.resolvePolicy(Object.assign({}, request, { orderMinorUnits: '12.50' }), { policy: defaults.policy }), error => error.code === 'KYC_INVALID_REQUEST'); });
});
