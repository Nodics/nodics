/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module fulfillment/service/return/DefaultFulfillmentShippingRefundPolicyService @description Applies configured NONE, PROPORTIONAL, FULL, or FIXED shipping Refund policy to immutable delivery-charge evidence. @layer service @owner fulfillment */
module.exports = {
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, config: function () { return (((CONFIG.get('fulfillment') || {}).fulfillmentPolicy || {}).shippingRefund) || {}; }, error: function (message) { let error = new Error(message); error.code = 'ERR_FUL_00010'; return error; },
    exact: function () { if (!SERVICE.DefaultExactUnitsService) throw this.error('Shipping Refund policy requires Units exact arithmetic'); return SERVICE.DefaultExactUnitsService; },
    ratio: function (selected, total) { let exact = this.exact(), a = exact.parse(selected), b = exact.parse(total), scale = Math.max(a.scale,b.scale), numerator = a.unscaled*10n**BigInt(scale-a.scale), denominator=b.unscaled*10n**BigInt(scale-b.scale); if(numerator<=0n||denominator<=0n||numerator>denominator) throw this.error('Shipping Refund quantity ratio is invalid'); return {numerator:numerator.toString(),denominator:denominator.toString()}; },
    compare: function (left,right) { let exact=this.exact(),a=exact.parse(left),b=exact.parse(right),scale=Math.max(a.scale,b.scale); return a.unscaled*10n**BigInt(scale-a.scale)-b.unscaled*10n**BigInt(scale-b.scale); },
    calculate: function (request) { let input=request.shippingRefundEvidence||request.body||{}, config=this.config(), mode=input.policyMode||config.defaultMode||'NONE', allowed=config.allowedModes||['NONE','PROPORTIONAL','FULL','FIXED'], scale=Number(config.currencyScale||2), zero=scale?'0.'+''.padEnd(scale,'0'):'0'; if(!request.tenant||!request.authData||!input.currencyCode||!allowed.includes(mode)) throw this.error('Shipping Refund policy input is invalid'); if(mode==='NONE') return {authority:'fulfillment',policyMode:mode,shippingRefundAmount:zero,currencyCode:input.currencyCode,deliveryChargeEvidenceCode:input.deliveryChargeEvidenceCode}; if(typeof input.originalShippingAmount!=='string'||!input.deliveryChargeEvidenceCode||!input.paymentAllocationCode||input.shippingAmountIncludedInAllocation!==false) throw this.error('Shipping Refund requires immutable delivery-charge and separate original Payment allocation evidence'); let amount; if(mode==='FULL') amount=this.exact().multiplyRational(input.originalShippingAmount,'1','1',scale,'UNNECESSARY'); else if(mode==='PROPORTIONAL'){let ratio=this.ratio(input.selectedQuantity,input.totalQuantity);amount=this.exact().multiplyRational(input.originalShippingAmount,ratio.numerator,ratio.denominator,scale,config.roundingMode||'HALF_EVEN');} else {if(typeof input.fixedAmount!=='string'||this.compare(input.fixedAmount,input.originalShippingAmount)>0n) throw this.error('Fixed shipping Refund exceeds original delivery charge');amount=this.exact().multiplyRational(input.fixedAmount,'1','1',scale,'UNNECESSARY');} return {authority:'fulfillment',policyMode:mode,shippingRefundAmount:amount,currencyCode:input.currencyCode,originalShippingAmount:input.originalShippingAmount,deliveryChargeEvidenceCode:input.deliveryChargeEvidenceCode,paymentAllocationCode:input.paymentAllocationCode,shippingAmountIncludedInAllocation:false,roundingMode:config.roundingMode||'HALF_EVEN'}; },
};
