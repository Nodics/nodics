/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module inventory/service/allocation/DefaultOrderCancellationInventoryEvidenceProviderService @description Projects exact releasable allocation evidence for Order cancellation eligibility. @layer service @owner inventory */
module.exports = {
    /**
     * Initializes the module artifact within the inventory-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
    /**
     * Executes the items operation within the inventory-owned layered contract.
     *
     * @param {*} value Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    items: function (value) { return value && Array.isArray(value.result) ? value.result : Array.isArray(value) ? value : []; },
    /**
     * Normalizes the module artifact within the inventory-owned layered contract.
     *
     * @param {*} value Value defined by the surrounding Nodics operation contract.
     * @param {*} scale Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    normalize: function (value, scale) { return SERVICE.DefaultExactUnitsService.multiplyRational(value, '1', '1', scale, 'UNNECESSARY'); },
    /**
     * Executes the negate operation within the inventory-owned layered contract.
     *
     * @param {*} value Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    negate: function (value) { let parsed = SERVICE.DefaultExactUnitsService.parse(value); return SERVICE.DefaultExactUnitsService.format(-parsed.unscaled, parsed.scale); },
    /**
     * Resolves the module artifact within the inventory-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    resolve: async function (request) {
        if (!request || !request.tenant || !request.authData || request.authData.tokenType !== 'service' || !request.entCode || !request.orderCode || !Array.isArray(request.items)) throw new CLASSES.NodicsError('ERR_INV_00055', 'Inventory cancellation evidence requires internal Order context');
        let output = [];
        for (let item of request.items) {
            let lifecycleType = ((item.immutableEvidence || {}).lifecycleType) || 'PHYSICAL'; let policy = ((((CONFIG.get('inventory') || {}).stockAllocation || {}).cancellation) || {}); if ((policy.nonPhysicalLifecycleTypes || []).includes(lifecycleType)) { output.push({ orderEntryCode: item.orderEntryCode, unitCode: item.unitCode, releasableQuantity: item.requestedQuantity, allocationCodes: [], cancellationAllocations: [], inventoryRequired: false, lifecycleType: lifecycleType }); continue; }
            let response = await SERVICE.DefaultStockAllocationService.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: request.entCode, demandCode: request.orderCode, demandLineCode: item.orderEntryCode }, searchOptions: { limit: 101 } });
            let allocations = this.items(response); if (allocations.length > 100) throw new CLASSES.NodicsError('ERR_INV_00055', 'Inventory cancellation evidence exceeds allocation bounds');
            let unitCodes = new Set(allocations.map(value => value.unitCode)); if (unitCodes.size > 1 || unitCodes.size && !unitCodes.has(item.unitCode)) throw new CLASSES.NodicsError('ERR_INV_00055', 'Inventory cancellation evidence Unit mismatch');
            let scale = Math.max.apply(null, [0].concat(allocations.map(value => Number(value.scale || 0)))); let total = this.normalize('0', scale); let plans = [];
            allocations.forEach(allocation => { let available = SERVICE.DefaultExactUnitsService.add(this.normalize(allocation.allocatedQuantity, scale), this.negate(SERVICE.DefaultExactUnitsService.add(this.normalize(allocation.fulfilledQuantity || '0', scale), this.normalize(allocation.cancelledQuantity || '0', scale), scale, 'UNNECESSARY')), scale, 'UNNECESSARY'); if (SERVICE.DefaultExactUnitsService.parse(available).unscaled > 0n) { total = SERVICE.DefaultExactUnitsService.add(total, available, scale, 'UNNECESSARY'); plans.push({ allocationCode: allocation.code, quantity: available, unitCode: allocation.unitCode, serialNumbers: [].concat(allocation.assignments || []).filter(value => value.state !== 'FULFILLED').reduce((result, value) => result.concat(value.serialNumbers || []), []) }); } });
            output.push({ orderEntryCode: item.orderEntryCode, unitCode: item.unitCode, releasableQuantity: total, allocationCodes: plans.map(value => value.allocationCode), cancellationAllocations: plans, inventoryRequired: true, lifecycleType: lifecycleType });
        }
        return { orderCode: request.orderCode, items: output };
    },
};
