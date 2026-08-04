/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/**
 * @module gComm/checkout/order/src/controller/lifecycle/defaultOrderLifecycleSupportController
 * @description Defines the default order lifecycle support controller contract owned by order within the Nodics layered runtime.
 * @layer controller
 * @owner order
 * @override Later project or customer modules may replace or extend this artifact while preserving its published contract.
 */
module.exports={init:function(){return Promise.resolve(true);},postInit:function(){return Promise.resolve(true);},call:function(name,request,callback){let promise=FACADE.DefaultOrderLifecycleSupportFacade[name](request);return callback?promise.then(value=>callback(null,value)).catch(callback):promise;},recommend:function(request,callback){return this.call('recommend',request,callback);},message:function(request,callback){return this.call('message',request,callback);}};
