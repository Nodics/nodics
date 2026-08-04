/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module order/service/lifecycle/DefaultOrderLifecycleNotificationResultService @description Records normalized Notification-owned delivery results against Order lifecycle audit without accepting provider payloads. @layer service @owner order */
module.exports = {
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, error: function (message) { let error = new Error(message); error.code = 'ERR_ORD_00070'; return error; },
    record: async function (request) { let auth = request.authData || {}, input = request.notificationResult || request.body || {}; if (!request.tenant || auth.tokenType !== 'service') throw this.error('Notification result requires service identity'); if (!input.enterpriseCode || !input.requestCode || !input.notificationCode || !input.deliveryCode || !['DELIVERED', 'FAILED', 'BOUNCED', 'SUPPRESSED'].includes(input.status)) throw this.error('Notification result identity and normalized status are required'); if (input.providerPayload || input.rawPayload || input.recipient || input.address || input.secret) throw this.error('Notification result contains prohibited delivery data'); let model = await SERVICE.DefaultOrderLifecycleOrchestrationService.loadRequest(request, { entCode: input.enterpriseCode, requestCode: input.requestCode }); if (!model) throw this.error('Lifecycle request is unavailable'); let evidenceCode = 'notification:' + input.deliveryCode, history = await SERVICE.DefaultOrderLifecycleAuditService.record(request, model, 'NOTIFICATION_DELIVERY_' + input.status, evidenceCode, 'Notification delivery result: ' + String(input.reasonCode || input.status).slice(0, 100)); return { requestCode: model.requestCode, notificationCode: input.notificationCode, deliveryCode: input.deliveryCode, status: input.status, historyCode: history.historyCode, correlationId: model.workflowCarrierCode || model.requestCode, providerCallCode: input.providerCallCode, idempotent: history.idempotent === true }; },
};
