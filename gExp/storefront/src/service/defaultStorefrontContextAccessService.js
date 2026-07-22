/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
const crypto = require('crypto');

/**
 * @module storefront/service/DefaultStorefrontContextAccessService
 * @description Issues opaque short-lived Storefront context handles and performs service-authenticated, audience-bound introspection through nCache.
 * @layer service
 * @owner storefront
 * @override Projects may replace storage or risk policy while preserving opacity, bounded lifetime, target binding, tenant isolation, and fail-closed introspection.
 */
module.exports = {
    lifecycleMetrics: { issued: 0, refreshed: 0, revoked: 0, bulkRevoked: 0, rejected: 0 },
    _issueAuditSequence: 0,
    /** Initializes Storefront context-access handling. */
    init: function () { return Promise.resolve(true); },
    /** Completes Storefront context-access initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the effective governed context-access policy. */
    policy: function () { return (CONFIG.get('storefront') || {}).contextAccess || {}; },
    /** Creates a stable cache key without retaining the bearer handle in storage diagnostics. */
    key: function (handle) {
        return String(this.policy().keyPrefix || 'storefrontContextAccess:') + crypto.createHash('sha256').update(handle).digest('hex');
    },
    /** Returns provider-neutral cache options for ephemeral access state. */
    options: function (handle) {
        let policy = this.policy(), tenant = ((CONFIG.get('storefront') || {}).contextResolution || {}).defaultTenant || 'default';
        return { tenant: tenant, authData: { tokenType: 'service', principalId: 'storefront-context-access', tenant: tenant },
            moduleName: policy.moduleName || 'storefront', channelName: policy.channelName || 'contextAccess',
            cacheLayer: 'contextAccess', resourceName: 'storefrontContextAccess', key: this.key(handle) };
    },
    /** Builds a non-reversible generation key for one tenant, enterprise, and Storefront scope. */
    generationKey: function (scope) {
        let policy = this.policy(), identity = [scope.tenantCode, scope.enterpriseCode, scope.storefrontCode].join('|');
        return String(policy.generationKeyPrefix || 'storefrontContextGeneration:') + crypto.createHash('sha256').update(identity).digest('hex');
    },
    /** Returns cache options for the Storefront-wide revocation generation. */
    generationOptions: function (scope) {
        let options = this.options('generation');
        options.tenant = scope.tenantCode;
        options.authData.tenant = scope.tenantCode;
        options.resourceName = 'storefrontContextGeneration';
        options.key = this.generationKey(scope);
        return options;
    },
    /** Reads the current revocation generation, distinguishing a cache miss from provider failure. */
    generation: async function (scope) {
        try { return await SERVICE.DefaultCacheService.get(this.generationOptions(scope)); } catch (error) {
            if (error && error.code === 'ERR_CACHE_00001') return String(this.policy().initialGeneration || '1');
            throw error;
        }
    },
    /** Reads an optional client-generated binding value from the governed header. */
    binding: function (request) {
        let binding = this.policy().binding || {};
        if (binding.enabled !== true) return undefined;
        let name = String(binding.headerName || 'x-nodics-storefront-binding').toLowerCase();
        let http = request && request.httpRequest, headers = http && http.headers || request && request.headers || {};
        let value = http && typeof http.get === 'function' ? http.get(name) : headers[name];
        if (value === undefined && request && request.body) value = request.body.binding;
        if (typeof value !== 'string' || value.length < Number(binding.minimumLength || 32) || value.length > Number(binding.maximumLength || 256))
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error('ERR_STOREFRONT_00017', 'Valid Storefront context binding is required');
        return crypto.createHash('sha256').update(value).digest('hex');
    },
    /** Uses a timing-safe comparison for optional binding proof. */
    bindingMatches: function (stored, supplied) {
        if (!stored) return true;
        if (typeof supplied !== 'string') return false;
        let actual = crypto.createHash('sha256').update(supplied).digest('hex');
        return actual.length === stored.length && crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(stored));
    },
    /** Sends a bounded lifecycle outcome to the replaceable audit authority without delaying security behavior. */
    audit: function (request, event) {
        let service = SERVICE.DefaultStorefrontContextAuditService;
        if (!service || typeof service.record !== 'function') return false;
        if (event && event.eventType === 'storefront.context.issued' && event.outcome === 'success') {
            let rate = Number((this.policy().audit || {}).issueSuccessSampleRate);
            if (!Number.isFinite(rate)) rate = 1;
            rate = Math.max(0, Math.min(1, rate));
            this._issueAuditSequence += 1;
            if (rate === 0 || rate < 1 && this._issueAuditSequence % Math.max(1, Math.round(1 / rate)) !== 0) return false;
        }
        let auth = request && request.authData || {}, administrative = auth.tokenType === 'access';
        let context = { requestId: request && request.requestId, traceId: request && request.traceId,
            correlationId: request && request.correlationId };
        if (administrative) Object.assign(context, { actorType: 'human', principalId: auth.principalId || auth.loginId || auth.code, tokenType: auth.tokenType });
        Promise.resolve(service.record(Object.assign(context, event))).catch(() => false);
        return true;
    },
    /** Issues one opaque handle; cache unavailability fails closed because no client authority may be self-asserted. */
    issue: async function (resolved, request) {
        let policy = this.policy(), authority = resolved && resolved._authority, ttl = Number(policy.ttlSeconds || 120);
        if (policy.enabled === false || !SERVICE.DefaultCacheService || !authority || !authority.tenantCode || !authority.enterpriseCode)
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error('ERR_STOREFRONT_00016', 'Storefront context access is unavailable');
        if (!Number.isInteger(ttl) || ttl < 1)
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error('ERR_STOREFRONT_00016', 'Storefront context access lifetime is invalid');
        let scope = { tenantCode: authority.tenantCode, enterpriseCode: authority.enterpriseCode, storefrontCode: resolved.storefrontCode };
        let generation = await this.generation(scope);
        let handle = crypto.randomBytes(Math.max(24, Number(policy.tokenBytes || 32))).toString('base64url'), now = Date.now();
        let value = { active: true, issuedAt: now, expiresAt: now + ttl * 1000, bindingHash: this.binding(request),
            generation: generation,
            tenantCode: authority.tenantCode, enterpriseCode: authority.enterpriseCode,
            storefrontCode: resolved.storefrontCode, audiences: (policy.audiences || []).slice(), context: resolved.downstream };
        await SERVICE.DefaultCacheService.put(Object.assign({}, this.options(handle), { value: value, ttl: ttl }));
        this.lifecycleMetrics.issued += 1;
        this.audit(request, { eventType: 'storefront.context.issued', operation: 'issue', outcome: 'success',
            tenantCode: scope.tenantCode, enterpriseCode: scope.enterpriseCode, storefrontCode: scope.storefrontCode });
        return { handle: handle, header: policy.headerName || 'x-nodics-storefront-context', expiresInSeconds: ttl };
    },
    /** Rotates one active handle exactly once by atomically consuming its predecessor. */
    refresh: async function (request) {
        let input = request && request.body || {}, policy = this.policy(), value;
        if (typeof input.handle !== 'string' || input.handle.length < 32 || input.handle.length > Number(policy.maximumHandleLength || 256))
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error('ERR_STOREFRONT_00018', 'Active Storefront context handle is required');
        try { value = await SERVICE.DefaultCacheService.get(this.options(input.handle)); } catch (error) { value = undefined; }
        if (!value || value.active !== true || Number(value.expiresAt) <= Date.now() || !this.bindingMatches(value.bindingHash, input.binding)) {
            this.lifecycleMetrics.rejected += 1;
            this.audit(request, { eventType: 'storefront.context.refresh', operation: 'refresh', outcome: 'rejected', reasonCode: 'HANDLE_INACTIVE' });
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error('ERR_STOREFRONT_00018', 'Active Storefront context handle is required');
        }
        try { value = await SERVICE.DefaultCacheService.consume(this.options(input.handle)); } catch (error) { value = undefined; }
        if (!value || value.active !== true || Number(value.expiresAt) <= Date.now() || !this.bindingMatches(value.bindingHash, input.binding)) {
            this.lifecycleMetrics.rejected += 1;
            this.audit(request, { eventType: 'storefront.context.refresh', operation: 'refresh', outcome: 'rejected', reasonCode: 'HANDLE_ALREADY_CONSUMED' });
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error('ERR_STOREFRONT_00018', 'Active Storefront context handle is required');
        }
        let resolved = { _authority: { tenantCode: value.tenantCode, enterpriseCode: value.enterpriseCode },
            storefrontCode: value.storefrontCode, downstream: value.context };
        try {
            let access = await this.issue(resolved, request);
            this.lifecycleMetrics.refreshed += 1;
            this.audit(request, { eventType: 'storefront.context.refreshed', operation: 'refresh', outcome: 'success',
                tenantCode: value.tenantCode, enterpriseCode: value.enterpriseCode, storefrontCode: value.storefrontCode });
            return access;
        } catch (error) {
            this.lifecycleMetrics.rejected += 1;
            throw error;
        }
    },
    /** Revokes one handle through the existing governed exact-key cache invalidation path. */
    revoke: async function (request) {
        let auth = request && request.authData || {}, input = request && request.body || {}, policy = this.policy();
        if (auth.tokenType !== 'service')
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error('ERR_STOREFRONT_00011', 'Module service identity is required');
        if (typeof input.handle !== 'string' || input.handle.length < 32 || input.handle.length > Number(policy.maximumHandleLength || 256))
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error('ERR_STOREFRONT_00018', 'Valid Storefront context handle is required');
        try { await SERVICE.DefaultCacheService.flushCache(Object.assign({}, this.options(input.handle), { keys: [this.key(input.handle)] })); }
        catch (error) {
            this.audit(request, { eventType: 'storefront.context.revoked', operation: 'revoke', outcome: 'failure', reasonCode: 'CACHE_INVALIDATION_FAILED' });
            throw error;
        }
        this.lifecycleMetrics.revoked += 1;
        this.audit(request, { eventType: 'storefront.context.revoked', operation: 'revoke', outcome: 'success', reasonCode: 'MODULE_REQUEST' });
        return { revoked: true };
    },
    /** Replaces the authoritative Storefront generation and invalidates every earlier handle without scanning keys. */
    revokeStorefront: async function (request) {
        let input = request && request.body || {}, tenantCode = request && request.tenant;
        let enterpriseCode = SERVICE.DefaultStorefrontManagementService.authorize(request);
        let storefrontCode = SERVICE.DefaultStorefrontEnterpriseScopeService.validateBusinessCode(input.storefrontCode, 'storefrontCode');
        return this.revokeScope({ tenantCode: tenantCode, enterpriseCode: enterpriseCode, storefrontCode: storefrontCode }, request, 'OPERATOR_REQUEST');
    },
    /** Performs internal generation replacement for a validated Storefront scope. */
    revokeScope: async function (scope, request, reasonCode) {
        let policy = this.policy(), ttl = Number(policy.generationTtlSeconds || Number(policy.ttlSeconds || 120) * 3);
        if (!scope || !scope.tenantCode || !scope.enterpriseCode || !scope.storefrontCode ||
            !Number.isInteger(ttl) || ttl <= Number(policy.ttlSeconds || 120))
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error('ERR_STOREFRONT_00016', 'Storefront revocation generation is unavailable');
        let generation = crypto.randomBytes(24).toString('base64url');
        try { await SERVICE.DefaultCacheService.put(Object.assign({}, this.generationOptions(scope), { value: generation, ttl: ttl })); }
        catch (error) {
            this.audit(request, { eventType: 'storefront.context.bulk-revoked', operation: 'bulkRevoke', outcome: 'failure',
                reasonCode: 'GENERATION_WRITE_FAILED', tenantCode: scope.tenantCode, enterpriseCode: scope.enterpriseCode, storefrontCode: scope.storefrontCode });
            throw error;
        }
        this.lifecycleMetrics.bulkRevoked += 1;
        this.audit(request, { eventType: 'storefront.context.bulk-revoked', operation: 'bulkRevoke', outcome: 'success',
            reasonCode: reasonCode || 'INTERNAL_REQUEST', tenantCode: scope.tenantCode, enterpriseCode: scope.enterpriseCode, storefrontCode: scope.storefrontCode });
        return { revoked: true, storefrontCode: scope.storefrontCode };
    },
    /** Applies bulk revocation after a Storefront enters a configured inactive lifecycle state. */
    revokeForLifecycle: function (request) {
        let model = request && request.model || {}, query = request && request.query || {}, policy = this.policy();
        if (!(policy.revokeOnStatuses || ['SUSPENDED', 'RETIRED']).includes(model.status)) return Promise.resolve(true);
        let auth = request.authData || {}, enterpriseCode = query.enterpriseCode || auth.enterpriseCode || auth.entCode;
        let storefrontCode = query.storefrontCode || model.storefrontCode;
        if (!request.tenant || !enterpriseCode || !storefrontCode)
            return Promise.reject(SERVICE.DefaultStorefrontEnterpriseScopeService.error('ERR_STOREFRONT_00016', 'Storefront lifecycle revocation scope is unavailable'));
        return this.revokeScope({ tenantCode: request.tenant, enterpriseCode: enterpriseCode, storefrontCode: storefrontCode }, request,
            model.status === 'SUSPENDED' ? 'LIFECYCLE_SUSPENDED' : 'LIFECYCLE_RETIRED');
    },
    /** Introspects one handle for an authenticated target module and returns only its audience projection. */
    introspect: async function (request) {
        let auth = request && request.authData || {}, input = request && request.body || {}, policy = this.policy();
        if (auth.tokenType !== 'service')
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error('ERR_STOREFRONT_00011', 'Module service identity is required');
        if (typeof input.handle !== 'string' || input.handle.length < 32 || input.handle.length > Number(policy.maximumHandleLength || 256))
            return { active: false };
        if (!(policy.audiences || []).includes(input.audience)) return { active: false };
        try {
            let value = await SERVICE.DefaultCacheService.get(this.options(input.handle));
            if (!value || value.active !== true || Number(value.expiresAt) <= Date.now() || !(value.audiences || []).includes(input.audience) ||
                !this.bindingMatches(value.bindingHash, input.binding))
                return { active: false };
            let generation = await this.generation(value);
            if (generation !== value.generation) return { active: false };
            return { active: true, tokenType: 'storefront_context', audience: input.audience,
                expiresAt: value.expiresAt, tenantCode: value.tenantCode, enterpriseCode: value.enterpriseCode,
                storefrontCode: value.storefrontCode, context: value.context && value.context[input.audience] };
        } catch (error) {
            return { active: false };
        }
    },
    /** Returns sanitized lifecycle counters without handles, bindings, or tenant data. */
    diagnostics: function () { return Object.assign({}, this.lifecycleMetrics); }
};
