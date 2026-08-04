/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/service/lifecycle/DefaultOrderLifecycleAuditService @description Records idempotent append-only Order history for lifecycle request decisions and owner checkpoints. @layer service @owner order */
module.exports = {
    /**
     * Initializes the module artifact within the order-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
    /**
     * Executes the items operation within the order-owned layered contract.
     *
     * @param {*} value Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    items: function (value) { return value && Array.isArray(value.result) ? value.result : Array.isArray(value) ? value : []; },
    /**
     * Executes the safe operation within the order-owned layered contract.
     *
     * @param {*} value Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    safe: function (value) { if (/cvv|cardNumber|pan|secret|password|rawGateway|gatewayPayload|providerPayload|rawCarrier|carrierPayload|warehousePath/i.test(JSON.stringify(value || {}))) throw new CLASSES.NodicsError('ERR_ORD_00055', 'Order lifecycle audit contains unsafe evidence'); },
    /**
     * Records the module artifact within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} lifecycleRequest Value defined by the surrounding Nodics operation contract.
     * @param {*} eventType Value defined by the surrounding Nodics operation contract.
     * @param {*} evidenceCode Value defined by the surrounding Nodics operation contract.
     * @param {*} message Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    record: async function (request, lifecycleRequest, eventType, evidenceCode, message) {
        if (!lifecycleRequest || !lifecycleRequest.requestCode || !eventType) throw new CLASSES.NodicsError('ERR_ORD_00055', 'Order lifecycle audit identity is required'); this.safe({ evidenceCode: evidenceCode, message: message });
        let historyCode = [lifecycleRequest.requestCode, eventType, evidenceCode || lifecycleRequest.version].join('::'); let existing = await SERVICE.DefaultOrderHistoryEntryService.get({ tenant: request.tenant, authData: request.authData, query: { entCode: lifecycleRequest.entCode, historyCode: historyCode }, searchOptions: { limit: 2 } }); let records = this.items(existing); if (records.length > 1) throw new CLASSES.NodicsError('ERR_ORD_00054', 'Order lifecycle audit identity is duplicated'); let auth = request.authData || {}; let model = records[0] || { active: true, entCode: lifecycleRequest.entCode, orderCode: lifecycleRequest.orderCode, historyCode: historyCode, eventType: eventType, statusTo: lifecycleRequest.state, reasonCode: lifecycleRequest.reasonCode, actorType: auth.tokenType === 'access' ? 'EMPLOYEE_OR_CUSTOMER' : 'SERVICE', actorCode: auth.principalId || auth.customerCode || auth.userCode || 'SYSTEM', sourceModule: 'order', sourceOperation: 'orderLifecycle', evidenceCode: evidenceCode || lifecycleRequest.requestCode, message: String(message || eventType).slice(0, 500) }; if (!records.length) { let saved = await SERVICE.DefaultOrderHistoryEntryService.save({ tenant: request.tenant, authData: request.authData, model: model }); model = this.items(saved)[0] || model; } if (SERVICE.DefaultOrderLifecycleEventService) await SERVICE.DefaultOrderLifecycleEventService.publish(request, lifecycleRequest, eventType, model); return Object.assign(records.length ? { idempotent: true } : {}, model);
    },
};
