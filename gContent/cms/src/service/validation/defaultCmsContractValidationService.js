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

    /** Returns the effective layered renderer policy. */
    rendererPolicy: function () {
        let configured = typeof CONFIG !== 'undefined' && CONFIG.get ? (CONFIG.get('cms') || {}).renderer : {};
        return Object.assign({
            keyPattern: '^[a-z][a-z0-9]*(\\.[a-z][a-z0-9-]*)+$',
            prohibitedSchemes: ['http:', 'https:', 'javascript:', 'data:', 'file:']
        }, configured || {});
    },

    /** Creates a stable CMS contract error. */
    error: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = error.code || code;
        return error;
    }
};
