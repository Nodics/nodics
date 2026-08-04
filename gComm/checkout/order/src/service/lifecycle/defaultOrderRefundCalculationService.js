/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/service/lifecycle/DefaultOrderRefundCalculationService @description Adapts immutable Refund request selections to the shared Order-to-Payment exact calculation contract. @layer service @owner order */
module.exports = {
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
    error: function (message) { let error = new Error(message); error.code = 'ERR_ORD_00062'; return error; },
    input: function (request) { return request.refundCalculation || request.body || {}; },
    validate: function (request) { let input = this.input(request); if (!request.tenant || !request.authData || !input.request || input.request.requestType !== 'REFUND' || !Array.isArray(input.items) || !input.items.length) throw this.error('Refund calculation requires immutable Refund request evidence'); return input; },
    calculate: async function (request, input) { let service = SERVICE.DefaultOrderCancellationCalculationService; if (!service || typeof service.calculate !== 'function') throw this.error('Order refund calculation adapter is unavailable'); let paymentTransactions = input.paymentTransactions || []; let eligibility = { eligible: true, items: input.items.map(item => ({ eligible: true, orderEntryCode: item.orderEntryCode, requestedQuantity: item.requestedQuantity, evidence: { paymentTransactions: paymentTransactions } })) }; return service.calculate(Object.assign({}, request, { cancellationCalculation: { entCode: input.request.entCode, orderCode: input.request.orderCode, idempotencyKey: [input.request.idempotencyKey, input.request.version, 'refund-calculation'].join('::'), eligibility: eligibility, orderEntries: input.orderEntries, paymentAllocations: input.paymentAllocations } })); },
    validateCalculation: function (request, response, process) { try { response.refundInput = this.validate(request); process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); } },
    calculateRefund: async function (request, response, process) { try { response.refundCalculation = await this.calculate(request, response.refundInput); process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); } },
    handleSuccessEnd: function (request, response, process) { process.resolve(response.refundCalculation); }, handleErrorEnd: function (request, response, process) { process.reject(response.error || this.error('Refund calculation Pipeline failed')); },
};
