/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module product/service/reference/DefaultProductLifecycleCancellationService @description Delegates configured digital entitlement, service, license, SIM, or subscription cancellation to its provider adapter. @layer service @owner product */
module.exports = {
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, error: function (message) { let error = new Error(message); error.code = 'ERR_PRODUCT_00032'; return error; },
    execute: async function (request) { let input = request.productLifecycleCancellation || request.body || {}, lifecycleRequestCode = input.cancellationCode || input.lifecycleRequestCode; if (!request.tenant || !request.authData || request.authData.tokenType !== 'service' || !lifecycleRequestCode || !input.orderEntryCode) throw this.error('Product lifecycle cancellation requires internal immutable request identity'); if (input.providerActionRequired !== true) return { status: 'NO_PRODUCT_PROVIDER_ACTION_REQUIRED', orderEntryCode: input.orderEntryCode, lifecycleType: input.lifecycleType }; if (!input.providerActionCode || !input.entitlementReference) throw this.error('Product lifecycle cancellation requires provider action and entitlement references'); let config = ((CONFIG.get('product') || {}).lifecycleCancellation) || {}, serviceName = (config.providerAdapters || {})[input.providerActionCode], service = SERVICE[serviceName]; if (!service || typeof service.cancel !== 'function') throw this.error('Product lifecycle cancellation provider adapter is unavailable'); let result = await service.cancel({ tenant: request.tenant, authData: request.authData, idempotencyKey: [lifecycleRequestCode, input.requestVersion, input.orderEntryCode, input.providerActionCode].join('::'), actionCode: input.providerActionCode, entitlementReference: input.entitlementReference, orderCode: input.orderCode, orderEntryCode: input.orderEntryCode }); if (!result || !result.status || /payload|secret|credential/i.test(JSON.stringify(result))) throw this.error('Product lifecycle cancellation provider evidence is unsafe or incomplete'); return { status: result.status, providerReference: result.providerReference, actionCode: input.providerActionCode, orderEntryCode: input.orderEntryCode, lifecycleType: input.lifecycleType, completedAt: result.completedAt || new Date() }; },
};
