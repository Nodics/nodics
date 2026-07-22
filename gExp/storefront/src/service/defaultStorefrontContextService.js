/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/service/DefaultStorefrontContextService
 * @description Resolves one client-safe active context from the trusted request hostname and authoritative module references.
 * @layer service
 * @owner storefront
 * @override Projects may add safe context dimensions while hostname and referenced-module ownership remain authoritative.
 */
module.exports = {
    /** Initializes Storefront context resolution. */
    init: function () {
        return Promise.resolve(true);
    },
    /** Completes context resolution initialization. */
    postInit: function () {
        return Promise.resolve(true);
    },
    /** Returns the effective Storefront configuration. */
    policy: function () {
        return CONFIG.get('storefront') || {};
    },
    /** Extracts result items from a generated service response. */
    items: function (response) {
        return response && Array.isArray(response.result) ? response.result : [];
    },
    /** Reads and normalizes the trusted HTTP request hostname. */
    requestHostname: function (request) {
        let host = request && request.hostname;
        if (!host && request && request.headers) host = request.headers.host;
        if (typeof host === 'string' && host.includes(':') && !host.startsWith('[')) host = host.split(':')[0];
        return SERVICE.DefaultStorefrontEndpointFoundationService.normalizeHostname(host);
    },
    /** Determines whether a record is currently effective. */
    isEffective: function (item, now) {
        now = now || Date.now();
        return (
            (!item.effectiveFrom || new Date(item.effectiveFrom).getTime() <= now) &&
            (!item.effectiveTo || new Date(item.effectiveTo).getTime() > now)
        );
    },
    /** Builds a trusted internal service request for the resolved tenant and enterprise. */
    internalRequest: function (tenant, enterpriseCode) {
        return {
            tenant: tenant,
            authData: {
                tokenType: 'service',
                principalId: 'storefront-context-resolver',
                enterpriseCode: enterpriseCode
            }
        };
    },
    /** Resolves one active client-safe Storefront context for the request hostname. */
    resolve: async function (request) {
        let hostname = this.requestHostname(request),
            bootstrapTenant = (this.policy().contextResolution || {}).defaultTenant || 'default',
            response = await SERVICE.DefaultStorefrontEndpointService.get({
                tenant: bootstrapTenant,
                query: { hostname: hostname, status: 'ACTIVE' },
                searchOptions: { limit: 2 }
            }),
            endpoints = this.items(response).filter((item) => this.isEffective(item));
        if (endpoints.length !== 1)
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00009',
                'Active hostname mapping was not found'
            );
        let endpoint = endpoints[0],
            internal = this.internalRequest(endpoint.tenantCode, endpoint.enterpriseCode);
        response = await SERVICE.DefaultStorefrontService.get({
            tenant: endpoint.tenantCode,
            authData: internal.authData,
            query: {
                enterpriseCode: endpoint.enterpriseCode,
                storefrontCode: endpoint.storefrontCode,
                status: 'ACTIVE'
            },
            searchOptions: { limit: 2 }
        });
        let storefronts = this.items(response).filter((item) => this.isEffective(item));
        if (storefronts.length !== 1)
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00009',
                'Active Storefront was not found'
            );
        let item = storefronts[0],
            site = await SERVICE.DefaultStorefrontCmsSiteReferenceProviderService.resolve(internal, item.cmsSiteCode),
            store = await SERVICE.DefaultStorefrontStoreReferenceProviderService.resolve(
                internal,
                item.defaultStoreCode
            );
        return {
            hostname: hostname,
            canonical: endpoint.canonical === true,
            scheme: endpoint.scheme,
            storefrontCode: item.storefrontCode,
            name: item.name,
            cmsSite: site,
            stores: item.storeCodes,
            defaultStore: store,
            productCatalogCodes: item.productCatalogCodes || [],
            defaultProductCatalogCode: item.defaultProductCatalogCode,
            countries: item.countryCodes || [],
            locales: item.localeCodes || [],
            currencies: item.currencyCodes || [],
            channels: item.channelCodes || [],
            defaults: {
                locale: item.defaultLocaleCode,
                currency: item.defaultCurrencyCode,
                channel: item.defaultChannelCode
            }
        };
    }
};
