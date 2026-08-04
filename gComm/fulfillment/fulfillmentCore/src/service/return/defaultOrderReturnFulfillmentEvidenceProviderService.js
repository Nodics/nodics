/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module fulfillment/service/return/DefaultOrderReturnFulfillmentEvidenceProviderService @description Projects delivered and already-returned exact quantities for return validation. @layer service @owner fulfillment */
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
     * Executes the exact operation within the fulfillmentCore-owned layered contract.
     *
     * @param {*} value Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    exact: function (value) { let text = String(value || '0'); if (!/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(text)) throw new CLASSES.NodicsError('ERR_FUL_00007', 'Return quantity evidence is invalid'); let parts = text.split('.'); return { units: BigInt(parts.join('')), scale: (parts[1] || '').length }; },
    /**
     * Executes the sum operation within the fulfillmentCore-owned layered contract.
     *
     * @param {*} values Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    sum: function (values) { let parsed = values.map(value => this.exact(value)); let scale = Math.max.apply(null, [0].concat(parsed.map(value => value.scale))); let units = parsed.reduce((total, value) => total + value.units * 10n ** BigInt(scale - value.scale), 0n); let digits = units.toString().padStart(scale + 1, '0'); return scale ? (digits.slice(0, -scale) || '0') + '.' + digits.slice(-scale) : digits; },
    /**
     * Resolves the module artifact within the fulfillmentCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    resolve: async function (request) { if (!request || !request.tenant || !request.authData || request.authData.tokenType !== 'service' || !request.entCode || !request.orderCode || !Array.isArray(request.items)) throw new CLASSES.NodicsError('ERR_FUL_00007', 'Fulfillment return evidence requires internal Order context'); let consignmentResponse = await SERVICE.DefaultFulfillmentConsignmentService.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: request.entCode, orderCode: request.orderCode }, searchOptions: { limit: 101 } }); let consignments = this.items(consignmentResponse); let returnResponse = await SERVICE.DefaultFulfillmentReturnRequestService.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: request.entCode, orderCode: request.orderCode }, searchOptions: { limit: 101 } }); let returns = this.items(returnResponse); if (consignments.length > 100 || returns.length > 100) throw new CLASSES.NodicsError('ERR_FUL_00007', 'Fulfillment return evidence exceeds bounds'); return { orderCode: request.orderCode, items: request.items.map(item => { let delivered = []; let deliveredAt = []; let fulfillmentCodes = []; consignments.filter(value => value.status === 'DELIVERED').forEach(consignment => { [].concat(consignment.allocationEvidence || []).filter(value => value.entryCode === item.orderEntryCode).forEach(value => { delivered.push(value.quantity); deliveredAt.push(consignment.deliveredAt || consignment.updatedAt); fulfillmentCodes.push(consignment.consignmentCode); }); }); let returned = returns.filter(value => [].concat(value.itemCodes || []).includes(item.orderEntryCode) && !['CANCELLED', 'REJECTED', 'FAILED'].includes(value.status)).map(value => value.requestedQuantity || '0'); return { orderEntryCode: item.orderEntryCode, unitCode: item.unitCode, deliveredQuantity: this.sum(delivered), alreadyReturnedQuantity: this.sum(returned), deliveredAt: deliveredAt.filter(Boolean).sort()[0], fulfillmentCodes: Array.from(new Set(fulfillmentCodes)) }; }) }; },
};
