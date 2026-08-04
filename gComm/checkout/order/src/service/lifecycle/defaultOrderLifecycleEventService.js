/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/service/lifecycle/DefaultOrderLifecycleEventService @description Publishes normalized lifecycle events for Notification and operational listeners after durable Order history exists. @layer service @owner order */
module.exports = {
    /**
     * Initializes the module artifact within the order-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
    /**
     * Executes the config operation within the order-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    config: function () { return ((((CONFIG.get('order')||{}).orderLifecycle||{}).events)||{}); },
    /**
     * Executes the correlations operation within the order-owned layered contract.
     *
     * @param {*} lifecycle Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    correlations: function (lifecycle) { let allowed=new Set(['transactionCode','refundTransactionCode','returnCode','movementCode','consignmentCode','shipmentCode','workflowCarrierCode','providerTransactionRef']), values={}; let visit=(value,depth)=>{if(!value||depth>6)return;if(Array.isArray(value))return value.slice(0,100).forEach(item=>visit(item,depth+1));if(typeof value!=='object')return;Object.entries(value).forEach(([key,item])=>{if(allowed.has(key)&&typeof item==='string'&&item.length<=256){if(!values[key])values[key]=[];if(!values[key].includes(item))values[key].push(item);}else visit(item,depth+1);});}; visit(lifecycle.evidence||{},0); let limit=Number(this.config().maximumCorrelationReferences||100), count=0,result={}; Object.entries(values).forEach(([key,items])=>{result[key]=items.slice(0,Math.max(0,limit-count));count+=result[key].length;}); return result; },
    /**
     * Publishes the module artifact within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} lifecycle Value defined by the surrounding Nodics operation contract.
     * @param {*} eventType Value defined by the surrounding Nodics operation contract.
     * @param {*} history Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    publish: async function (request, lifecycle, eventType, history) { if (!SERVICE.DefaultEventService || typeof SERVICE.DefaultEventService.handleEvent !== 'function') return { published: false, reason: 'EVENT_SERVICE_UNAVAILABLE' }; let notification=(this.config().notificationByEventType||{})[eventType]; let event = { tenant: request.tenant, active: true, event: 'orderLifecycle.' + String(eventType).toLowerCase(), sourceName: 'order', sourceId: history.historyCode, target: 'order', state: 'NEW', type: 'ASYNC', data: { eventCode: history.historyCode, requestCode: lifecycle.requestCode, requestType: lifecycle.requestType, requestVersion: lifecycle.version, orderCode: lifecycle.orderCode, enterpriseCode: lifecycle.entCode, siteCode:lifecycle.siteCode, channelCode:lifecycle.channelCode, customerCode: lifecycle.customerCode, state: lifecycle.state, reasonCode: lifecycle.reasonCode, correlationId: lifecycle.workflowCarrierCode || lifecycle.requestCode, correlations:this.correlations(lifecycle), notificationIntent:notification?{templateCode:notification.templateCode,audiences:notification.audiences}:undefined, occurredAt: new Date() } }; await SERVICE.DefaultEventService.handleEvent({ tenant: request.tenant, event: event }); return { published: true, eventCode: history.historyCode }; },
    /**
     * Publishes support message within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} lifecycle Value defined by the surrounding Nodics operation contract.
     * @param {*} history Value defined by the surrounding Nodics operation contract.
     * @param {*} input Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    publishSupportMessage: async function(request,lifecycle,history,input){let config=this.config(),templates=config.supportMessageTemplates||[],variables=input.templateVariables||{};if(!templates.includes(input.templateCode)||Object.keys(variables).length>Number(config.maximumTemplateVariables||20)||Object.values(variables).some(value=>!['string','number','boolean'].includes(typeof value)||String(value).length>500))throw new Error('Support lifecycle message template evidence is invalid');if(!SERVICE.DefaultEventService||typeof SERVICE.DefaultEventService.handleEvent!=='function')return{published:false,reason:'EVENT_SERVICE_UNAVAILABLE'};let event={tenant:request.tenant,active:true,event:'orderLifecycle.support_message_requested',sourceName:'order',sourceId:history.historyCode,target:'notification',state:'NEW',type:'ASYNC',data:{eventCode:history.historyCode,requestCode:lifecycle.requestCode,requestType:lifecycle.requestType,requestVersion:lifecycle.version,orderCode:lifecycle.orderCode,enterpriseCode:lifecycle.entCode,customerCode:lifecycle.customerCode,correlationId:lifecycle.workflowCarrierCode||lifecycle.requestCode,notificationIntent:{templateCode:input.templateCode,audiences:['CUSTOMER'],templateVariables:variables},occurredAt:new Date()}};await SERVICE.DefaultEventService.handleEvent({tenant:request.tenant,event:event});return{published:true,eventCode:history.historyCode};},
};
