/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module notifyCore/service/delivery/DefaultNotifyDeliveryService @description Stable provider-neutral entry point for business-owned notification intents. @layer service @owner notifyCore */
module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, send: function (request, intent) { if (!SERVICE.DefaultPipelineService) return Promise.reject(Object.assign(new Error('Notification pipeline runtime unavailable'), { code: 'ERR_NOTIFY_00009' })); return SERVICE.DefaultPipelineService.start('notifyMessageDeliveryPipeline', Object.assign({}, request, { notifyDelivery: intent || request.body || request.model }), {}); } };
