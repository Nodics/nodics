/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Licensed under the root license. */
const crypto = require('crypto');
const ref = (prefix, request) => `${prefix}-${crypto.createHash('sha256').update(String(request && (request.idempotencyKey || request.caseCode || 'default'))).digest('hex').slice(0, 16)}`;
const result = (request, operation) => {
    const scenario = (request && request.scenario) || 'APPROVE';
    if (scenario === 'TIMEOUT') { const error = new Error('Mock KYC provider timeout.'); error.code = 'KYC_PROVIDER_TIMEOUT'; return Promise.reject(error); }
    if (scenario === 'MALFORMED') { const error = new Error('Mock KYC provider returned an invalid response.'); error.code = 'KYC_PROVIDER_RESPONSE_INVALID'; return Promise.reject(error); }
    const outcomes = { APPROVE: ['COMPLETED', 'APPROVED', 'MOCK_APPROVED'], REJECT: ['COMPLETED', 'REJECTED', 'MOCK_REJECTED'], REVIEW: ['COMPLETED', 'MANUAL_REVIEW_REQUIRED', 'MOCK_REVIEW'], PENDING: ['PENDING', 'PENDING', 'MOCK_PENDING'] };
    const outcome = outcomes[scenario] || outcomes.REVIEW;
    return Promise.resolve({ providerCode: 'mockKyc', providerCaseRef: ref('mock-case', request), providerDocumentRef: operation === 'submitDocument' ? ref('mock-document', request) : undefined, providerCheckRef: operation === 'startCheck' ? ref('mock-check', request) : undefined, status: outcome[0], decision: outcome[1], reasonCode: outcome[2], safeMessage: 'Deterministic mock verification result.', eventTime: new Date(0).toISOString() });
};
/**
 * @module gCompliance/kyc/kycProviders/mockKycProvider/src/service/defaultMockKycProviderAdapterService
 * @description Defines the default mock kyc provider adapter service contract owned by mockKycProvider within the Nodics layered runtime.
 * @layer service
 * @owner mockKycProvider
 * @override Later project or customer modules may replace or extend this artifact while preserving its published contract.
 */
module.exports = {
    init: () => Promise.resolve(true), postInit: () => Promise.resolve(true),
    createCase: request => result(request, 'createCase'), submitDocument: request => result(request, 'submitDocument'),
    startCheck: request => result(request, 'startCheck'), getCaseStatus: request => result(request, 'getCaseStatus'),
    handleWebhook: request => result(request, 'handleWebhook'), requestMoreInformation: request => result(request, 'requestMoreInformation'),
    cancelCase: request => result(request, 'cancelCase'), reconcileCase: request => result(request, 'reconcileCase')
};
