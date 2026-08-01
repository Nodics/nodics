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

    /** Validates template slot authoring rules without duplicating component type authority. */
    validateSlotDefinition: async function (request) {
        let model = request.model || {};
        if (model.minItems !== undefined && (!Number.isInteger(Number(model.minItems)) || Number(model.minItems) < 0)) {
            throw this.error('ERR_CMS_00095', 'CMS slot minItems must be a non-negative integer');
        }
        if (model.maxItems !== undefined && (!Number.isInteger(Number(model.maxItems)) || Number(model.maxItems) < 0)) {
            throw this.error('ERR_CMS_00095', 'CMS slot maxItems must be a non-negative integer');
        }
        if (model.minItems !== undefined && model.maxItems !== undefined && Number(model.maxItems) < Number(model.minItems)) {
            throw this.error('ERR_CMS_00095', 'CMS slot maxItems must be greater than or equal to minItems');
        }
        ['allowedComponentTypes', 'allowedComponentTypeGroups'].forEach(property => {
            if (model[property] !== undefined && !Array.isArray(model[property])) {
                throw this.error('ERR_CMS_00095', 'CMS slot allowlists must be arrays');
            }
        });
        if (model.template) await this.validateReference(request, 'DefaultCmsPageTemplateService', { code: model.template, active: true }, 'ERR_CMS_00095', 'CMS slot template is unavailable', true);
        return true;
    },

    /** Validates navigation targets, URL safety, and parent tree cycles. */
    validateNavigationNode: async function (request) {
        let model = request.model || {};
        let nodeType = model.nodeType || 'PAGE';
        if (!['PAGE', 'ROUTE', 'EXTERNAL', 'CONTAINER'].includes(nodeType)) {
            throw this.error('ERR_CMS_00096', 'CMS navigation node type is invalid');
        }
        if (model.parent && model.code && model.parent === model.code) {
            throw this.error('ERR_CMS_00096', 'CMS navigation node cannot be its own parent');
        }
        if (nodeType === 'PAGE') await this.validateReference(request, 'DefaultCmsPageService', { code: model.targetPage, active: true }, 'ERR_CMS_00096', 'CMS navigation target page is unavailable');
        if (nodeType === 'ROUTE') await this.validateReference(request, 'DefaultCmsPageRouteService', { code: model.targetRoute, active: true }, 'ERR_CMS_00096', 'CMS navigation target route is unavailable');
        if (nodeType === 'EXTERNAL' && !this.safeExternalUrl(model.externalUrl)) {
            throw this.error('ERR_CMS_00096', 'CMS navigation external URL is unsafe');
        }
        if (nodeType === 'CONTAINER' && (model.targetPage || model.targetRoute || model.externalUrl)) {
            throw this.error('ERR_CMS_00096', 'CMS navigation container nodes must not declare a target');
        }
        if (model.parent) await this.validateNavigationCycle(request, model);
        return true;
    },

    /** Validates declarative restriction type contracts. */
    validateRestrictionType: function (request) {
        let model = request.model || {};
        let allowedTargets = this.restrictionPolicy().targetTypes;
        if (model.targetTypes !== undefined && (!Array.isArray(model.targetTypes) || model.targetTypes.some(target => !allowedTargets.includes(target)))) {
            throw this.error('ERR_CMS_00097', 'CMS restriction type targetTypes are invalid');
        }
        if (model.propertySchema !== undefined && (!model.propertySchema || typeof model.propertySchema !== 'object' || Array.isArray(model.propertySchema))) {
            throw this.error('ERR_CMS_00097', 'CMS restriction type propertySchema must be a declarative object');
        }
        if (model.evaluator !== undefined && !this.safeLogicalKey(model.evaluator)) {
            throw this.error('ERR_CMS_00097', 'CMS restriction evaluator must be a logical backend key');
        }
        return Promise.resolve(true);
    },

    /** Validates restriction assignment targets and declarative property values. */
    validateRestriction: async function (request) {
        let model = request.model || {};
        let allowedTargets = this.restrictionPolicy().targetTypes;
        if (model.targetType && !allowedTargets.includes(model.targetType)) {
            throw this.error('ERR_CMS_00098', 'CMS restriction targetType is invalid');
        }
        if (model.mode && !['INCLUDE', 'EXCLUDE'].includes(model.mode)) {
            throw this.error('ERR_CMS_00098', 'CMS restriction mode is invalid');
        }
        if (model.properties !== undefined && (!model.properties || typeof model.properties !== 'object' || Array.isArray(model.properties))) {
            throw this.error('ERR_CMS_00098', 'CMS restriction properties must be declarative object values');
        }
        if (model.restrictionType) await this.validateReference(request, 'DefaultCmsRestrictionTypeService', { code: model.restrictionType, active: true }, 'ERR_CMS_00098', 'CMS restriction type is unavailable');
        if (model.targetType && model.targetCode) {
            await this.validateReference(request, this.restrictionTargetService(model.targetType), { code: model.targetCode, active: true }, 'ERR_CMS_00098', 'CMS restriction target is unavailable', true);
        }
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

    /** Validates a generated-service reference when the service is present. */
    validateReference: async function (request, serviceName, query, code, message, optionalWhenServiceMissing) {
        let service = serviceName && typeof SERVICE !== 'undefined' && SERVICE ? SERVICE[serviceName] : null;
        if (!service || typeof service.get !== 'function') {
            if (optionalWhenServiceMissing) return true;
            throw this.error(code, message);
        }
        if (!query || Object.keys(query).some(key => query[key] === undefined || query[key] === null || query[key] === '')) {
            throw this.error(code, message);
        }
        let response = await service.get({
            tenant: request.tenant,
            authData: request.authData,
            options: Object.assign({}, request.options || {}, { recursive: false }),
            query: query,
            searchOptions: { limit: 2 }
        });
        if (this.items(response).length !== 1) throw this.error(code, message);
        return true;
    },

    /** Follows navigation parents to reject cycles when the navigation service is available. */
    validateNavigationCycle: async function (request, model) {
        let service = typeof SERVICE !== 'undefined' && SERVICE ? SERVICE.DefaultCmsNavigationNodeService : null;
        if (!service || typeof service.get !== 'function' || !model.code) return true;
        let seen = new Set([model.code]);
        let parent = model.parent;
        let depth = 0;
        let maxDepth = Number(this.navigationPolicy().maxParentDepth || 50);
        while (parent) {
            if (seen.has(parent)) throw this.error('ERR_CMS_00096', 'CMS navigation node parent cycle is invalid');
            seen.add(parent);
            if (++depth > maxDepth) throw this.error('ERR_CMS_00096', 'CMS navigation tree exceeds configured parent depth');
            let response = await service.get({
                tenant: request.tenant,
                authData: request.authData,
                options: Object.assign({}, request.options || {}, { recursive: false }),
                query: { code: parent, active: true },
                searchOptions: { limit: 2 }
            });
            let next = this.items(response)[0];
            parent = next && next.parent;
        }
        return true;
    },

    /** Returns whether a value is a safe logical backend key. */
    safeLogicalKey: function (value) {
        return typeof value === 'string' && new RegExp(this.rendererPolicy().keyPattern).test(value) &&
            !this.rendererPolicy().prohibitedSchemes.some(scheme => value.toLowerCase().startsWith(scheme));
    },

    /** Returns whether an external URL is permitted for navigation authoring. */
    safeExternalUrl: function (value) {
        if (typeof value !== 'string') return false;
        try {
            let parsed = new URL(value);
            return ['https:', 'http:'].includes(parsed.protocol) && !!parsed.hostname;
        } catch (error) {
            return false;
        }
    },

    /** Maps restriction target types to generated CMS services. */
    restrictionTargetService: function (targetType) {
        return {
            PAGE: 'DefaultCmsPageService',
            COMPONENT: 'DefaultCmsComponentService',
            SLOT: 'DefaultCmsSlotDefinitionService',
            NAVIGATION: 'DefaultCmsNavigationNodeService',
            ROUTE: 'DefaultCmsPageRouteService'
        }[targetType];
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

    /** Returns effective layered CMS navigation policy. */
    navigationPolicy: function () {
        let configured = typeof CONFIG !== 'undefined' && CONFIG.get ? (CONFIG.get('cms') || {}).navigation : {};
        return Object.assign({ maxParentDepth: 50 }, configured || {});
    },

    /** Returns effective layered CMS restriction policy. */
    restrictionPolicy: function () {
        let configured = typeof CONFIG !== 'undefined' && CONFIG.get ? (CONFIG.get('cms') || {}).restrictions : {};
        return Object.assign({
            targetTypes: ['PAGE', 'COMPONENT', 'SLOT', 'NAVIGATION', 'ROUTE']
        }, configured || {});
    },

    /** Creates a stable CMS contract error. */
    error: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = error.code || code;
        return error;
    }
};
