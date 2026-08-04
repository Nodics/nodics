/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/service/lifecycle/DefaultOrderRefundCalculationService @description Adapts immutable Refund request selections to the shared Order-to-Payment exact calculation contract. @layer service @owner order */
module.exports = {
    /**
     * Initializes the module artifact within the order-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
    /**
     * Executes the error operation within the order-owned layered contract.
     *
     * @param {*} message Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    error: function (message) { let error = new Error(message); error.code = 'ERR_ORD_00062'; return error; },
    /**
     * Executes the input operation within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    input: function (request) { return request.refundCalculation || request.body || {}; },
    /**
     * Validates the module artifact within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    validate: function (request) { let input = this.input(request); if (!request.tenant || !request.authData || !input.request || input.request.requestType !== 'REFUND' || !Array.isArray(input.items) || !input.items.length) throw this.error('Refund calculation requires immutable Refund request evidence'); return input; },
    /**
     * Calculates the module artifact within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} input Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    calculate: async function (request, input) { let service = SERVICE.DefaultOrderCancellationCalculationService; if (!service || typeof service.calculate !== 'function') throw this.error('Order refund calculation adapter is unavailable'); let paymentTransactions = input.paymentTransactions || []; let eligibility = { eligible: true, items: input.items.map(item => ({ eligible: true, orderEntryCode: item.orderEntryCode, requestedQuantity: item.requestedQuantity, evidence: { paymentTransactions: paymentTransactions } })) }; return service.calculate(Object.assign({}, request, { cancellationCalculation: { entCode: input.request.entCode, orderCode: input.request.orderCode, idempotencyKey: [input.request.idempotencyKey, input.request.version, 'refund-calculation'].join('::'), eligibility: eligibility, orderEntries: input.orderEntries, paymentAllocations: input.paymentAllocations } })); },
    /**
     * Validates calculation within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    validateCalculation: function (request, response, process) { try { response.refundInput = this.validate(request); process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); } },
    /**
     * Calculates refund within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    calculateRefund: async function (request, response, process) { try { response.refundCalculation = await this.calculate(request, response.refundInput); process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); } },
    /**
     * Handles success end within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    handleSuccessEnd: function (request, response, process) { process.resolve(response.refundCalculation); }, handleErrorEnd: function (request, response, process) { process.reject(response.error || this.error('Refund calculation Pipeline failed')); },
};
