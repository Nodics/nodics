/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/service/lifecycle/DefaultOrderCancellationEligibilityService
 * @description Evaluates pre-fulfillment cancellation eligibility from exact Order evidence and normalized owner-provided Inventory, Fulfillment, Payment, and Product evidence.
 * @layer service
 * @owner order
 * @override Project modules may replace policy, providers, or individual pipeline nodes while preserving fail-closed owner evidence and exact quantities.
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
    config: function () { return ((((CONFIG.get('order') || {}).orderLifecycle) || {}).cancellationEligibility) || {}; },
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
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, code || 'ERR_ORD_00047');
        let error = new Error(message); error.code = code || 'ERR_ORD_00047'; return error;
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
        if (JSON.stringify(value || {}).match(/cvv|cardNumber|pan|secret|password|rawGateway|gatewayPayload|providerPayload|rawCarrier|carrierPayload|rawLabel|warehousePath/i)) {
            throw this.error('Cancellation eligibility evidence contains prohibited raw or secret data');
        }
    },
    /**
     * Executes the exact operation within the order-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    exact: function () {
        if (!SERVICE.DefaultExactUnitsService || typeof SERVICE.DefaultExactUnitsService.parse !== 'function' || typeof SERVICE.DefaultExactUnitsService.format !== 'function') {
            throw this.error('Units exact arithmetic service is unavailable');
        }
        return SERVICE.DefaultExactUnitsService;
    },
    /**
     * Executes the align operation within the order-owned layered contract.
     *
     * @param {*} left Value defined by the surrounding Nodics operation contract.
     * @param {*} right Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    align: function (left, right) {
        let exact = this.exact(); let a = exact.parse(left); let b = exact.parse(right); let scale = Math.max(a.scale, b.scale);
        return {
            left: a.unscaled * 10n ** BigInt(scale - a.scale),
            right: b.unscaled * 10n ** BigInt(scale - b.scale),
            scale: scale,
            format: exact.format.bind(exact)
        };
    },
    /**
     * Executes the minimum operation within the order-owned layered contract.
     *
     * @param {*} values Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    minimum: function (values) {
        let result = values[0];
        values.slice(1).forEach(value => { let compared = this.align(result, value); if (compared.right < compared.left) result = value; });
        return result;
    },
    /**
     * Executes the positive operation within the order-owned layered contract.
     *
     * @param {*} value Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    positive: function (value) { let parsed = this.exact().parse(value); return parsed.unscaled > 0n; },
    /**
     * Executes the non negative operation within the order-owned layered contract.
     *
     * @param {*} value Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    nonNegative: function (value) { let parsed = this.exact().parse(value); return parsed.unscaled >= 0n; },
    /**
     * Executes the less than or equal operation within the order-owned layered contract.
     *
     * @param {*} left Value defined by the surrounding Nodics operation contract.
     * @param {*} right Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    lessThanOrEqual: function (left, right) { let compared = this.align(left, right); return compared.left <= compared.right; },
    /**
     * Executes the subtract operation within the order-owned layered contract.
     *
     * @param {*} left Value defined by the surrounding Nodics operation contract.
     * @param {*} right Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    subtract: function (left, right) {
        let compared = this.align(left, right); let result = compared.left - compared.right;
        if (result < 0n) throw this.error('Cancellation quantity evidence cannot become negative');
        return compared.format(result, compared.scale);
    },
    /**
     * Executes the input operation within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    input: function (request) { return request && (request.cancellationEligibility || request.body) || {}; },
    /**
     * Validates the module artifact within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    validate: function (request) {
        let input = this.input(request); let config = this.config(); this.assertSafe(input);
        if (config.enabled === false || !request || !request.tenant || !request.authData || !input.entCode || !input.order || !input.order.code) {
            throw this.error('Cancellation eligibility requires tenant, auth, enterprise, and Order evidence');
        }
        if (!(config.cancellableOrderStates || []).includes(input.order.status)) throw this.error('Order state is not cancellable', 'ERR_ORD_00048');
        let items = input.items || [];
        if (!Array.isArray(items) || !items.length || items.length > Number(config.maximumItemsPerEvaluation || 100)) throw this.error('Cancellation eligibility requires a bounded item selection');
        let createdAt = input.order.placedAt || input.order.createdAt;
        if (Number(config.cancellationWindowMinutes || 0) > 0) {
            if (!createdAt) throw this.error('Cancellation window evaluation requires Order placement time');
            let now = request.now ? new Date(request.now) : new Date(); let placed = new Date(createdAt);
            if (!Number.isFinite(now.getTime()) || !Number.isFinite(placed.getTime()) || placed.getTime() > now.getTime() || now.getTime() - placed.getTime() > Number(config.cancellationWindowMinutes) * 60000) {
                throw this.error('Order cancellation window has expired', 'ERR_ORD_00048');
            }
        }
        let selectedEntries = new Set();
        items.forEach(item => {
            if (!item.orderEntryCode || !item.unitCode || typeof item.requestedQuantity !== 'string' || !this.positive(item.requestedQuantity)) throw this.error('Cancellation item requires entry, unit, and exact positive requested quantity');
            if (selectedEntries.has(item.orderEntryCode)) throw this.error('Cancellation item selection contains duplicate Order entries');
            selectedEntries.add(item.orderEntryCode);
        });
        return input;
    },
    /**
     * Executes the provider evidence operation within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} owner Value defined by the surrounding Nodics operation contract.
     * @param {*} input Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    providerEvidence: async function (request, owner, input) {
        if (input.ownerEvidence && input.ownerEvidence[owner]) return input.ownerEvidence[owner];
        let descriptor = (this.config().evidenceProviders || {})[owner] || {};
        let service = SERVICE[descriptor.service]; let operation = descriptor.operation || 'resolve';
        if (!service || typeof service[operation] !== 'function') throw this.error('Cancellation eligibility ' + owner + ' evidence provider is unavailable');
        return service[operation]({
            tenant: request.tenant, authData: request.authData, entCode: input.entCode,
            orderCode: input.order.code, items: input.items, correlationId: input.correlationId
        });
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
        let evidence = {};
        for (let owner of ['inventory', 'fulfillment', 'payment', 'product']) evidence[owner] = await this.providerEvidence(request, owner, input);
        this.assertSafe(evidence);
        return evidence;
    },
    /**
     * Executes the by entry operation within the order-owned layered contract.
     *
     * @param {*} ownerEvidence Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    byEntry: function (ownerEvidence) {
        let result = new Map();
        if (!ownerEvidence || !Array.isArray(ownerEvidence.items)) throw this.error('Cancellation eligibility owner evidence must contain normalized items');
        ownerEvidence.items.forEach(item => {
            if (!item.orderEntryCode || result.has(item.orderEntryCode)) throw this.error('Cancellation eligibility owner evidence contains an invalid or duplicate Order entry');
            result.set(item.orderEntryCode, item);
        });
        return result;
    },
    /**
     * Evaluates the module artifact within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    evaluate: async function (request) {
        let input = this.validate(request); let evidence = await this.resolveEvidence(request, input); let config = this.config();
        let inventory = this.byEntry(evidence.inventory); let fulfillment = this.byEntry(evidence.fulfillment); let product = this.byEntry(evidence.product); let payment = this.byEntry(evidence.payment);
        let results = input.items.map(item => {
            let inventoryItem = inventory.get(item.orderEntryCode); let fulfillmentItem = fulfillment.get(item.orderEntryCode);
            let productItem = product.get(item.orderEntryCode); let paymentItem = payment.get(item.orderEntryCode);
            if (!inventoryItem || !fulfillmentItem || !productItem || !paymentItem) throw this.error('Cancellation eligibility owner evidence is incomplete for ' + item.orderEntryCode);
            if (inventoryItem.unitCode !== item.unitCode || fulfillmentItem.unitCode !== item.unitCode) throw this.error('Cancellation eligibility owner evidence unit does not match Order evidence for ' + item.orderEntryCode);
            if (typeof inventoryItem.releasableQuantity !== 'string' || !this.nonNegative(inventoryItem.releasableQuantity) || typeof fulfillmentItem.cancellableQuantity !== 'string' || !this.nonNegative(fulfillmentItem.cancellableQuantity)) {
                throw this.error('Cancellation eligibility owner quantities must be exact non-negative strings for ' + item.orderEntryCode);
            }
            let reasons = [];
            if (productItem.cancellationAllowed !== true) reasons.push(productItem.reasonCode || 'PRODUCT_NOT_CANCELLABLE');
            if ((config.fulfillmentBlockingStates || []).includes(fulfillmentItem.state)) reasons.push('FULFILLMENT_ALREADY_' + fulfillmentItem.state);
            let ordered = item.orderedQuantity || item.immutableEvidence && item.immutableEvidence.orderedQuantity;
            if (typeof ordered !== 'string') throw this.error('Cancellation eligibility requires exact ordered quantity for ' + item.orderEntryCode);
            let alreadyResolved = item.alreadyCancelledQuantity || '0';
            if (!this.nonNegative(ordered) || typeof alreadyResolved !== 'string' || !this.nonNegative(alreadyResolved)) throw this.error('Cancellation eligibility Order quantities must be exact non-negative strings for ' + item.orderEntryCode);
            let remaining = this.subtract(ordered, alreadyResolved);
            let eligibleQuantity = this.minimum([remaining, inventoryItem.releasableQuantity, fulfillmentItem.cancellableQuantity]);
            if (!this.positive(eligibleQuantity)) reasons.push('NO_CANCELLABLE_QUANTITY');
            if (!this.lessThanOrEqual(item.requestedQuantity, eligibleQuantity)) reasons.push('REQUESTED_QUANTITY_EXCEEDS_ELIGIBLE');
            let paymentAction = (config.paymentActions || {})[paymentItem.state];
            if (paymentAction === undefined) reasons.push('PAYMENT_STATE_UNSUPPORTED');
            return {
                orderEntryCode: item.orderEntryCode, unitCode: item.unitCode,
                requestedQuantity: item.requestedQuantity, eligibleQuantity: eligibleQuantity,
                eligible: reasons.length === 0, reasons: reasons,
                requiredActions: {
                    payment: paymentAction,
                    inventory: inventoryItem.inventoryRequired === false ? 'NONE' : this.positive(inventoryItem.releasableQuantity) ? 'RELEASE' : 'NONE',
                    fulfillment: fulfillmentItem.fulfillmentRequired === false ? 'NONE' : this.positive(fulfillmentItem.cancellableQuantity) ? 'CANCEL_RELEASE' : 'NONE',
                    productLifecycle: productItem.providerActionRequired === true ? productItem.providerActionCode : 'NONE'
                },
                evidence: {
                    inventoryAllocationCodes: inventoryItem.allocationCodes || [],
                    inventoryCancellationAllocations: inventoryItem.cancellationAllocations || [],
                    fulfillmentCodes: fulfillmentItem.fulfillmentCodes || [],
                    paymentTransactionCodes: paymentItem.transactionCodes || [],
                    paymentTransactions: paymentItem.transactions || [],
                    productPolicyCode: productItem.policyCode,
                    lifecycleType: productItem.lifecycleType,
                    entitlementReference: productItem.entitlementReference,
                    entitlementState: productItem.entitlementState,
                    productProviderActionRequired: productItem.providerActionRequired === true,
                    productProviderActionCode: productItem.providerActionCode,
                    inventoryRequired: inventoryItem.inventoryRequired !== false,
                    fulfillmentRequired: fulfillmentItem.fulfillmentRequired !== false
                }
            };
        });
        return {
            orderCode: input.order.code, entCode: input.entCode,
            eligible: results.every(item => item.eligible), items: results,
            evaluatedAt: request.now ? new Date(request.now) : new Date()
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
    validateRequest: async function (request, response, process) {
        try { response.cancellationInput = this.validate(request); process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); }
    },
    /**
     * Resolves owner evidence within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    resolveOwnerEvidence: async function (request, response, process) {
        try { response.ownerEvidence = await this.resolveEvidence(request, response.cancellationInput || this.input(request)); process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); }
    },
    /**
     * Evaluates items within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    evaluateItems: async function (request, response, process) {
        try {
            let input = Object.assign({}, response.cancellationInput || this.input(request), { ownerEvidence: response.ownerEvidence });
            response.eligibility = await this.evaluate(Object.assign({}, request, { cancellationEligibility: input })); process.nextSuccess(request, response);
        } catch (error) { process.error(request, response, error); }
    },
    /**
     * Executes the finalize eligibility operation within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    finalizeEligibility: function (request, response, process) { process.nextSuccess(request, response); },
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
    handleSucessEnd: function (request, response, process) { process.resolve(response.eligibility); },
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
    handleErrorEnd: function (request, response, process) { process.reject(response.error || this.error('Cancellation eligibility pipeline failed')); }
};
