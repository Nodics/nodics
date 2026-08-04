/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module payment/facade/refund/DefaultPaymentRefundOperationsFacade @description Delegates governed finance Refund retry and reconciliation. @layer facade @owner payment */
module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, input: function (request) { let body=request.body||{},model=body.model&&typeof body.model==='object'?body.model:{};return Object.assign({},request,model,body,{entCode:body.entCode||model.entCode||model.enterpriseCode,refundTransactionCode:body.refundTransactionCode||model.transactionCode,tenant:request.tenant,authData:request.authData}); }, retry: function (request) { return SERVICE.DefaultPaymentRefundService.retryRefund(this.input(request)); }, reconcile: function (request) { return SERVICE.DefaultPaymentRefundService.reconcileRefund(this.input(request)); }, adjust: function (request) { return SERVICE.DefaultPaymentRefundAdjustmentService.adjust(request); }, closeException: function (request) { return SERVICE.DefaultPaymentRefundAdjustmentService.closeException(request); } };
