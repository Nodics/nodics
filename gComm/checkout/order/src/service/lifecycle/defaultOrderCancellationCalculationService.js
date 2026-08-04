/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/service/lifecycle/DefaultOrderCancellationCalculationService
 * @description Coordinates side-effect-free cancellation amount calculation from immutable Order evidence through Payment-owned refund policy.
 * @layer service
 * @owner order
 * @override Projects may replace evidence loading or pipeline nodes while preserving Payment calculation authority and immutable Tax/Promotion references.
 */
module.exports = {
    /**
     * Initializes the module artifact within the order-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    init: function () { return Promise.resolve(true); },
    /**
     * Completes initialization for the module artifact within the order-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    postInit: function () { return Promise.resolve(true); },
    /**
     * Executes the config operation within the order-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    config: function () { return ((((CONFIG.get('order') || {}).orderLifecycle) || {}).cancellationCalculation) || {}; },
    /**
     * Executes the error operation within the order-owned layered contract.
     *
     * @param {*} message Value defined by the surrounding Nodics operation contract.
     * @param {*} code Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    error: function (message, code) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, code || 'ERR_ORD_00049');
        let error = new Error(message); error.code = code || 'ERR_ORD_00049'; return error;
    },
    /**
     * Asserts safe within the order-owned layered contract.
     *
     * @param {*} value Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    assertSafe: function (value) {
        if (JSON.stringify(value || {}).match(/cvv|cardNumber|pan|secret|password|rawGateway|gatewayPayload|providerPayload|rawTaxPayload|rawPromotionPayload/i)) {
            throw this.error('Cancellation calculation contains prohibited raw or secret evidence');
        }
    },
    /**
     * Executes the items operation within the order-owned layered contract.
     *
     * @param {*} value Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    items: function (value) {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (Array.isArray(value.result)) return value.result;
        if (Array.isArray(value.items)) return value.items;
        return [value];
    },
    /**
     * Executes the input operation within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    input: function (request) { return request && (request.cancellationCalculation || request.body) || {}; },
    /**
     * Validates the module artifact within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    validate: function (request) {
        let input = this.input(request); this.assertSafe(input);
        if (this.config().enabled === false || !request || !request.tenant || !request.authData || !input.entCode || !input.orderCode || !input.eligibility || input.eligibility.eligible !== true) {
            throw this.error('Cancellation calculation requires tenant, auth, enterprise, Order, and successful eligibility evidence');
        }
        let selections = this.items(input.eligibility.items);
        if (!selections.length || selections.some(item => item.eligible !== true || !item.orderEntryCode || typeof item.requestedQuantity !== 'string')) {
            throw this.error('Cancellation calculation requires eligible exact item selections');
        }
        return input;
    },
    /**
     * Loads the module artifact within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} input Value defined by the surrounding Nodics operation contract.
     * @param {*} directKey Value defined by the surrounding Nodics operation contract.
     * @param {*} serviceKey Value defined by the surrounding Nodics operation contract.
     * @param {*} query Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    load: async function (request, input, directKey, serviceKey, query) {
        let direct = this.items(input[directKey] || request[directKey]);
        let limit = Number(this.config().maximumAggregateRecords || 1000);
        if (direct.length) {
            if (direct.length > limit) throw this.error('Cancellation calculation evidence exceeds configured bounds');
            return direct;
        }
        let service = SERVICE[this.config()[serviceKey]];
        if (!service || typeof service.get !== 'function') throw this.error('Cancellation calculation source service is unavailable');
        let result = await service.get({ tenant: request.tenant, authData: request.authData, query: query, searchOptions: { limit: limit + 1 } });
        let records = this.items(result);
        if (records.length > limit) throw this.error('Cancellation calculation evidence exceeds configured bounds');
        return records;
    },
    /**
     * Resolves evidence within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} input Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    resolveEvidence: async function (request, input) {
        let orderEntries = await this.load(request, input, 'orderEntries', 'orderEntrySourceService', { orderCode: input.orderCode });
        let paymentAllocations = await this.load(request, input, 'paymentAllocations', 'paymentAllocationSourceService', { orderCode: input.orderCode });
        this.assertSafe({ orderEntries: orderEntries, paymentAllocations: paymentAllocations });
        return { orderEntries: orderEntries, paymentAllocations: paymentAllocations };
    },
    /**
     * Executes the pricing evidence operation within the order-owned layered contract.
     *
     * @param {*} selection Value defined by the surrounding Nodics operation contract.
     * @param {*} entry Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    pricingEvidence: function (selection, entry) {
        if (!entry || entry.entryCode !== selection.orderEntryCode || !entry.currencyCode) throw this.error('Cancellation calculation Order Entry evidence is incomplete');
        return {
            orderEntryCode: entry.entryCode,
            requestedQuantity: selection.requestedQuantity,
            orderedQuantity: entry.quantity,
            currencyCode: entry.currencyCode,
            lineNetAmount: entry.lineNetAmount,
            lineGrossAmount: entry.lineGrossAmount,
            taxTotal: entry.taxTotal,
            discountTotal: entry.discountTotal,
            taxIncluded: entry.taxIncluded,
            taxInclusionMode: entry.taxInclusionMode,
            priceEvidenceCode: entry.priceEvidenceCode,
            taxQuoteCode: entry.taxQuoteCode,
            taxQuoteLineCode: entry.taxQuoteLineCode,
            taxJurisdictionCode: entry.taxJurisdictionCode,
        };
    },
    /**
     * Executes the owner evidence operation within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} input Value defined by the surrounding Nodics operation contract.
     * @param {*} pricingEvidence Value defined by the surrounding Nodics operation contract.
     * @param {*} currencyCode Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    ownerEvidence: async function (request, input, pricingEvidence, currencyCode) { let tax = SERVICE[this.config().taxRefundEvidenceService], promotion = SERVICE[this.config().promotionRefundImpactService], shipping = SERVICE[this.config().shippingRefundPolicyService]; if (!tax || typeof tax.calculate !== 'function') throw this.error('Tax Refund evidence authority is unavailable'); if (!promotion || typeof promotion.calculate !== 'function') throw this.error('Promotion Refund impact authority is unavailable'); if (!shipping || typeof shipping.calculate !== 'function') throw this.error('Fulfillment shipping Refund policy authority is unavailable'); let context = { entCode: input.entCode, orderCode: input.orderCode, currencyCode: currencyCode, items: pricingEvidence }; let taxEvidence = await tax.calculate({ tenant: request.tenant, authData: request.authData, taxRefundEvidence: context }); let promotionEvidence = await promotion.calculate({ tenant: request.tenant, authData: request.authData, promotionRefundImpact: context }); let shippingEvidence = await shipping.calculate({ tenant: request.tenant, authData: request.authData, shippingRefundEvidence: Object.assign({ currencyCode: currencyCode }, input.shippingRefundEvidence || {}) }); this.assertSafe({ taxEvidence: taxEvidence, promotionEvidence: promotionEvidence, shippingEvidence: shippingEvidence }); return { taxEvidence: taxEvidence, promotionEvidence: promotionEvidence, shippingEvidence: shippingEvidence }; },
    /**
     * Calculates the module artifact within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    calculate: async function (request) {
        let input = this.validate(request); let evidence = await this.resolveEvidence(request, input);
        let entries = new Map();
        evidence.orderEntries.forEach(entry => {
            if (!entry.entryCode || entries.has(entry.entryCode)) throw this.error('Cancellation calculation contains invalid or duplicate Order Entry evidence');
            entries.set(entry.entryCode, entry);
        });
        let selections = input.eligibility.items.map(item => ({ entryCode: item.orderEntryCode, requestedQuantity: item.requestedQuantity }));
        let pricingEvidence = input.eligibility.items.map(item => this.pricingEvidence(item, entries.get(item.orderEntryCode)));
        let paymentTransactions = input.eligibility.items.reduce((result, item) => result.concat(item.evidence && item.evidence.paymentTransactions || []), []);
        let paymentByGroup = new Map();
        paymentTransactions.forEach(transaction => { if (transaction.paymentGroupCode && !paymentByGroup.has(transaction.paymentGroupCode)) paymentByGroup.set(transaction.paymentGroupCode, transaction); });
        let routedAllocations = evidence.paymentAllocations.map(allocation => { let transaction = paymentByGroup.get(allocation.paymentGroupCode); return transaction ? Object.assign({}, allocation, { originalTransactionCode: transaction.transactionCode, providerCode: transaction.providerCode, paymentModeCode: transaction.paymentModeCode }) : allocation; });
        let currencies = new Set(pricingEvidence.map(item => item.currencyCode)); if (currencies.size !== 1) throw this.error('Cancellation calculation pricing requires one currency'); let currencyCode = pricingEvidence[0].currencyCode;
        let commercialEvidence = await this.ownerEvidence(request, input, pricingEvidence, currencyCode);
        let service = SERVICE[this.config().paymentCalculationService];
        if (!service || typeof service.calculate !== 'function') throw this.error('Payment refund calculation authority is unavailable', 'ERR_ORD_00050');
        let paymentCalculation = await service.calculate({
            tenant: request.tenant, authData: request.authData, entCode: input.entCode,
            orderCode: input.orderCode, idempotencyKey: input.idempotencyKey,
            cancellationItems: selections, paymentAllocations: routedAllocations,
            shippingRefundEvidence: commercialEvidence.shippingEvidence,
        });
        this.assertSafe(paymentCalculation);
        if (pricingEvidence.some(item => item.currencyCode !== paymentCalculation.currencyCode)) throw this.error('Cancellation calculation pricing and Payment currencies do not match');
        return {
            orderCode: input.orderCode,
            entCode: input.entCode,
            calculationCode: paymentCalculation.calculationCode,
            amount: paymentCalculation.amount,
            eligibleAmount: paymentCalculation.eligibleAmount,
            currencyCode: paymentCalculation.currencyCode,
            strategy: paymentCalculation.strategy,
            pricingEvidence: pricingEvidence,
            paymentCalculation: paymentCalculation,
            shippingCharge: { included: commercialEvidence.shippingEvidence.shippingRefundAmount !== '0.00' && commercialEvidence.shippingEvidence.shippingRefundAmount !== '0', authority: 'fulfillment', evidence: commercialEvidence.shippingEvidence },
            tax: { included: paymentCalculation.evidence.includeTax === true, authority: 'tax', evidence: commercialEvidence.taxEvidence },
            discount: { included: paymentCalculation.evidence.includeDiscount === true, authority: 'promotion', evidence: commercialEvidence.promotionEvidence },
        };
    },
    /**
     * Validates request within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    validateRequest: function (request, response, process) {
        try { response.cancellationCalculationInput = this.validate(request); process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); }
    },
    /**
     * Resolves order evidence within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    resolveOrderEvidence: async function (request, response, process) {
        try { response.cancellationCalculationEvidence = await this.resolveEvidence(request, response.cancellationCalculationInput || this.input(request)); process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); }
    },
    /**
     * Calculates payment amount within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    calculatePaymentAmount: async function (request, response, process) {
        try {
            let input = Object.assign({}, response.cancellationCalculationInput || this.input(request), response.cancellationCalculationEvidence || {});
            response.cancellationCalculation = await this.calculate(Object.assign({}, request, { cancellationCalculation: input })); process.nextSuccess(request, response);
        } catch (error) { process.error(request, response, error); }
    },
    /**
     * Executes the finalize calculation operation within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    finalizeCalculation: function (request, response, process) { process.nextSuccess(request, response); },
    /**
     * Handles sucess end within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    handleSucessEnd: function (request, response, process) { process.resolve(response.cancellationCalculation); },
    /**
     * Handles error end within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    handleErrorEnd: function (request, response, process) { process.reject(response.error || this.error('Cancellation calculation pipeline failed', 'ERR_ORD_00050')); },
};
