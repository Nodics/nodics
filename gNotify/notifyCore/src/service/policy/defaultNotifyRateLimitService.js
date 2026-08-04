/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module notifyCore/service/policy/DefaultNotifyRateLimitService @description Applies persistence-backed principal-recipient-scenario windows while allowing exact idempotent replay. @layer service @owner notifyCore */
module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, assertAllowed: async function (request, input, scope, effectivePolicy) { let config = Object.assign({}, (CONFIG.get('notify') || {}).abuse || {}, effectivePolicy || {}), service = SERVICE.DefaultNotifyDeliveryRequestService; if (!service) throw Object.assign(new Error('Notification rate-limit authority unavailable'), { code: 'ERR_NOTIFY_00003' }); let existing = await service.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: scope.enterpriseCode, idempotencyKey: input.idempotencyKey }, searchOptions: { limit: 1 } }); if (existing && existing.result && existing.result.length) return { allowed: true, idempotent: true, request: existing.result[0] }; let maximum = Number(config.maximumPerWindow || config.maximumRequestsPerPrincipalRecipientScenario || 5), since = new Date(Date.now() - Number(config.windowMs || 60000)), result = await service.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: scope.enterpriseCode, requesterPrincipalId: scope.principalId, recipientReference: input.recipientReference, scenarioCode: input.scenarioCode, requestedAt: { $gte: since } }, searchOptions: { limit: maximum + 1 } }); if ((result && result.result || []).length >= maximum) throw Object.assign(new Error('Notification request rate limit exceeded'), { code: 'ERR_NOTIFY_00003' }); return { allowed: true, idempotent: false }; } };
