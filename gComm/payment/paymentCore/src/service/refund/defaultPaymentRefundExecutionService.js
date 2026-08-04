/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module payment/service/refund/DefaultPaymentRefundExecutionService @description Executes approved refund allocations through the shared Payment reversal authority with original-rail enforcement. @layer service @owner payment */
module.exports = {
    /**
     * Initializes the module artifact within the paymentCore-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
    /**
     * Executes the error operation within the paymentCore-owned layered contract.
     *
     * @param {*} message Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    error: function (message) { let error = new Error(message); error.code = 'ERR_PAY_00014'; return error; },
    /**
     * Executes the module artifact within the paymentCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    execute: async function (request) {
        let input = request && (request.refundExecution || request.body) || {};
        if (!input.refundCode) throw this.error('Payment refund execution requires approved refund identity');
        if (!SERVICE.DefaultPaymentCancellationExecutionService || typeof SERVICE.DefaultPaymentCancellationExecutionService.execute !== 'function') throw this.error('Payment reversal authority is unavailable');
        let result = await SERVICE.DefaultPaymentCancellationExecutionService.execute(Object.assign({}, request, { body: {
            enterpriseCode: input.enterpriseCode || input.entCode, refundCode: input.refundCode, orderCode: input.orderCode,
            requestVersion: input.requestVersion, forcedOperation: 'REFUND', allocations: input.allocations,
        } }));
        return { refundCode: input.refundCode, orderCode: result.orderCode, requestVersion: result.requestVersion, transactions: result.transactions };
    },
};
