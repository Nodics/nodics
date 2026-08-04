/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
const assert=require('assert'), fulfillment=require('../config/properties').fulfillment, units=require('../../../../gCore/units/config/properties').units; global.CONFIG={get:key=>key==='fulfillment'?fulfillment:key==='units'?units:undefined}; global.CLASSES={NodicsError:class extends Error{constructor(code,message){super(message);this.code=code;}}}; global.SERVICE={DefaultExactUnitsService:require('../../../../gCore/units/src/service/exact/defaultExactUnitsService')}; const service=require('../src/service/return/defaultFulfillmentShippingRefundPolicyService'), base={tenant:'default',authData:{tokenType:'service'}}, evidence={currencyCode:'USD',originalShippingAmount:'12.00',deliveryChargeEvidenceCode:'delivery-charge-1',paymentAllocationCode:'shipping-payment-1',shippingAmountIncludedInAllocation:false,selectedQuantity:'1',totalQuantity:'3'};
assert.strictEqual(service.calculate(Object.assign({},base,{shippingRefundEvidence:{currencyCode:'USD',policyMode:'NONE'}})).shippingRefundAmount,'0.00'); assert.strictEqual(service.calculate(Object.assign({},base,{shippingRefundEvidence:Object.assign({},evidence,{policyMode:'PROPORTIONAL'})})).shippingRefundAmount,'4.00'); assert.strictEqual(service.calculate(Object.assign({},base,{shippingRefundEvidence:Object.assign({},evidence,{policyMode:'FULL'})})).shippingRefundAmount,'12.00'); assert.strictEqual(service.calculate(Object.assign({},base,{shippingRefundEvidence:Object.assign({},evidence,{policyMode:'FIXED',fixedAmount:'5.00'})})).shippingRefundAmount,'5.00'); assert.throws(()=>service.calculate(Object.assign({},base,{shippingRefundEvidence:Object.assign({},evidence,{policyMode:'FIXED',fixedAmount:'13.00'})})),/exceeds original/); console.log('Fulfillment shipping Refund policy contract validated');
