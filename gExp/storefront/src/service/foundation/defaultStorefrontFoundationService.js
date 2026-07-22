/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/service/foundation/DefaultStorefrontFoundationService
 * @description Enforces Storefront composition, authoritative references, lifecycle, and immutable identity.
 * @layer service
 * @owner storefront
 * @override Projects may extend context dimensions while preserving owning-module reference authority.
 */
module.exports = {
    /** Initializes Storefront foundation governance. */
    init: function () {
        return Promise.resolve(true);
    },
    /** Completes Storefront governance initialization. */
    postInit: function () {
        return Promise.resolve(true);
    },
    /** Returns the effective Storefront policy. */
    policy: function () {
        return CONFIG.get('storefront') || {};
    },
    /** Extracts result items from a generated service response. */
    items: function (response) {
        return response && Array.isArray(response.result) ? response.result : [];
    },
    /** Normalizes one bounded and unique context-value list. */
    values: function (model, property) {
        let values = model[property] || [];
        if (!Array.isArray(values) || values.length > Number((this.policy().limits || {}).maximumContextValues || 100))
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00003',
                property + ' must be a bounded array'
            );
        return Array.from(
            new Set(
                values.map((value) =>
                    SERVICE.DefaultStorefrontEnterpriseScopeService.validateBusinessCode(value, property)
                )
            )
        );
    },
    /** Validates default membership and effective dates. */
    validateDefaults: function (model) {
        ['storeCodes', 'productCatalogCodes', 'countryCodes', 'localeCodes', 'currencyCodes', 'channelCodes'].forEach(
            (property) => {
                model[property] = this.values(model, property);
            }
        );
        if (!model.storeCodes.length || !model.storeCodes.includes(model.defaultStoreCode))
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00003',
                'defaultStoreCode must belong to storeCodes'
            );
        [
            ['defaultProductCatalogCode', 'productCatalogCodes'],
            ['defaultCountryCode', 'countryCodes'],
            ['defaultLocaleCode', 'localeCodes'],
            ['defaultCurrencyCode', 'currencyCodes'],
            ['defaultChannelCode', 'channelCodes']
        ].forEach((pair) => {
            if (model[pair[0]] && !model[pair[1]].includes(model[pair[0]]))
                throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                    'ERR_STOREFRONT_00003',
                    pair[0] + ' must belong to ' + pair[1]
                );
        });
        let from = model.effectiveFrom && new Date(model.effectiveFrom).getTime(),
            to = model.effectiveTo && new Date(model.effectiveTo).getTime();
        if (
            (model.effectiveFrom && !Number.isFinite(from)) ||
            (model.effectiveTo && !Number.isFinite(to)) ||
            (from && to && from > to)
        )
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00003',
                'Effective-from must not follow effective-to'
            );
        return model;
    },
    /** Validates configured lifecycle status and transitions. */
    validateLifecycle: function (existing, candidate) {
        let lifecycle = this.policy().lifecycle || {};
        if (!(lifecycle.statuses || []).includes(candidate.status))
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00003',
                'Storefront status is not allowed by configuration'
            );
        if (
            existing &&
            candidate.status !== existing.status &&
            !((lifecycle.allowedTransitions || {})[existing.status] || []).includes(candidate.status)
        )
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00004',
                'Lifecycle transition is invalid'
            );
        return true;
    },
    /** Prevents retirement while a live hostname endpoint still targets the Storefront. */
    assertRetirementSafe: async function (request, existing, candidate) {
        if (existing.status === 'RETIRED' || candidate.status !== 'RETIRED') return true;
        let response = await SERVICE.DefaultStorefrontEndpointService.get({
                tenant: (this.policy().contextResolution || {}).defaultTenant || 'default',
                authData: request.authData,
                query: {
                    enterpriseCode: existing.enterpriseCode,
                    tenantCode: request.tenant,
                    storefrontCode: existing.storefrontCode,
                    status: { $ne: 'RETIRED' }
                },
                searchOptions: { limit: 1 }
            }),
            items = this.items(response);
        if (items.length)
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00010',
                'Retire Storefront endpoints before retiring their Storefront'
            );
        return true;
    },
    /** Validates CMS Site, Store, and catalog references through their owners. */
    validateReferences: async function (request, model) {
        await SERVICE.DefaultStorefrontCmsSiteReferenceProviderService.resolve(request, model.cmsSiteCode);
        await Promise.all(
            model.storeCodes.map((code) =>
                SERVICE.DefaultStorefrontStoreReferenceProviderService.resolve(request, code)
            )
        );
        await Promise.all(
            model.productCatalogCodes.map((code) =>
                SERVICE.DefaultStorefrontCatalogReferenceProviderService.validate(request, code)
            )
        );
        return true;
    },
    /** Prepares one new enterprise-owned Storefront for persistence. */
    prepareSave: async function (request) {
        SERVICE.DefaultStorefrontEnterpriseScopeService.scopeNewModel(request, 'storefront', ['storefrontCode']);
        request.model.status = request.model.status || 'DRAFT';
        this.validateDefaults(request.model);
        this.validateLifecycle(undefined, request.model);
        await this.validateReferences(request, request.model);
        return true;
    },
    /** Loads exactly one scoped Storefront for update. */
    loadExisting: async function (request) {
        await SERVICE.DefaultStorefrontEnterpriseScopeService.scopeQuery(request);
        let response = await SERVICE.DefaultStorefrontService.get({
                tenant: request.tenant,
                authData: request.authData,
                query: Object.assign({}, request.query),
                searchOptions: { limit: 2 }
            }),
            items = this.items(response);
        if (items.length !== 1)
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00003',
                'Update must identify one Storefront'
            );
        return items[0];
    },
    /** Validates Storefront identity, lifecycle, defaults, and references before update. */
    prepareUpdate: async function (request) {
        let existing = await this.loadExisting(request),
            patch = (request.model && (request.model.$set || request.model)) || {};
        ['code', 'enterpriseCode', 'storefrontCode'].forEach((property) => {
            if (patch[property] !== undefined && patch[property] !== existing[property])
                throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                    'ERR_STOREFRONT_00006',
                    property + ' is immutable'
                );
        });
        let candidate = this.validateDefaults(Object.assign({}, existing, patch));
        this.validateLifecycle(existing, candidate);
        await this.assertRetirementSafe(request, existing, candidate);
        await this.validateReferences(request, candidate);
        patch.enterpriseCode = existing.enterpriseCode;
        return true;
    },
    /** Rejects destructive Storefront deletion in favor of retirement. */
    rejectHardDelete: function () {
        return Promise.reject(
            SERVICE.DefaultStorefrontEnterpriseScopeService.error('ERR_STOREFRONT_00007', 'Storefronts must be retired')
        );
    }
};
