/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/service/DefaultStorefrontManagementService
 * @description Provides bounded human management operations for Storefront definitions and hostname endpoints.
 * @layer service
 * @owner storefront
 * @override Later modules may extend resources while preserving human authentication and enterprise isolation.
 */
module.exports = {
    /** Initializes Storefront management. */
    init: function () {
        return Promise.resolve(true);
    },
    /** Completes management service initialization. */
    postInit: function () {
        return Promise.resolve(true);
    },
    /** Returns the allow-listed management resource definitions. */
    resources: function () {
        return {
            storefronts: {
                service: 'DefaultStorefrontService',
                identity: 'storefrontCode',
                filters: ['storefrontCode', 'cmsSiteCode', 'status'],
                fields: [
                    'code',
                    'storefrontCode',
                    'name',
                    'cmsSiteCode',
                    'storeCodes',
                    'defaultStoreCode',
                    'productCatalogCodes',
                    'defaultProductCatalogCode',
                    'countryCodes',
                    'localeCodes',
                    'currencyCodes',
                    'channelCodes',
                    'defaultLocaleCode',
                    'defaultCountryCode',
                    'defaultCurrencyCode',
                    'defaultChannelCode',
                    'status',
                    'effectiveFrom',
                    'effectiveTo',
                    'updatedAt'
                ]
            },
            endpoints: {
                service: 'DefaultStorefrontEndpointService',
                identity: 'hostname',
                bootstrap: true,
                filters: ['hostname', 'storefrontCode', 'status'],
                fields: [
                    'code',
                    'hostname',
                    'storefrontCode',
                    'tenantCode',
                    'canonical',
                    'scheme',
                    'status',
                    'effectiveFrom',
                    'effectiveTo',
                    'updatedAt'
                ]
            }
        };
    },
    /** Returns the effective Storefront management policy. */
    policy: function () {
        return CONFIG.get('storefront') || {};
    },
    /** Resolves a named request parameter across supported request shapes. */
    parameter: function (request, name) {
        return (
            request &&
            ((request.params && request.params[name]) ||
                (request.pathParams && request.pathParams[name]) ||
                request[name])
        );
    },
    /** Requires a human access-token principal and returns its enterprise. */
    authorize: function (request) {
        let auth = (request && request.authData) || {};
        if (!auth.tokenType || auth.tokenType === 'service' || !(auth.principalId || auth.loginId || auth.code))
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00011',
                'Human principal is required'
            );
        return SERVICE.DefaultStorefrontEnterpriseScopeService.resolveEnterpriseCode(request);
    },
    /** Resolves and validates the requested management resource. */
    resource: function (request) {
        let name = this.parameter(request, 'resource'),
            resource = this.resources()[name];
        if (
            !resource ||
            !((this.policy().management || {}).allowedResources || []).includes(name) ||
            !SERVICE[resource.service]
        )
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00012',
                'Unsupported management resource'
            );
        return Object.assign({ name: name }, resource);
    },
    /** Selects the bootstrap or request tenant for a resource. */
    tenant: function (request, resource) {
        return resource.bootstrap ? (this.policy().contextResolution || {}).defaultTenant || 'default' : request.tenant;
    },
    /** Reads and bounds one management request body. */
    body: function (request) {
        let body = (request && (request.body || request.model)) || {};
        if (!body || Array.isArray(body) || typeof body !== 'object')
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00012',
                'Body must be an object'
            );
        if (
            Buffer.byteLength(JSON.stringify(body)) > Number((this.policy().limits || {}).maximumPayloadBytes || 262144)
        )
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00013',
                'Payload exceeds configured bounds'
            );
        return body;
    },
    /** Projects only fields approved for management responses. */
    project: function (item, fields) {
        return fields.reduce((output, field) => {
            if (item && item[field] !== undefined) output[field] = item[field];
            return output;
        }, {});
    },
    /** Lists bounded enterprise-owned records. */
    list: async function (request) {
        let enterpriseCode = this.authorize(request),
            resource = this.resource(request),
            input = request.query || {},
            unknown = Object.keys(input).filter(
                (key) => !resource.filters.includes(key) && !['limit', 'page'].includes(key)
            );
        if (unknown.length || Object.values(input).some((value) => value && typeof value === 'object'))
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error('ERR_STOREFRONT_00012', 'Filters are invalid');
        let maximum = Number((this.policy().limits || {}).maximumResultCount || 500),
            limit = Math.min(maximum, Math.max(1, Number(input.limit) || maximum)),
            query = { enterpriseCode: enterpriseCode };
        resource.filters.forEach((key) => {
            if (input[key] !== undefined)
                query[key] =
                    key === 'hostname'
                        ? SERVICE.DefaultStorefrontEndpointFoundationService.normalizeHostname(input[key])
                        : input[key];
        });
        let response = await SERVICE[resource.service].get({
                tenant: this.tenant(request, resource),
                authData: request.authData,
                query: query,
                searchOptions: { limit: limit }
            }),
            items = response && Array.isArray(response.result) ? response.result : [];
        return {
            resource: resource.name,
            count: items.length,
            items: items.map((item) => this.project(item, resource.fields))
        };
    },
    /** Gets one enterprise-owned record by business identity. */
    get: async function (request) {
        let enterpriseCode = this.authorize(request),
            resource = this.resource(request),
            value = this.parameter(request, 'businessCode');
        value =
            resource.identity === 'hostname'
                ? SERVICE.DefaultStorefrontEndpointFoundationService.normalizeHostname(value)
                : SERVICE.DefaultStorefrontEnterpriseScopeService.validateBusinessCode(value, resource.identity);
        let query = { enterpriseCode: enterpriseCode };
        query[resource.identity] = value;
        let response = await SERVICE[resource.service].get({
                tenant: this.tenant(request, resource),
                authData: request.authData,
                query: query,
                searchOptions: { limit: 2 }
            }),
            items = response && Array.isArray(response.result) ? response.result : [];
        if (items.length !== 1)
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error('ERR_STOREFRONT_00009', 'Record was not found');
        return this.project(items[0], resource.fields);
    },
    /** Creates one record through its authoritative generated service. */
    create: async function (request) {
        this.authorize(request);
        let resource = this.resource(request),
            model = Object.assign({}, this.body(request));
        delete model.code;
        delete model.enterpriseCode;
        if (resource.bootstrap) model.tenantCode = model.tenantCode || request.tenant;
        return SERVICE[resource.service].save({
            tenant: this.tenant(request, resource),
            authData: request.authData,
            model: model
        });
    },
    /** Updates one enterprise-owned record by business identity. */
    update: async function (request) {
        let enterpriseCode = this.authorize(request),
            resource = this.resource(request),
            value = this.parameter(request, 'businessCode');
        value =
            resource.identity === 'hostname'
                ? SERVICE.DefaultStorefrontEndpointFoundationService.normalizeHostname(value)
                : SERVICE.DefaultStorefrontEnterpriseScopeService.validateBusinessCode(value, resource.identity);
        let query = { enterpriseCode: enterpriseCode },
            model = Object.assign({}, this.body(request));
        query[resource.identity] = value;
        delete model.code;
        delete model.enterpriseCode;
        return SERVICE[resource.service].update({
            tenant: this.tenant(request, resource),
            authData: request.authData,
            query: query,
            model: model
        });
    },
    /** Retires a record while preserving its history. */
    retire: function (request) {
        request.body = { status: 'RETIRED' };
        return this.update(request);
    }
};
