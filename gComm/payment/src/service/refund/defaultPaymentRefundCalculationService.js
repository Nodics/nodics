/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module payment/service/refund/DefaultPaymentRefundCalculationService
 * @description Calculates safe refundable amounts from Order-provided payment allocation evidence before Payment creates refund transaction evidence.
 * @layer service
 * @owner payment
 * @override Customer modules may replace refund calculation policy for shipping, tax, discount, goodwill, restocking fees, and provider-specific rounding while preserving exact decimal strings and safe evidence.
 */
module.exports = {
    /** Initializes refund calculation. */
    init: function () { return Promise.resolve(true); },
    /** Completes refund calculation startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered payment policy. */
    config: function () { return ((CONFIG.get('payment') || {}).paymentPolicy) || {}; },
    /** Returns layered refund calculation policy. */
    policy: function () { return this.config().refundCalculation || {}; },
    /** Creates a stable calculation error. */
    error: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, 'ERR_PAY_00005');
        let error = new Error(message);
        error.code = 'ERR_PAY_00005';
        return error;
    },
    /** Rejects unsafe calculation payloads. */
    assertSafe: function (value) {
        if (JSON.stringify(value || {}).match(/cvv|cardNumber|pan|secret|password|rawGateway|gatewayPayload|providerPayload/i)) {
            throw this.error('Payment refund calculation must not contain raw credentials, raw provider payloads, or card data');
        }
    },
    /** Validates exact money through Payment policy. */
    validateMoney: function (value) {
        if (SERVICE.DefaultPaymentPolicyService && typeof SERVICE.DefaultPaymentPolicyService.validateMoney === 'function') {
            return SERVICE.DefaultPaymentPolicyService.validateMoney(value);
        }
        return typeof value === 'string' && /^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(value);
    },
    /** Resolves the maximum scale used for safe string arithmetic. */
    scale: function () {
        return Number(this.config().maximumScale || 18);
    },
    /** Converts an exact decimal string into scaled integer units. */
    toScaled: function (value) {
        if (!this.validateMoney(value)) throw this.error('Refund amount must be an exact non-negative decimal string');
        let scale = this.scale();
        let parts = String(value).split('.');
        let fraction = (parts[1] || '').padEnd(scale, '0').slice(0, scale);
        return BigInt(parts[0] + fraction);
    },
    /** Converts scaled integer units back to a canonical decimal string. */
    fromScaled: function (value) {
        let scale = this.scale();
        let negative = value < 0n;
        let absolute = negative ? -value : value;
        let padded = absolute.toString().padStart(scale + 1, '0');
        let head = padded.slice(0, -scale) || '0';
        let tail = padded.slice(-scale).replace(/0+$/, '');
        return (negative ? '-' : '') + head + (tail ? '.' + tail : '');
    },
    /** Extracts generated-service or direct arrays. */
    items: function (value) {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (Array.isArray(value.result)) return value.result;
        if (Array.isArray(value.items)) return value.items;
        return [value];
    },
    /** Filters Order-provided payment allocation evidence to the returned scope. */
    eligibleAllocations: function (request) {
        let policy = this.policy();
        let allocations = this.items(request.paymentAllocations || request.orderPaymentAllocations);
        if (allocations.length > Number(policy.maximumAggregateRecords || this.config().maximumAggregateRecords || 1000)) {
            throw this.error('Refund calculation exceeds configured allocation bounds');
        }
        if (!allocations.length) throw this.error('Refund calculation requires payment allocation evidence');
        let codes = new Set([].concat(request.allocationCodes || []).filter(Boolean));
        let paymentGroupCode = request.paymentGroupCode;
        let filtered = allocations.filter((allocation) => {
            if (paymentGroupCode && allocation.paymentGroupCode !== paymentGroupCode) return false;
            if (!codes.size) return true;
            return codes.has(allocation.allocationCode) || codes.has(allocation.sourceAllocationCode);
        });
        if (!filtered.length) throw this.error('Refund calculation found no eligible payment allocations');
        let currencyCodes = new Set(filtered.map((allocation) => allocation.currencyCode).filter(Boolean));
        if (currencyCodes.size !== 1) throw this.error('Refund calculation requires one currency');
        filtered.forEach((allocation) => {
            if (!this.validateMoney(allocation.amount)) throw this.error('Refund allocation amount must be an exact non-negative decimal string');
        });
        return filtered;
    },
    /** Calculates a safe refundable amount from allocations and optional explicit override. */
    calculate: function (request) {
        if (!request || !request.orderCode || !request.entCode) {
            throw this.error('Refund calculation requires orderCode and entCode');
        }
        this.assertSafe(request);
        let policy = this.policy();
        let allocations = this.eligibleAllocations(request);
        let eligibleScaled = allocations.reduce((sum, allocation) => sum + this.toScaled(allocation.amount), 0n);
        let refundScaled = eligibleScaled;
        if (request.refundAmount || request.amount) {
            if (policy.allowExplicitAmount === false) throw this.error('Explicit refund amount is disabled by policy');
            refundScaled = this.toScaled(request.refundAmount || request.amount);
            if (policy.explicitAmountMustNotExceedEligible !== false && refundScaled > eligibleScaled) {
                throw this.error('Explicit refund amount exceeds eligible payment allocation amount');
            }
        }
        let currencyCode = allocations[0].currencyCode;
        let paymentGroupCodes = Array.from(new Set(allocations.map((allocation) => allocation.paymentGroupCode).filter(Boolean)));
        return {
            calculationCode: request.calculationCode || ['refundCalculation', request.idempotencyKey || request.returnCode || request.orderCode].filter(Boolean).join('::'),
            strategy: policy.defaultStrategy || 'SUM_PAYMENT_ALLOCATIONS',
            orderCode: request.orderCode,
            returnCode: request.returnCode,
            paymentGroupCode: request.paymentGroupCode || paymentGroupCodes[0],
            paymentGroupCodes: paymentGroupCodes,
            amount: this.fromScaled(refundScaled),
            eligibleAmount: this.fromScaled(eligibleScaled),
            currencyCode: currencyCode,
            allocationCodes: allocations.map((allocation) => allocation.allocationCode).filter(Boolean),
            sourceAllocationCodes: allocations.map((allocation) => allocation.sourceAllocationCode).filter(Boolean),
            evidence: {
                includeShipping: policy.includeShipping === true,
                includeTax: policy.includeTax !== false,
                includeDiscount: policy.includeDiscount !== false,
                explicitAmountApplied: Boolean(request.refundAmount || request.amount),
                allocationCount: allocations.length,
            },
        };
    },
};
