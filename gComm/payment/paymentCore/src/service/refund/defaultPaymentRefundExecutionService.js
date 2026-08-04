/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module payment/service/refund/DefaultPaymentRefundExecutionService @description Executes approved refund allocations through the shared Payment reversal authority with original-rail enforcement. @layer service @owner payment */
module.exports = {
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
    error: function (message) { let error = new Error(message); error.code = 'ERR_PAY_00014'; return error; },
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
