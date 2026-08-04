/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Licensed under the root license. */
const operations = Object.freeze(['createCase', 'submitDocument', 'startCheck', 'getCaseStatus', 'handleWebhook', 'requestMoreInformation', 'cancelCase', 'reconcileCase']);
const evidenceKeys = Object.freeze(['providerCode', 'providerCaseRef', 'providerDocumentRef', 'providerCheckRef', 'status', 'decision', 'reasonCode', 'safeMessage', 'eventTime']);
/**
 * @module gCompliance/kyc/kycProviders/kycProviderCore/src/service/defaultKycProviderRegistryService
 * @description Defines the default kyc provider registry service contract owned by kycProviderCore within the Nodics layered runtime.
 * @layer service
 * @owner kycProviderCore
 * @override Later project or customer modules may replace or extend this artifact while preserving its published contract.
 */
module.exports = {
    init: () => Promise.resolve(true), postInit: () => Promise.resolve(true), operations,
    assertAdapter: adapter => {
        const missing = operations.filter(operation => !adapter || typeof adapter[operation] !== 'function');
        if (missing.length) { const error = new Error(`KYC provider adapter is missing: ${missing.join(', ')}`); error.code = 'KYC_PROVIDER_CONTRACT_INVALID'; throw error; }
        return true;
    },
    normalizeEvidence: evidence => evidenceKeys.reduce((safe, key) => { if (evidence && evidence[key] !== undefined) safe[key] = evidence[key]; return safe; }, {}),
    assertLiveCallAllowed: (provider, policy) => {
        if (!policy || policy.liveCallsEnabled !== true || !provider || provider.productionReady !== true) { const error = new Error('Live KYC provider execution is disabled.'); error.code = 'KYC_LIVE_CALL_DISABLED'; throw error; }
        return true;
    }
};
