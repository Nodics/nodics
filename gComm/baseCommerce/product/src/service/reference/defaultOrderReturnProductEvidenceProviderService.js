/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module product/service/reference/DefaultOrderReturnProductEvidenceProviderService @description Projects Product-owned returnability and window evidence. @layer service @owner product */
module.exports = {
    /**
     * Executes the init operation within the product-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
    /**
     * Executes the resolve operation within the product-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    resolve: async function (request) { if (!request || !request.tenant || !request.authData || request.authData.tokenType !== 'service' || !request.entCode || !Array.isArray(request.items)) throw SERVICE.DefaultProductEnterpriseScopeService.error('ERR_PRODUCT_00031', 'Product return evidence requires internal Order context'); let output = []; for (let selected of request.items) { let identity = selected.immutableEvidence || {}; if (!identity.catalogCode || !identity.itemType || !identity.itemCode) throw SERVICE.DefaultProductEnterpriseScopeService.error('ERR_PRODUCT_00031', 'Product return evidence requires immutable Product identity'); let response = await SERVICE.DefaultProductItemService.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: request.entCode, catalogCode: identity.catalogCode, itemType: identity.itemType, itemCode: identity.itemCode }, searchOptions: { limit: 2 } }); let records = response && Array.isArray(response.result) ? response.result : []; if (records.length !== 1) throw SERVICE.DefaultProductEnterpriseScopeService.error('ERR_PRODUCT_00031', 'Product return identity is unavailable'); let item = records[0]; let config = ((CONFIG.get('product') || {}).lifecycleCancellation) || {}; let lifecycleType = item.lifecycleType || identity.lifecycleType || 'PHYSICAL'; if (!(config.supportedLifecycleTypes || ['PHYSICAL']).includes(lifecycleType)) throw SERVICE.DefaultProductEnterpriseScopeService.error('ERR_PRODUCT_00031', 'Product return lifecycle type is unsupported'); output.push({ orderEntryCode: selected.orderEntryCode, returnAllowed: item.status === 'ACTIVE' && item.returnAllowed !== false, returnWindowDays: Number(item.returnWindowDays === undefined ? 30 : item.returnWindowDays), policyCode: item.returnPolicyCode || 'product-default-return-policy', lifecycleType: lifecycleType, physicalReturnRequired: !(config.nonPhysicalTypes || []).includes(lifecycleType), reasonCode: item.status === 'ACTIVE' ? 'PRODUCT_NOT_RETURNABLE' : 'PRODUCT_NOT_ACTIVE' }); } return { orderCode: request.orderCode, items: output }; },
};
