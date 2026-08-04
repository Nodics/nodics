/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module fulfillment/service/return/DefaultFulfillmentReturnEventService @description Publishes normalized Return logistics events after durable Fulfillment evidence. @layer service @owner fulfillment */
module.exports={init:function(){return Promise.resolve(true);},postInit:function(){return Promise.resolve(true);},publish:async function(request,model,eventType){if(!SERVICE.DefaultEventService||typeof SERVICE.DefaultEventService.handleEvent!=='function')return{published:false};let event={tenant:request.tenant,active:true,event:'fulfillmentReturn.'+String(eventType).toLowerCase(),sourceName:'fulfillment',sourceId:model.returnCode,target:'fulfillmentReturn',state:'NEW',type:'ASYNC',data:{eventCode:[model.returnCode,eventType].join('::'),returnCode:model.returnCode,orderLifecycleRequestCode:model.orderLifecycleRequestCode,orderCode:model.orderCode,enterpriseCode:model.entCode||model.enterpriseCode,consignmentCode:model.consignmentCode,shipmentCode:model.shipmentCode,status:model.status,dispositionCode:model.dispositionCode,refundPolicyCode:model.refundPolicyCode,requestedQuantity:model.requestedQuantity,receivedQuantity:model.receivedQuantity,inventoryDispositionStatus:model.inventoryDispositionEvidence&&model.inventoryDispositionEvidence.status,correlationId:model.orderLifecycleRequestCode||model.returnCode,occurredAt:new Date()}};await SERVICE.DefaultEventService.handleEvent({tenant:request.tenant,event:event});return{published:true,eventCode:event.data.eventCode};}};
