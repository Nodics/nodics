/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module product/service/reference/DefaultOrderCancellationProductEvidenceProviderService @description Projects Product-owned cancellation policy evidence for selected Order Entries. @layer service @owner product */
module.exports = {
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
    resolve: async function (request) {
        if (!request || !request.tenant || !request.authData || request.authData.tokenType !== 'service' || !request.entCode || !Array.isArray(request.items)) throw SERVICE.DefaultProductEnterpriseScopeService.error('ERR_PRODUCT_00031', 'Product cancellation evidence requires internal Order context');
        let output = [];
        for (let selected of request.items) {
            let evidence = selected.immutableEvidence || {};
            if (!evidence.catalogCode || !evidence.itemType || !evidence.itemCode) throw SERVICE.DefaultProductEnterpriseScopeService.error('ERR_PRODUCT_00031', 'Product cancellation evidence requires immutable Product identity');
            let response = await SERVICE.DefaultProductItemService.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: request.entCode, catalogCode: evidence.catalogCode, itemType: evidence.itemType, itemCode: evidence.itemCode }, searchOptions: { limit: 2 } });
            let items = response && Array.isArray(response.result) ? response.result : [];
            if (items.length !== 1) throw SERVICE.DefaultProductEnterpriseScopeService.error('ERR_PRODUCT_00031', 'Product cancellation identity is unavailable');
            let item = items[0]; let config = ((CONFIG.get('product') || {}).lifecycleCancellation) || {}; let lifecycleType = item.lifecycleType || evidence.lifecycleType || 'PHYSICAL';
            if (!(config.supportedLifecycleTypes || ['PHYSICAL']).includes(lifecycleType)) throw SERVICE.DefaultProductEnterpriseScopeService.error('ERR_PRODUCT_00031', 'Product cancellation lifecycle type is unsupported');
            let entitlementState = evidence.entitlementState || 'NOT_DELIVERED'; let activatedBlocked = item.cancellationActivationPolicy === 'DENY_AFTER_ACTIVATION' && entitlementState === (config.activatedState || 'ACTIVATED'); let terminal = (config.terminalEntitlementStates || ['EXPIRED', 'REVOKED']).includes(entitlementState); let allowed = item.status === 'ACTIVE' && item.cancellationAllowed !== false && !activatedBlocked && !terminal; output.push({ orderEntryCode: selected.orderEntryCode, cancellationAllowed: allowed, reasonCode: item.status !== 'ACTIVE' ? 'PRODUCT_NOT_ACTIVE' : activatedBlocked ? 'ENTITLEMENT_ALREADY_ACTIVATED' : terminal ? 'ENTITLEMENT_ALREADY_TERMINAL' : 'PRODUCT_NOT_CANCELLABLE', policyCode: item.cancellationPolicyCode || 'product-default-cancellation-policy', lifecycleType: lifecycleType, physicalInventoryRequired: !(config.nonPhysicalTypes || []).includes(lifecycleType), providerActionRequired: Boolean(item.cancellationProviderActionCode) && !['NOT_DELIVERED', 'REVOKED'].includes(entitlementState), providerActionCode: item.cancellationProviderActionCode, entitlementReference: evidence.entitlementReference, entitlementState: entitlementState });
        }
        return { orderCode: request.orderCode, items: output };
    },
};
