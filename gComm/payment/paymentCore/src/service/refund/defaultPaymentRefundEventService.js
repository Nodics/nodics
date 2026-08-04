/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module payment/service/refund/DefaultPaymentRefundEventService @description Publishes normalized Payment Refund, retry, reconciliation, and adjustment events after durable transaction evidence. @layer service @owner payment */
module.exports={init:function(){return Promise.resolve(true);},postInit:function(){return Promise.resolve(true);},publish:async function(request,model,eventType){if(!SERVICE.DefaultEventService||typeof SERVICE.DefaultEventService.handleEvent!=='function')return{published:false};let event={tenant:request.tenant,active:true,event:'paymentRefund.'+String(eventType).toLowerCase(),sourceName:'payment',sourceId:model.transactionCode,target:'paymentTransaction',state:'NEW',type:'ASYNC',data:{eventCode:[model.transactionCode,eventType].join('::'),transactionCode:model.transactionCode,parentTransactionCode:model.parentTransactionCode,refundCode:model.refundCode,orderCode:model.orderCode,enterpriseCode:model.enterpriseCode,providerCode:model.providerCode,providerTransactionRef:model.providerTransactionRef,paymentModeCode:model.paymentModeCode,status:model.status,recoveryAction:model.recoveryAction,recoveryStatus:model.recoveryStatus,correlationId:model.refundCode||model.transactionCode,occurredAt:new Date()}};await SERVICE.DefaultEventService.handleEvent({tenant:request.tenant,event:event});return{published:true,eventCode:event.data.eventCode};}};
