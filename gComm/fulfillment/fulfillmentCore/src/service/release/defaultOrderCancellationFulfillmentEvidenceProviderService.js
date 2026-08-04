/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module fulfillment/service/release/DefaultOrderCancellationFulfillmentEvidenceProviderService @description Projects exact unshipped consignment evidence for Order cancellation eligibility. @layer service @owner fulfillment */
module.exports = {
    /**
     * Initializes the module artifact within the fulfillmentCore-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
    /**
     * Executes the items operation within the fulfillmentCore-owned layered contract.
     *
     * @param {*} value Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    items: function (value) { return value && Array.isArray(value.result) ? value.result : Array.isArray(value) ? value : []; },
    /**
     * Resolves the module artifact within the fulfillmentCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    resolve: async function (request) {
        if (!request || !request.tenant || !request.authData || request.authData.tokenType !== 'service' || !request.entCode || !request.orderCode || !Array.isArray(request.items)) throw new CLASSES.NodicsError('ERR_FUL_00010', 'Fulfillment cancellation evidence requires internal Order context');
        let response = await SERVICE.DefaultFulfillmentConsignmentService.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: request.entCode, orderCode: request.orderCode }, searchOptions: { limit: 101 } }); let consignments = this.items(response); if (consignments.length > 100) throw new CLASSES.NodicsError('ERR_FUL_00010', 'Fulfillment cancellation evidence exceeds consignment bounds');
        return { orderCode: request.orderCode, items: request.items.map(item => { let lifecycleType = ((item.immutableEvidence || {}).lifecycleType) || 'PHYSICAL'; let policy = (((CONFIG.get('fulfillment') || {}).fulfillmentPolicy || {}).cancellation) || {}; if ((policy.nonPhysicalLifecycleTypes || []).includes(lifecycleType)) return { orderEntryCode: item.orderEntryCode, unitCode: item.unitCode, cancellableQuantity: item.requestedQuantity, state: 'NOT_APPLICABLE', fulfillmentCodes: [], fulfillmentRequired: false, lifecycleType: lifecycleType }; let evidence = []; let blocked = false; consignments.forEach(consignment => { let cancelled = new Map([].concat(consignment.cancelledAllocationEvidence || []).map(value => [value.allocationCode, value])); [].concat(consignment.allocationEvidence || []).filter(value => value.entryCode === item.orderEntryCode).forEach(value => { evidence.push({ consignmentCode: consignment.consignmentCode, allocationCode: value.allocationCode, quantity: value.quantity, cancelledQuantity: (cancelled.get(value.allocationCode) || {}).quantity || '0' }); if (consignment.shipmentCode || ['SHIPPED', 'DELIVERED'].includes(consignment.status)) blocked = true; }); }); let quantities = evidence.map(value => value.quantity); let scale = Math.max.apply(null, [0].concat(quantities.map(value => (String(value).split('.')[1] || '').length))); let units = evidence.reduce((sum, value) => { let original = BigInt(String(value.quantity).replace('.', '')) * 10n ** BigInt(scale - (String(value.quantity).split('.')[1] || '').length); let cancelled = BigInt(String(value.cancelledQuantity).replace('.', '')) * 10n ** BigInt(scale - (String(value.cancelledQuantity).split('.')[1] || '').length); return sum + original - cancelled; }, 0n); let digits = units.toString().padStart(scale + 1, '0'); let quantity = blocked ? '0' : scale ? (digits.slice(0, -scale) || '0') + '.' + digits.slice(-scale) : digits; return { orderEntryCode: item.orderEntryCode, unitCode: item.unitCode, cancellableQuantity: quantity, state: blocked ? 'SHIPPED' : 'RELEASED', fulfillmentCodes: Array.from(new Set(evidence.map(value => value.consignmentCode))), fulfillmentRequired: true, lifecycleType: lifecycleType }; }) };
    },
};
