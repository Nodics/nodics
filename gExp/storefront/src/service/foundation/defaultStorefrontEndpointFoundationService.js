/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/service/foundation/DefaultStorefrontEndpointFoundationService
 * @description Governs exact public hostname mappings stored in the configured bootstrap tenant.
 * @layer service
 * @owner storefront
 * @override Projects may extend hostname policy without introducing another routing authority.
 */
module.exports = {
    /** Initializes Storefront endpoint governance. */
    init: function () {
        return Promise.resolve(true);
    },
    /** Completes endpoint governance initialization. */
    postInit: function () {
        return Promise.resolve(true);
    },
    /** Returns the effective Storefront endpoint policy. */
    policy: function () {
        return CONFIG.get('storefront') || {};
    },
    /** Normalizes and validates one exact DNS hostname. */
    normalizeHostname: function (value) {
        let host = typeof value === 'string' ? value.trim().toLowerCase().replace(/\.$/, '') : '';
        if (
            host.startsWith('[') ||
            host.includes('/') ||
            host.includes('@') ||
            host.includes('*') ||
            host.includes(':') ||
            /^(?:\d{1,3}\.){3}\d{1,3}$/.test(host) ||
            !host ||
            host.length > Number((this.policy().host || {}).maximumLength || 253) ||
            !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(host)
        )
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00008',
                'A valid exact DNS hostname is required'
            );
        return host;
    },
    /** Returns the configured hostname bootstrap tenant. */
    bootstrapTenant: function () {
        return (this.policy().contextResolution || {}).defaultTenant || 'default';
    },
    /** Builds the database-enforced canonical or alias uniqueness key. */
    canonicalKey: function (model) {
        if (model.status === 'RETIRED') return ['retired', model.hostname].join('::');
        return model.canonical === true
            ? ['canonical', model.enterpriseCode, model.tenantCode, model.storefrontCode].join('::')
            : ['alias', model.hostname].join('::');
    },
    /** Validates endpoint scheme, lifecycle status, and effective dates. */
    validateClassification: function (model) {
        let lifecycle = this.policy().endpointLifecycle || {},
            schemes = (this.policy().host || {}).allowedSchemes || ['https'],
            from = model.effectiveFrom && new Date(model.effectiveFrom).getTime(),
            to = model.effectiveTo && new Date(model.effectiveTo).getTime();
        if (!(lifecycle.statuses || []).includes(model.status) || !schemes.includes(model.scheme))
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00003',
                'Endpoint status or scheme is not allowed by configuration'
            );
        if (
            (model.effectiveFrom && !Number.isFinite(from)) ||
            (model.effectiveTo && !Number.isFinite(to)) ||
            (from && to && from > to)
        )
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00003',
                'Endpoint effective dates are invalid'
            );
        return true;
    },
    /** Validates that the mapped tenant-local Storefront exists. */
    validateStorefront: async function (request, model) {
        let response = await SERVICE.DefaultStorefrontService.get({
                tenant: model.tenantCode,
                authData: request.authData,
                query: { enterpriseCode: model.enterpriseCode, storefrontCode: model.storefrontCode },
                searchOptions: { limit: 2 }
            }),
            items = response && Array.isArray(response.result) ? response.result : [];
        if (items.length !== 1)
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00005',
                'Mapped Storefront is unavailable'
            );
        if (model.status === 'ACTIVE' && items[0].status !== 'ACTIVE')
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00005',
                'An active endpoint requires an active Storefront'
            );
        return true;
    },
    /** Rejects duplicate hostnames and multiple live canonical endpoints for one Storefront. */
    validateConflicts: async function (request, model, existingCode) {
        let base = { tenant: this.bootstrapTenant(), authData: request.authData, searchOptions: { limit: 2 } },
            response = await SERVICE.DefaultStorefrontEndpointService.get(
                Object.assign({}, base, { query: { hostname: model.hostname } })
            ),
            items = response && Array.isArray(response.result) ? response.result : [];
        if (items.some((item) => item.code !== existingCode))
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00010',
                'Hostname is already assigned'
            );
        if (model.canonical === true && model.status !== 'RETIRED') {
            response = await SERVICE.DefaultStorefrontEndpointService.get(
                Object.assign({}, base, {
                    query: {
                        enterpriseCode: model.enterpriseCode,
                        tenantCode: model.tenantCode,
                        storefrontCode: model.storefrontCode,
                        canonical: true,
                        status: { $ne: 'RETIRED' }
                    }
                })
            );
            items = response && Array.isArray(response.result) ? response.result : [];
            if (items.some((item) => item.code !== existingCode))
                throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                    'ERR_STOREFRONT_00010',
                    'Storefront already has a canonical hostname'
                );
        }
        return true;
    },
    /** Normalizes and validates a new hostname endpoint before persistence. */
    prepareSave: async function (request) {
        request.model = request.model || {};
        let enterpriseCode = SERVICE.DefaultStorefrontEnterpriseScopeService.resolveEnterpriseCode(request);
        if (request.model.enterpriseCode && request.model.enterpriseCode !== enterpriseCode)
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00002',
                'Endpoint enterprise mismatch'
            );
        request.model.enterpriseCode = enterpriseCode;
        request.model.tenantCode = SERVICE.DefaultStorefrontEnterpriseScopeService.validateBusinessCode(
            request.model.tenantCode || request.tenant,
            'Tenant'
        );
        request.model.hostname = this.normalizeHostname(request.model.hostname);
        request.model.storefrontCode = SERVICE.DefaultStorefrontEnterpriseScopeService.validateBusinessCode(
            request.model.storefrontCode,
            'Storefront'
        );
        request.model.scheme = request.model.scheme || 'https';
        request.model.status = request.model.status || 'DRAFT';
        request.model.canonical = request.model.canonical === true;
        let canonicalKey = this.canonicalKey(request.model);
        if (request.model.canonicalKey && request.model.canonicalKey !== canonicalKey)
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00006',
                'Endpoint canonical key is derived'
            );
        request.model.canonicalKey = canonicalKey;
        request.model.code = SERVICE.DefaultStorefrontEnterpriseScopeService.buildIdentity(enterpriseCode, 'endpoint', [
            request.model.hostname
        ]);
        this.validateClassification(request.model);
        await this.validateStorefront(request, request.model);
        await this.validateConflicts(request, request.model);
        return true;
    },
    /** Loads exactly one enterprise-owned endpoint for update. */
    loadExisting: async function (request) {
        let response = await SERVICE.DefaultStorefrontEndpointService.get({
                tenant: this.bootstrapTenant(),
                authData: request.authData,
                query: Object.assign({}, request.query, {
                    enterpriseCode: SERVICE.DefaultStorefrontEnterpriseScopeService.resolveEnterpriseCode(request)
                }),
                searchOptions: { limit: 2 }
            }),
            items = response && Array.isArray(response.result) ? response.result : [];
        if (items.length !== 1)
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00003',
                'Update must identify one endpoint'
            );
        return items[0];
    },
    /** Preserves endpoint identity and validates an endpoint update. */
    prepareUpdate: async function (request) {
        let existing = await this.loadExisting(request),
            patch = (request.model && (request.model.$set || request.model)) || {};
        ['code', 'enterpriseCode', 'hostname'].forEach((property) => {
            if (
                patch[property] !== undefined &&
                (property !== 'hostname' ? patch[property] : this.normalizeHostname(patch[property])) !==
                    existing[property]
            )
                throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                    'ERR_STOREFRONT_00006',
                    property + ' is immutable'
                );
        });
        let candidate = Object.assign({}, existing, patch);
        candidate.scheme = candidate.scheme || 'https';
        candidate.canonical = candidate.canonical === true;
        this.validateClassification(candidate);
        let transitions = (this.policy().endpointLifecycle || {}).allowedTransitions || {};
        if (candidate.status !== existing.status && !(transitions[existing.status] || []).includes(candidate.status))
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00004',
                'Endpoint lifecycle transition is invalid'
            );
        await this.validateStorefront(request, candidate);
        await this.validateConflicts(request, candidate, existing.code);
        patch.enterpriseCode = existing.enterpriseCode;
        patch.tenantCode = existing.tenantCode;
        patch.canonicalKey = this.canonicalKey(candidate);
        return true;
    },
    /** Rejects destructive endpoint deletion in favor of retirement. */
    rejectHardDelete: function () {
        return Promise.reject(
            SERVICE.DefaultStorefrontEnterpriseScopeService.error('ERR_STOREFRONT_00007', 'Endpoints must be retired')
        );
    }
};
