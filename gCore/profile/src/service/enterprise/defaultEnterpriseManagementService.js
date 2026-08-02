/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/service/enterprise/DefaultEnterpriseManagementService
 * @description Implements bounded, human-only enterprise discovery over the generated Profile enterprise service.
 * @layer service
 * @owner profile
 * @override Later modules may tighten filters, bounds, or projection through layered configuration without creating another persistence path.
 */
module.exports = {
    /** Returns effective layered enterprise-search policy. */
    policy: function () {
        return (CONFIG.get('enterpriseManagement') || {}).search || {};
    },

    /** Creates a stable Profile validation error. */
    error: function (message) {
        return new CLASSES.NodicsError('ERR_PRFL_00003', message);
    },

    /** Requires an authenticated human access-token principal. */
    authorize: function (request) {
        let auth = request && request.authData || {};
        if (auth.tokenType !== 'access' || !(auth.principalId || auth.loginId || auth.code)) {
            throw this.error('Enterprise search requires an authenticated employee access token');
        }
    },

    /** Parses one positive bounded integer without silently changing caller intent. */
    boundedInteger: function (value, fallback, maximum, name) {
        if (value === undefined || value === null || value === '') return fallback;
        let normalized = typeof value === 'number' ? value : Number(String(value));
        if (!Number.isSafeInteger(normalized) || normalized < 1 || normalized > maximum) {
            throw this.error(name + ' is outside the configured boundary');
        }
        return normalized;
    },

    /** Validates and maps scalar HTTP filters to the authoritative generated-service query. */
    buildQuery: function (input, policy) {
        let allowed = ['code', 'name', 'active', 'page', 'limit'];
        if (!input || typeof input !== 'object' || Array.isArray(input) ||
            Object.keys(input).some(key => !allowed.includes(key)) ||
            Object.values(input).some(value => value !== null && typeof value === 'object')) {
            throw this.error('Enterprise search filters are invalid');
        }
        let query = {};
        if (input.code !== undefined) {
            let code = String(input.code).trim();
            if (!code || code.length > Number(policy.maximumCodeLength || 128) ||
                !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(code)) {
                throw this.error('Enterprise code filter is invalid');
            }
            query.code = code;
        }
        if (input.name !== undefined) {
            let name = String(input.name).trim();
            if (!name || name.length > Number(policy.maximumNameLength || 256)) {
                throw this.error('Enterprise name filter is invalid');
            }
            query.name = name;
        }
        if (input.active !== undefined) {
            if (input.active !== true && input.active !== false &&
                input.active !== 'true' && input.active !== 'false') {
                throw this.error('Enterprise active filter must be true or false');
            }
            query.active = input.active === true || input.active === 'true';
        }
        return query;
    },

    /** Projects only configured client-safe enterprise fields. */
    project: function (item, fields) {
        return fields.reduce((result, field) => {
            if (!item || item[field] === undefined) return result;
            if (field === 'tenant') {
                result.tenantCode = typeof item.tenant === 'object' ? item.tenant.code : item.tenant;
            } else if (field === 'superEnterprise') {
                result.superEnterpriseCode = typeof item.superEnterprise === 'object' ?
                    item.superEnterprise.code : item.superEnterprise;
            } else {
                result[field] = item[field];
            }
            return result;
        }, {});
    },

    /** Searches enterprises through the existing generated Profile service. */
    search: async function (request) {
        this.authorize(request);
        let policy = this.policy();
        let input = request.query || {};
        let limit = this.boundedInteger(input.limit, Number(policy.defaultResultCount || 25),
            Number(policy.maximumResultCount || 100), 'limit');
        let page = this.boundedInteger(input.page, 1,
            Number(policy.maximumPageNumber || 10000), 'page');
        let response = await SERVICE.DefaultEnterpriseService.get({
            tenant: CONFIG.get('defaultTenant') || 'default',
            authData: request.authData,
            query: this.buildQuery(input, policy),
            options: { recursive: false },
            searchOptions: {
                pageSize: limit,
                pageNumber: page,
                sort: { code: 1 }
            }
        });
        let items = response && Array.isArray(response.result) ? response.result : [];
        let fields = Array.isArray(policy.projectedFields) ? policy.projectedFields :
            ['code', 'name', 'active', 'tenant'];
        return {
            page: page,
            limit: limit,
            count: items.length,
            items: items.map(item => this.project(item, fields))
        };
    },

    /** Creates one enterprise through the generated Profile service after caller confirmation was enforced upstream. */
    create: async function (request) {
        this.authorize(request);
        let policy = (CONFIG.get('enterpriseManagement') || {}).create || {};
        let input = request.body || {};
        let allowed = ['code', 'name', 'tenantCode', 'superEnterpriseCode', 'active', 'idempotencyKey'];
        if (!input || typeof input !== 'object' || Array.isArray(input) ||
            Object.keys(input).some(key => !allowed.includes(key))) {
            throw this.error('Enterprise creation input is invalid');
        }
        let code = String(input.code || '').trim();
        let name = String(input.name || '').trim();
        let tenantCode = String(input.tenantCode || request.tenant || CONFIG.get('defaultTenant') || 'default').trim();
        let persistenceTenant = CONFIG.get('defaultTenant') || 'default';
        if (!code || code.length > Number(policy.maximumCodeLength || 128) ||
            !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(code) ||
            !name || name.length > Number(policy.maximumNameLength || 256) ||
            !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(tenantCode)) {
            throw this.error('Enterprise creation fields are invalid');
        }
        let existing = await SERVICE.DefaultEnterpriseService.get({
            tenant: persistenceTenant, authData: request.authData, query: { code: code },
            searchOptions: { pageSize: 2, pageNumber: 1 }
        });
        if (existing && Array.isArray(existing.result) && existing.result.length) {
            throw this.error('Enterprise code already exists');
        }
        let tenantOwner = await SERVICE.DefaultEnterpriseService.get({
            tenant: persistenceTenant, authData: request.authData, query: { tenant: tenantCode },
            searchOptions: { pageSize: 2, pageNumber: 1 }
        });
        if (tenantOwner && Array.isArray(tenantOwner.result) && tenantOwner.result.length) {
            throw this.error('Enterprise tenant is already assigned');
        }
        let model = { code: code, name: name, tenant: tenantCode, active: input.active !== false };
        if (input.superEnterpriseCode) model.superEnterprise = String(input.superEnterpriseCode);
        let response = await SERVICE.DefaultEnterpriseService.save({
            tenant: persistenceTenant, authData: request.authData, model: model,
            idempotencyKey: input.idempotencyKey
        });
        let saved = response && (response.result || response.data || response);
        let fields = Array.isArray(policy.projectedFields) ? policy.projectedFields :
            ['code', 'name', 'active', 'tenant'];
        return this.project(saved, fields);
    }
};
