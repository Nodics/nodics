/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/service/validation/defaultCmsContractValidationService
 * @description Validates CMS-owned renderer, route, and ordered-composition contracts before persistence.
 * @layer service
 * @owner cms
 * @override Later modules may strengthen validation through service overrides or additional interceptors.
 */
module.exports = {
    /** Initializes the contract-validation lifecycle. */
    init: function () { return Promise.resolve(true); },
    /** Completes the contract-validation lifecycle. */
    postInit: function () { return Promise.resolve(true); },

    /** Rejects executable or malformed renderer identifiers. */
    validateRenderer: function (request) {
        let renderer = request.model && request.model.renderer;
        let policy = this.rendererPolicy();
        if (typeof renderer !== 'string' || !new RegExp(policy.keyPattern).test(renderer) || policy.prohibitedSchemes.some(scheme => renderer.toLowerCase().startsWith(scheme))) {
            return Promise.reject(this.error('CMS_RENDERER_KEY_INVALID', 'renderer must be a logical, non-executable key'));
        }
        return Promise.resolve(true);
    },

    /** Normalizes and validates route and redirect paths. */
    validateRoute: function (request) {
        let model = request.model || {};
        if (typeof model.path !== 'string' || model.path.charAt(0) !== '/' || model.path.includes('://')) {
            return Promise.reject(this.error('CMS_ROUTE_PATH_INVALID', 'route path must be an absolute application path'));
        }
        model.path = model.path.replace(/\/+/g, '/');
        if (model.routeType === 'REDIRECT' && (typeof model.redirectPath !== 'string' || model.redirectPath.charAt(0) !== '/' || model.redirectPath.includes('://'))) {
            return Promise.reject(this.error('CMS_REDIRECT_PATH_INVALID', 'redirectPath must be a safe relative application path'));
        }
        return Promise.resolve(true);
    },

    /** Validates association identity and rejects occupied slot positions. */
    validateAssociation: async function (request) {
        let model = request.model || {};
        model.slot = model.slot || 'default';
        if (!model.source || !model.target || !Number.isInteger(model.index) || model.index < 0) {
            throw this.error('CMS_ASSOCIATION_INVALID', 'source, target, slot, and a non-negative integer index are required');
        }
        let response = await SERVICE.DefaultCmsComponentDetailService.get({
            tenant: request.tenant,
            authData: request.authData,
            options: Object.assign({}, request.options || {}, { recursive: false }),
            query: { source: model.source, slot: model.slot, index: model.index, active: true }
        });
        let conflicts = response && Array.isArray(response.result) ? response.result.filter(item => item.code !== model.code) : [];
        if (conflicts.length) throw this.error('CMS_ASSOCIATION_POSITION_CONFLICT', 'slot position is already occupied for this source');
        return true;
    },

    /** Validates one CMS-owned association to an nMedia-owned Media item or Media Set. */
    validateComponentMedia: async function (request) {
        let model = request.model || {};
        let policy = this.mediaReferencePolicy();
        model.slot = model.slot || 'default';
        model.mediaType = model.mediaType || 'IMAGE';
        let hasMedia = !!model.mediaCode;
        let hasMediaSet = !!model.mediaSetCode;
        if (!model.componentCode || !model.componentMediaCode || hasMedia === hasMediaSet ||
            !(policy.mediaTypes || []).includes(model.mediaType) ||
            !(policy.roles || []).includes(model.role) ||
            !Number.isInteger(Number(model.position)) || Number(model.position) < 0) {
            throw this.error('ERR_CMS_00094', 'CMS component media identity, type, role, target, or position is invalid');
        }
        if (model.localeCode && !new RegExp(policy.localePattern).test(model.localeCode)) {
            throw this.error('ERR_CMS_00094', 'CMS component media locale is invalid');
        }
        await this.validateComponent(model, request);
        await this.validateNMediaReference(request, hasMediaSet ? 'MEDIA_SET' : 'MEDIA', hasMediaSet ? model.mediaSetCode : model.mediaCode);
        let response = await SERVICE.DefaultCmsComponentMediaService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: { componentCode: model.componentCode, active: true },
            searchOptions: { limit: Number(policy.maximumReferencesPerComponent || 200) + 1 }
        });
        let references = this.items(response).filter(item => item.code !== model.code);
        if (references.length >= Number(policy.maximumReferencesPerComponent || 200) ||
            references.some(item => item.role === model.role && (item.slot || 'default') === model.slot &&
                (item.localeCode || '') === (model.localeCode || '') && Number(item.position) === Number(model.position))) {
            throw this.error('ERR_CMS_00094', 'CMS component media order is duplicated or exceeds configured bounds');
        }
        return true;
    },

    /** Validates a component-media patch by merging it with the current record. */
    validateComponentMediaUpdate: async function (request) {
        let response = await SERVICE.DefaultCmsComponentMediaService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: request.query,
            searchOptions: { limit: 2 }
        });
        let items = this.items(response);
        if (items.length !== 1) throw this.error('ERR_CMS_00094', 'CMS component media update target must resolve exactly one record');
        let current = items[0];
        let patch = request.model || {};
        ['code', 'componentMediaCode', 'componentCode'].forEach(property => {
            if (patch[property] !== undefined && JSON.stringify(patch[property]) !== JSON.stringify(current[property])) {
                throw this.error('ERR_CMS_00094', 'CMS component media identity is immutable');
            }
        });
        await this.validateComponentMedia(Object.assign({}, request, { model: Object.assign({}, current, patch) }));
        return true;
    },

    /** Validates the owning component is available in CMS. */
    validateComponent: async function (model, request) {
        let response = await SERVICE.DefaultCmsComponentService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: { code: model.componentCode, active: true },
            searchOptions: { limit: 2 }
        });
        if (this.items(response).length !== 1) throw this.error('ERR_CMS_00094', 'CMS component for media association is unavailable');
        return true;
    },

    /** Validates media identity through nMedia-owned reference lookup. */
    validateNMediaReference: async function (request, referenceType, referenceCode) {
        if (SERVICE.DefaultMediaReferenceLookupService && typeof SERVICE.DefaultMediaReferenceLookupService.validateInternal === 'function') {
            let result = await SERVICE.DefaultMediaReferenceLookupService.validateInternal({
                tenant: request.tenant,
                authData: request.authData,
                body: { referenceType: referenceType, referenceCode: referenceCode }
            });
            if (result && result.referenceType === referenceType && result.code === referenceCode) return true;
        } else if (SERVICE.DefaultModuleService && typeof NODICS !== 'undefined' && NODICS.getInternalAuthToken) {
            let policy = this.mediaReferencePolicy();
            let token = NODICS.getInternalAuthToken(request.tenant);
            if (!token) throw this.error('ERR_CMS_00094', 'Media service token is unavailable');
            let response = await SERVICE.DefaultModuleService.fetch(SERVICE.DefaultModuleService.buildRequest({
                moduleName: policy.moduleName || 'media',
                apiVersion: policy.apiVersion || 'v0',
                apiName: policy.apiName || '/references/media/validate',
                methodName: 'POST',
                requestBody: { referenceType: referenceType, referenceCode: referenceCode },
                timeoutMs: Number(policy.requestTimeoutMs || 2000),
                maxAttempts: Number(policy.maximumAttempts || 2),
                header: { Authorization: 'Bearer ' + token }
            }));
            let result = response && (response.data || response.result);
            if (result && result.referenceType === referenceType && result.code === referenceCode) return true;
        }
        throw this.error('ERR_CMS_00094', 'nMedia reference is unavailable for CMS component media');
    },

    /** Extracts generated-service result items. */
    items: function (response) {
        return response && Array.isArray(response.result) ? response.result : [];
    },

    /** Returns the effective layered renderer policy. */
    rendererPolicy: function () {
        let configured = typeof CONFIG !== 'undefined' && CONFIG.get ? (CONFIG.get('cms') || {}).renderer : {};
        return Object.assign({
            keyPattern: '^[a-z][a-z0-9]*(\\.[a-z][a-z0-9-]*)+$',
            prohibitedSchemes: ['http:', 'https:', 'javascript:', 'data:', 'file:']
        }, configured || {});
    },

    /** Returns effective layered CMS component-media policy. */
    mediaReferencePolicy: function () {
        let configured = typeof CONFIG !== 'undefined' && CONFIG.get ? (CONFIG.get('cms') || {}).mediaReference : {};
        return Object.assign({
            moduleName: 'media',
            apiVersion: 'v0',
            apiName: '/references/media/validate',
            preferLocal: true,
            requestTimeoutMs: 2000,
            maximumAttempts: 2,
            maximumReferencesPerComponent: 200,
            mediaTypes: ['IMAGE', 'VIDEO', 'DOCUMENT', 'FILE', 'MIXED'],
            roles: ['primary', 'background', 'thumbnail', 'icon', 'gallery', 'document', 'video', 'mobile', 'desktop'],
            localePattern: '^[A-Za-z]{2,3}(?:[-_][A-Za-z0-9]{2,8})*$'
        }, configured || {});
    },

    /** Creates a stable CMS contract error. */
    error: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = error.code || code;
        return error;
    }
};
