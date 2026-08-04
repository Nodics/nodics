/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module notifyCore/service/inapp/DefaultNotifyInAppService @description Owns scoped in-app inbox projection and optimistic read/action acknowledgement. @layer service @owner notifyCore */
module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, principal: request => request.authData && (request.authData.principalId || request.authData.code), inbox: function (request) { return SERVICE.DefaultNotifyInAppNotificationService.get({ tenant: request.tenant, authData: request.authData, query: { recipientPrincipalId: this.principal(request), status: { $in: ['UNREAD', 'READ'] }, expiresAt: { $gt: new Date() } }, searchOptions: { limit: Math.min(Number(request.query && request.query.limit || 50), 100), sort: { createdAt: -1 } } }); }, acknowledge: function (request, input) { input = input || request.body || {}; let allowed = ['READ', 'DISMISSED', 'ACTIONED']; if (!allowed.includes(input.status)) return Promise.reject(Object.assign(new Error('In-app acknowledgement status invalid'), { code: 'ERR_NOTIFY_00013' })); return SERVICE.DefaultNotifyInAppNotificationService.update({ tenant: request.tenant, authData: request.authData, query: { notificationCode: input.notificationCode, recipientPrincipalId: this.principal(request), version: input.expectedVersion }, model: { status: input.status, actionCode: input.actionCode, acknowledgedAt: new Date(), version: Number(input.expectedVersion) + 1 } }); } };
