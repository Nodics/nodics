/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module promotion/service/refund/DefaultPromotionRefundImpactService @description Calculates exact proportional original-discount Refund impact without re-evaluating promotions in Order. @layer service @owner promotion */
module.exports = {
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, config: function () { return ((CONFIG.get('promotion') || {}).refundImpact) || {}; }, error: function (message) { let error = new Error(message); error.code = 'ERR_PROMO_00008'; return error; },
    ratio: function (requested, ordered) { let exact = SERVICE.DefaultExactUnitsService; if (!exact) throw this.error('Promotion Refund impact requires Units exact arithmetic'); let a = exact.parse(requested), b = exact.parse(ordered), scale = Math.max(a.scale, b.scale), numerator = a.unscaled * 10n ** BigInt(scale - a.scale), denominator = b.unscaled * 10n ** BigInt(scale - b.scale); if (numerator <= 0n || denominator <= 0n || numerator > denominator) throw this.error('Promotion Refund quantity ratio is invalid'); return { numerator: numerator.toString(), denominator: denominator.toString() }; },
    calculate: function (request) { let input = request.promotionRefundImpact || request.body || {}, items = [].concat(input.items || []); if (!request.tenant || !request.authData || !input.entCode || !input.orderCode || !input.currencyCode || !items.length) throw this.error('Promotion Refund impact requires scoped immutable Order items'); let exact = SERVICE.DefaultExactUnitsService, scale = Number(this.config().currencyScale || 2), total = scale ? '0.' + ''.padEnd(scale, '0') : '0'; let evidence = items.map(item => { if (item.currencyCode !== input.currencyCode || typeof item.discountTotal !== 'string') throw this.error('Original Promotion discount evidence is incomplete or currency mismatched'); let ratio = this.ratio(item.requestedQuantity, item.orderedQuantity), amount = exact.multiplyRational(item.discountTotal, ratio.numerator, ratio.denominator, scale, this.config().roundingMode || 'HALF_EVEN'); total = exact.add(total, amount, scale, 'UNNECESSARY'); return { orderEntryCode: item.orderEntryCode, requestedQuantity: item.requestedQuantity, orderedQuantity: item.orderedQuantity, discountRefundImpact: amount, priceEvidenceCode: item.priceEvidenceCode }; }); return { authority: 'promotion', currencyCode: input.currencyCode, discountRefundImpact: total, items: evidence, policyCode: this.config().policyCode || 'PRESERVE_ORIGINAL_DISCOUNT_PROPORTIONAL', clawbackApplied: false, roundingMode: this.config().roundingMode || 'HALF_EVEN' }; },
};
