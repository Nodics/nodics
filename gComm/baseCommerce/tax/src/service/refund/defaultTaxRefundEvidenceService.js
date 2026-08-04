/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module tax/service/refund/DefaultTaxRefundEvidenceService @description Calculates exact proportional Refund tax evidence from immutable original Tax totals. @layer service @owner tax */
module.exports = {
    /**
     * Executes the init operation within the tax-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
    /**
     * Executes the config operation within the tax-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    config: function () { return ((CONFIG.get('tax') || {}).refundEvidence) || {}; }, error: function (message) { let error = new Error(message); error.code = 'ERR_TAX_00008'; return error; },
    /**
     * Executes the ratio operation within the tax-owned layered contract.
     *
     * @param {*} requested Value defined by the surrounding Nodics operation contract.
     * @param {*} ordered Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    ratio: function (requested, ordered) { let exact = SERVICE.DefaultExactUnitsService; if (!exact) throw this.error('Tax Refund evidence requires Units exact arithmetic'); let a = exact.parse(requested), b = exact.parse(ordered), scale = Math.max(a.scale, b.scale), numerator = a.unscaled * 10n ** BigInt(scale - a.scale), denominator = b.unscaled * 10n ** BigInt(scale - b.scale); if (numerator <= 0n || denominator <= 0n || numerator > denominator) throw this.error('Tax Refund quantity ratio is invalid'); return { numerator: numerator.toString(), denominator: denominator.toString() }; },
    /**
     * Executes the calculate operation within the tax-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    calculate: function (request) { let input = request.taxRefundEvidence || request.body || {}, items = [].concat(input.items || []); if (!request.tenant || !request.authData || !input.entCode || !input.orderCode || !input.currencyCode || !items.length) throw this.error('Tax Refund evidence requires scoped immutable Order items'); let exact = SERVICE.DefaultExactUnitsService, scale = Number(this.config().currencyScale || 2), total = scale ? '0.' + ''.padEnd(scale, '0') : '0'; let evidence = items.map(item => { if (item.currencyCode !== input.currencyCode || typeof item.taxTotal !== 'string' || !item.taxQuoteCode || !item.taxQuoteLineCode || !['TAX_INCLUSIVE', 'TAX_EXCLUSIVE'].includes(item.taxInclusionMode)) throw this.error('Original Tax evidence is incomplete or currency mismatched'); let ratio = this.ratio(item.requestedQuantity, item.orderedQuantity), amount = exact.multiplyRational(item.taxTotal, ratio.numerator, ratio.denominator, scale, this.config().roundingMode || 'HALF_EVEN'); total = exact.add(total, amount, scale, 'UNNECESSARY'); return { orderEntryCode: item.orderEntryCode, requestedQuantity: item.requestedQuantity, orderedQuantity: item.orderedQuantity, taxRefundAmount: amount, taxInclusionMode: item.taxInclusionMode, taxIncluded: item.taxIncluded === true, taxQuoteCode: item.taxQuoteCode, taxQuoteLineCode: item.taxQuoteLineCode, taxJurisdictionCode: item.taxJurisdictionCode }; }); return { authority: 'tax', currencyCode: input.currencyCode, taxRefundAmount: total, items: evidence, policyCode: this.config().policyCode || 'ORIGINAL_TAX_PROPORTIONAL', roundingMode: this.config().roundingMode || 'HALF_EVEN' }; },
};
