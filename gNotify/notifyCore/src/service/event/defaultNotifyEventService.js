/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module notifyCore/service/event/DefaultNotifyEventService @description Publishes provider-neutral notification outcomes without protected content. @layer service @owner notifyCore */
module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, publish: async function (request, delivery, result) { let event = { eventType: 'NOTIFICATION_' + String(result.status || 'UNKNOWN'), requestCode: delivery.requestCode, scenarioCode: delivery.scenarioCode, channelCode: delivery.channelCode, ownerModule: delivery.ownerModule, ownerReferenceType: delivery.ownerReferenceType, ownerReferenceCode: delivery.ownerReferenceCode, correlationId: delivery.correlationId, status: result.status, resultCode: result.resultCode, failureCode: result.failureCode, occurredAt: new Date() }; if (SERVICE.DefaultEventService && typeof SERVICE.DefaultEventService.publish === 'function') await SERVICE.DefaultEventService.publish(Object.assign({}, request, { event })); if (delivery.ownerModule === 'order' && SERVICE.DefaultOrderLifecycleNotificationResultService && typeof SERVICE.DefaultOrderLifecycleNotificationResultService.record === 'function') await SERVICE.DefaultOrderLifecycleNotificationResultService.record(Object.assign({}, request, { body: event })); return event; } };
