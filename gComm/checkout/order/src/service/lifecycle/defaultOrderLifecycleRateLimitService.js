/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module order/service/lifecycle/DefaultOrderLifecycleRateLimitService @description Enforces configured customer lifecycle request limits from shared Order persistence while allowing idempotent replay. @layer service @owner order */
module.exports = {
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
    config: function () { return (((CONFIG.get('order') || {}).orderLifecycle || {}).intents || {}).rateLimit || {}; },
    error: function (message) { let error = new Error(message); error.code = 'ERR_ORD_00067'; return error; },
    items: function (value) { if (!value) return []; if (Array.isArray(value)) return value; if (Array.isArray(value.result)) return value.result; return [value]; },
    assertAllowed: async function (request, input) {
        let policy = this.config(); if (policy.enabled === false) return { allowed: true, enabled: false };
        if (!request || !request.tenant || !request.authData || !input || !input.entCode || !input.orderCode || !input.idempotencyKey) throw this.error('Lifecycle rate limit requires trusted request and idempotency context');
        let principal = request.authData.customerCode || request.authData.principalId || request.authData.userCode;
        if (!principal || !SERVICE.DefaultOrderLifecycleRequestService || typeof SERVICE.DefaultOrderLifecycleRequestService.get !== 'function') throw this.error('Lifecycle rate limit persistence authority is unavailable');
        let existing = this.items(await SERVICE.DefaultOrderLifecycleRequestService.get({ tenant: request.tenant, authData: request.authData, query: { entCode: input.entCode, idempotencyKey: input.idempotencyKey }, searchOptions: { limit: 2 } }));
        if (existing.length > 1) throw this.error('Lifecycle rate limit idempotency evidence is ambiguous');
        if (existing.length === 1) return { allowed: true, idempotent: true };
        let maximum = Number(policy.max || 10), windowMs = Number(policy.windowMs || 60000), since = new Date((request.now ? new Date(request.now) : new Date()).getTime() - windowMs);
        if (!Number.isInteger(maximum) || maximum < 1 || !Number.isFinite(windowMs) || windowMs < 1000) throw this.error('Lifecycle rate limit policy is invalid');
        let recent = this.items(await SERVICE.DefaultOrderLifecycleRequestService.get({ tenant: request.tenant, authData: request.authData, query: { entCode: input.entCode, orderCode: input.orderCode, requesterCode: principal, requesterType: 'CUSTOMER', submittedAt: { $gte: since } }, searchOptions: { limit: maximum + 1, sort: { submittedAt: -1 } } }));
        if (recent.length >= maximum) throw this.error('Customer lifecycle request rate limit exceeded');
        return { allowed: true, remaining: maximum - recent.length - 1, windowMs: windowMs };
    },
};
