/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module notifyCore/service/pipeline/DefaultNotifyRetryPipelineService @description Enforces bounded retry and requires business-owned context rehydration. @layer service @owner notifyCore */
module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, items: value => value && Array.isArray(value.result) ? value.result : [], loadRetry: async function (request) { let code = (request.notifyRetry || request.body || {}).requestCode, rows = this.items(await SERVICE.DefaultNotifyDeliveryRequestService.get({ tenant: request.tenant, authData: request.authData, query: { requestCode: code }, searchOptions: { limit: 1 } })); request.retryDelivery = rows[0]; if (!request.retryDelivery) throw Object.assign(new Error('Notification delivery not found'), { code: 'ERR_NOTIFY_00010' }); return { success: request }; }, assertRetry: function (request) { let delivery = request.retryDelivery, config = (CONFIG.get('notify') || {}).resilience; if (delivery.status !== 'RETRY_SCHEDULED' || Number(delivery.retryCount || 0) >= Number(config.maximumAttempts || 3)) throw Object.assign(new Error('Notification retry is not permitted'), { code: 'ERR_NOTIFY_00010' }); return Promise.resolve({ success: request }); }, executeRetry: async function (request) { let delivery = request.retryDelivery; if (!SERVICE.DefaultNotifyContextRehydrationProviderService) throw Object.assign(new Error('Business context rehydration provider unavailable'), { code: 'ERR_NOTIFY_00010' }); let variables = await SERVICE.DefaultNotifyContextRehydrationProviderService.resolve(request, delivery); request.retryResult = await SERVICE.DefaultNotifyDeliveryService.send(request, Object.assign({}, delivery, { variables, idempotencyKey: delivery.idempotencyKey + ':retry:' + (Number(delivery.retryCount || 0) + 1) })); return { success: request }; }, handleSuccessEnd: function (request) { return Promise.resolve(request.retryResult); }, handleErrorEnd: function (request) { return Promise.reject(request.error || new Error('Notification retry failed')); } };
