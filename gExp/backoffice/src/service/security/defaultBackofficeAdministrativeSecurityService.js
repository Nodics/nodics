/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/service/security/DefaultBackofficeAdministrativeSecurityService
 * @description Enforces human/service separation, tenant consistency, refresh throttling, idempotency, and audit correlation for BackOffice administration.
 * @layer service
 * @owner backoffice
 * @override Projects may replace policy while preserving fail-closed identity, tenant, bounded-abuse, and redaction contracts.
 */
module.exports = {
    _counters: new Map(),
    _inflight: new Map(),
    _results: new Map(),
    _metrics: { rejected: 0, throttled: 0, idempotentInflightReuses: 0, idempotentResultReuses: 0 },
    /** Initializes administrative security state. */
    init: function () { return Promise.resolve(true); },
    /** Completes administrative security initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered administrative security policy. */
    getConfiguration: function () { return (CONFIG.get('backofficeRegistry') || {}).administration || {}; },
    /** Resolves the authenticated human principal. */
    getPrincipal: function (request) {
        let auth = request && request.authData || {};
        return String(auth.principalId || auth.loginId || auth.code || '');
    },
    /** Returns bounded correlation fields already present in the trusted request context. */
    getAuditContext: function (request) {
        let auth = request && request.authData || {};
        return { principalId: this.getPrincipal(request), tokenType: auth.tokenType, tenant: request && request.tenant || auth.tenant,
            traceId: request && request.traceId, correlationId: request && request.correlationId, requestId: request && request.requestId };
    },
    /** Records one fail-open sanitized administrative security outcome. */
    audit: function (request, outcome, reasonCode, operation) {
        let service = SERVICE.DefaultBackofficeAuditService;
        if (!service || typeof service.record !== 'function') return false;
        Promise.resolve(service.record(Object.assign({ eventType: 'backoffice.administration.security', outcome: outcome,
            reasonCode: reasonCode, operation: operation }, this.getAuditContext(request)))).catch(() => false);
        return true;
    },
    /** Rejects service identities, missing principals, and cross-tenant administrative requests. */
    validate: function (request) {
        let policy = this.getConfiguration();
        let auth = request && request.authData || {};
        let principal = this.getPrincipal(request);
        if (policy.rejectServiceTokens !== false && auth.tokenType === 'service') {
            this._metrics.rejected++;
            this.audit(request, 'rejected', 'SERVICE_IDENTITY_FORBIDDEN', 'authorize');
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Service identities cannot perform BackOffice administration');
        }
        if (policy.requirePrincipal !== false && !principal) {
            this._metrics.rejected++;
            this.audit(request, 'rejected', 'PRINCIPAL_REQUIRED', 'authorize');
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Administrative principal is required');
        }
        if (request && request.tenant && auth.tenant && request.tenant !== auth.tenant) {
            this._metrics.rejected++;
            this.audit(request, 'rejected', 'TENANT_MISMATCH', 'authorize');
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Cross-tenant BackOffice administration is not allowed');
        }
        return this.getAuditContext(request);
    },
    /** Resolves a caller-supplied idempotency key without retaining authorization headers. */
    getIdempotencyKey: function (request) {
        let headers = request && (request.headers || request.httpRequest && request.httpRequest.headers) || {};
        return String(headers['idempotency-key'] || headers['Idempotency-Key'] || '').slice(0, 256);
    },
    /** Removes expired bounded counters and completed idempotency results. */
    cleanup: function () {
        let now = Date.now();
        this._counters.forEach((value, key) => { if (value.resetAt <= now) this._counters.delete(key); });
        this._results.forEach((value, key) => { if (value.expiresAt <= now) this._results.delete(key); });
    },
    /** Executes one refresh under per-principal/module throttling and idempotent in-flight/result reuse. */
    executeRefresh: function (request, moduleName, executor) {
        let context = this.validate(request);
        this.cleanup();
        let policy = this.getConfiguration();
        let scope = [context.tenant || 'default', context.principalId, moduleName].join(':');
        let suppliedKey = this.getIdempotencyKey(request);
        let idempotencyKey = suppliedKey ? scope + ':' + suppliedKey : '';
        if (idempotencyKey && this._results.has(idempotencyKey)) {
            this._metrics.idempotentResultReuses++;
            return Promise.resolve(this._results.get(idempotencyKey).result);
        }
        if (idempotencyKey && this._inflight.has(idempotencyKey)) {
            this._metrics.idempotentInflightReuses++;
            return this._inflight.get(idempotencyKey);
        }
        let now = Date.now();
        let counter = this._counters.get(scope);
        if (!counter || counter.resetAt <= now) counter = { count: 0, resetAt: now + Number(policy.refreshWindowMs || 60000) };
        counter.count++;
        this._counters.set(scope, counter);
        if (counter.count > Number(policy.refreshMaxPerWindow || 5)) {
            this._metrics.throttled++;
            this.audit(request, 'throttled', 'REFRESH_RATE_LIMITED', 'refresh');
            throw new CLASSES.NodicsError('ERR_RTR_00004', 'BackOffice refresh rate limit exceeded');
        }
        let promise = Promise.resolve().then(executor).then(result => {
            if (idempotencyKey) {
                this._results.set(idempotencyKey, { result: result, expiresAt: Date.now() + Number(policy.idempotencyTtlMs || 60000) });
                let max = Number(policy.maxIdempotencyEntries || 1000);
                while (this._results.size > max) this._results.delete(this._results.keys().next().value);
            }
            return result;
        }).finally(() => { if (idempotencyKey) this._inflight.delete(idempotencyKey); });
        if (idempotencyKey) this._inflight.set(idempotencyKey, promise);
        return promise;
    },
    /** Returns sanitized administrative protection counters. */
    getDiagnostics: function () {
        return Object.assign({}, this._metrics, { activeCounters: this._counters.size, inflight: this._inflight.size,
            cachedIdempotencyResults: this._results.size });
    }
};
