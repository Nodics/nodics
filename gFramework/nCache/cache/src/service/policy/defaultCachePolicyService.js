/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nCache/cache/service/policy/DefaultCachePolicyService
 * @description Centralizes router/API and DAO/schema cacheability decisions using layered properties while preserving legacy utility checks.
 * @layer service
 * @owner nCache/cache
 * @override Project modules may replace this policy service or override `cache.cacheability` properties to tune cache safety without changing Nodics core code.
 */

const _ = require('lodash');

module.exports = {
    /**
     * Returns effective layered cacheability policy options.
     *
     * @returns {Object} Effective cacheability policy.
     */
    getPolicyOptions: function () {
        let defaults = {
            enabled: true,
            maxPayloadBytes: 262144,
            allowSensitiveFields: false,
            skipEmptyResults: false,
            skipBinaryPayloads: true,
            logSkippedReason: true,
            handlerFailureMode: 'failClosed',
            policyHandlers: [],
            sensitiveFieldNames: ['password', 'token', 'accessToken', 'refreshToken', 'authorization', 'apiKey', 'secret', 'credential']
        };
        try {
            let cacheConfig = typeof CONFIG !== 'undefined' && CONFIG.get && CONFIG.get('cache') || {};
            let options = _.merge({}, defaults, cacheConfig.cacheability || {});
            if (cacheConfig.enabled === false) options.enabled = false;
            return options;
        } catch (error) {
            return defaults;
        }
    },

    /**
     * Decides whether a router/API response may be cached.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} responseSuccess Successful controller response envelope.
     * @returns {Object} Cacheability decision with reason and metadata.
     */
    isApiCacheable: function (request, responseSuccess) {
        let legacyAllowed = !UTILS || typeof UTILS.isApiCashable !== 'function' || UTILS.isApiCashable(responseSuccess && responseSuccess.result, request.router);
        return this.evaluateCacheability({
            layer: 'router',
            legacyAllowed: legacyAllowed,
            payload: responseSuccess,
            policyOwner: request.router,
            tenant: request.tenant,
            moduleName: request.moduleName,
            channelName: typeof SERVICE !== 'undefined' && SERVICE.DefaultCacheService && typeof SERVICE.DefaultCacheService.getRouterCacheChannel === 'function' ? SERVICE.DefaultCacheService.getRouterCacheChannel(request.router.routerName) : 'router'
        });
    },

    /**
     * Decides whether a DAO/schema read response may be cached.
     *
     * @param {Object} request Nodics model get request.
     * @param {Object} responseSuccess Successful model get response envelope.
     * @returns {Object} Cacheability decision with reason and metadata.
     */
    isItemCacheable: function (request, responseSuccess) {
        let legacyAllowed = !UTILS || typeof UTILS.isItemCashable !== 'function' || UTILS.isItemCashable(responseSuccess && responseSuccess.result, request.schemaModel);
        return this.evaluateCacheability({
            layer: 'schema',
            legacyAllowed: legacyAllowed,
            payload: responseSuccess,
            policyOwner: request.schemaModel,
            tenant: request.tenant,
            moduleName: request.schemaModel && request.schemaModel.moduleName,
            channelName: typeof SERVICE !== 'undefined' && SERVICE.DefaultCacheService && typeof SERVICE.DefaultCacheService.getSchemaCacheChannel === 'function' ? SERVICE.DefaultCacheService.getSchemaCacheChannel(request.schemaModel.schemaName) : 'schema'
        });
    },

    /**
     * Decides whether a search query response may be cached.
     *
     * @param {Object} request Nodics search request.
     * @param {Object} responseSuccess Successful search response envelope.
     * @returns {Object} Cacheability decision with reason and metadata.
     */
    isSearchCacheable: function (request, responseSuccess) {
        let searchModel = request.searchModel || {};
        let indexDef = searchModel.indexDef || {};
        let legacyAllowed = !!(indexDef.cache && indexDef.cache.enabled && responseSuccess && responseSuccess.result);
        return this.evaluateCacheability({
            layer: 'search',
            legacyAllowed: legacyAllowed,
            payload: responseSuccess,
            policyOwner: searchModel,
            tenant: request.tenant,
            moduleName: searchModel.moduleName || request.schemaModel && request.schemaModel.moduleName,
            channelName: typeof SERVICE !== 'undefined' && SERVICE.DefaultCacheService && typeof SERVICE.DefaultCacheService.getSearchCacheChannel === 'function' ? SERVICE.DefaultCacheService.getSearchCacheChannel(searchModel.indexName) : 'search'
        });
    },

    /**
     * Applies common cacheability policy to one payload.
     *
     * @param {Object} context Policy evaluation context.
     * @returns {Object} Cacheability decision.
     */
    evaluateCacheability: function (context) {
        let options = this.getPolicyOptions();
        if (options.enabled === false) return this.finalizeDecision(this.reject(context, 'cacheabilityDisabled'), context);
        if (context.legacyAllowed === false) return this.finalizeDecision(this.reject(context, 'legacyPolicyRejected'), context);
        if (options.skipBinaryPayloads !== false && this.hasBinaryPayload(context.payload)) return this.finalizeDecision(this.reject(context, 'binaryPayload'), context);
        if (options.skipEmptyResults === true && this.hasEmptyResult(context.payload)) return this.finalizeDecision(this.reject(context, 'emptyResult'), context);
        if (options.allowSensitiveFields !== true) {
            let sensitiveField = this.findSensitiveField(context.payload, options.sensitiveFieldNames || []);
            if (sensitiveField) return this.finalizeDecision(this.reject(context, 'sensitiveField', { sensitiveField: sensitiveField }), context);
        }
        let payloadBytes;
        try {
            payloadBytes = this.measurePayloadBytes(context.payload);
        } catch (error) {
            return this.finalizeDecision(this.reject(context, 'payloadNotSerializable'), context);
        }
        if (options.maxPayloadBytes !== undefined && options.maxPayloadBytes !== null && payloadBytes > options.maxPayloadBytes) {
            return this.finalizeDecision(this.reject(context, 'payloadTooLarge', { payloadBytes: payloadBytes, maxPayloadBytes: options.maxPayloadBytes }), context);
        }
        return this.finalizeDecision(this.applyPolicyHandlers(context, this.accept(context, { payloadBytes: payloadBytes }), options), context);
    },

    /**
     * Records the final cacheability decision through the shared cache diagnostics service.
     *
     * @param {Object} decision Cacheability decision.
     * @param {Object} context Policy evaluation context.
     * @returns {Object} Original decision.
     */
    finalizeDecision: function (decision, context) {
        if (typeof SERVICE !== 'undefined' && SERVICE.DefaultCacheService && typeof SERVICE.DefaultCacheService.recordPolicyDecision === 'function') {
            SERVICE.DefaultCacheService.recordPolicyDecision(decision, context);
        }
        return decision;
    },

    /**
     * Applies ordered, layered custom policy handlers after the core safety policy accepts a payload.
     *
     * @param {Object} context Policy evaluation context.
     * @param {Object} decision Current accepted decision.
     * @param {Object} options Effective policy options.
     * @returns {Object} Final cacheability decision.
     */
    applyPolicyHandlers: function (context, decision, options) {
        let handlers = this.getActivePolicyHandlers(options);
        for (let index = 0; index < handlers.length; index++) {
            let handler = handlers[index];
            try {
                let delegate = this.resolvePolicyHandler(handler);
                let handlerResult = delegate(context, decision, handler);
                decision = this.mergeHandlerDecision(context, decision, handlerResult, handler);
                if (decision.cacheable === false) return decision;
            } catch (error) {
                if ((options.handlerFailureMode || 'failClosed') === 'ignore') {
                    decision.handlerWarnings = (decision.handlerWarnings || []).concat({
                        handlerCode: this.getHandlerCode(handler),
                        errorMessage: error.message
                    });
                } else {
                    return this.reject(context, 'handlerError', {
                        handlerCode: this.getHandlerCode(handler),
                        errorMessage: error.message
                    });
                }
            }
        }
        return decision;
    },

    /**
     * Returns active policy handlers sorted by configured order.
     *
     * @param {Object} options Effective policy options.
     * @returns {Object[]} Active ordered handler definitions.
     */
    getActivePolicyHandlers: function (options) {
        return (options.policyHandlers || [])
            .filter(handler => handler && handler.active !== false && handler.enabled !== false)
            .sort((left, right) => (left.index || left.order || 0) - (right.index || right.order || 0));
    },

    /**
     * Resolves a configured service handler.
     *
     * @param {Object|string} handler Handler configuration or service.method string.
     * @returns {Function} Bound service method.
     */
    resolvePolicyHandler: function (handler) {
        let handlerPath = typeof handler === 'string' ? handler : handler.handler || handler.service;
        if (!handlerPath || typeof handlerPath !== 'string') throw new Error('Cache policy handler path is required');
        let parts = handlerPath.split('.');
        let serviceName = parts[0];
        let methodName = parts[1] || 'evaluate';
        if (!SERVICE || !SERVICE[serviceName] || typeof SERVICE[serviceName][methodName] !== 'function') {
            throw new Error('Cache policy handler not found: ' + handlerPath);
        }
        return SERVICE[serviceName][methodName].bind(SERVICE[serviceName]);
    },

    /**
     * Merges a handler decision into the current policy decision.
     *
     * @param {Object} context Policy evaluation context.
     * @param {Object} decision Current decision.
     * @param {Object} handlerResult Handler response.
     * @param {Object|string} handler Handler configuration.
     * @returns {Object} Merged policy decision.
     */
    mergeHandlerDecision: function (context, decision, handlerResult, handler) {
        if (!handlerResult) return decision;
        let merged = Object.assign({}, decision, handlerResult);
        merged.layer = merged.layer || context.layer;
        if (!merged.reason) merged.reason = merged.cacheable === false ? 'handlerRejected' : 'accepted';
        if (merged.cacheable === false && (!handlerResult.reason || handlerResult.reason === 'accepted')) {
            merged.reason = 'handlerRejected';
        }
        if (merged.cacheable === false && !handlerResult.reasonCode) {
            merged.reasonCode = this.getReasonCode(merged.reason);
        } else if (!merged.reasonCode) {
            merged.reasonCode = this.getReasonCode(merged.reason);
        }
        if (merged.cacheable === false && !merged.handlerCode) merged.handlerCode = this.getHandlerCode(handler);
        return merged;
    },

    /**
     * Returns a stable handler code for diagnostics.
     *
     * @param {Object|string} handler Handler configuration.
     * @returns {string} Handler code.
     */
    getHandlerCode: function (handler) {
        if (typeof handler === 'string') return handler;
        return handler.code || handler.name || handler.handler || handler.service || 'unknownCachePolicyHandler';
    },

    /**
     * Resolves a stable policy reason code.
     *
     * @param {string} reason Policy reason.
     * @returns {string} Stable reason code.
     */
    getReasonCode: function (reason) {
        let reasonStatusCodes = {
            accepted: 'RSN_CACHE_00000',
            cacheabilityDisabled: 'RSN_CACHE_00001',
            legacyPolicyRejected: 'RSN_CACHE_00002',
            binaryPayload: 'RSN_CACHE_00003',
            emptyResult: 'RSN_CACHE_00004',
            sensitiveField: 'RSN_CACHE_00005',
            payloadNotSerializable: 'RSN_CACHE_00006',
            payloadTooLarge: 'RSN_CACHE_00007',
            handlerRejected: 'RSN_CACHE_00008',
            handlerError: 'RSN_CACHE_00009',
            legacyPolicy: 'RSN_CACHE_00010'
        };
        return reasonStatusCodes[reason] || 'RSN_CACHE_99999';
    },

    /**
     * Builds an accepted cacheability decision.
     *
     * @param {Object} context Policy evaluation context.
     * @param {Object} metadata Additional decision metadata.
     * @returns {Object} Accepted decision.
     */
    accept: function (context, metadata) {
        return Object.assign({
            cacheable: true,
            layer: context.layer,
            reason: 'accepted',
            reasonCode: this.getReasonCode('accepted')
        }, metadata || {});
    },

    /**
     * Builds a rejected cacheability decision.
     *
     * @param {Object} context Policy evaluation context.
     * @param {string} reason Stable skip reason.
     * @param {Object} metadata Additional decision metadata.
     * @returns {Object} Rejected decision.
     */
    reject: function (context, reason, metadata) {
        return Object.assign({
            cacheable: false,
            layer: context.layer,
            reason: reason,
            reasonCode: this.getReasonCode(reason)
        }, metadata || {});
    },

    /**
     * Measures serialized payload size in UTF-8 bytes.
     *
     * @param {*} payload Payload to measure.
     * @returns {number} Payload byte count.
     */
    measurePayloadBytes: function (payload) {
        if (payload === undefined || payload === null) return 0;
        return Buffer.byteLength(JSON.stringify(payload), 'utf8');
    },

    /**
     * Detects empty result arrays in standard response envelopes.
     *
     * @param {*} payload Response payload.
     * @returns {boolean} True when payload contains an empty result array.
     */
    hasEmptyResult: function (payload) {
        return !!(payload && Array.isArray(payload.result) && payload.result.length === 0);
    },

    /**
     * Detects binary payload values that should not be cached by JSON/clone adapters.
     *
     * @param {*} payload Response payload.
     * @returns {boolean} True when binary data is present.
     */
    hasBinaryPayload: function (payload, visited) {
        if (!payload) return false;
        if (Buffer.isBuffer(payload) || payload instanceof ArrayBuffer) return true;
        if (ArrayBuffer.isView(payload)) return true;
        if (typeof payload !== 'object') return false;
        visited = visited || new WeakSet();
        if (visited.has(payload)) return false;
        visited.add(payload);
        if (Array.isArray(payload)) return payload.some(item => this.hasBinaryPayload(item, visited));
        if (typeof payload === 'object') return Object.keys(payload).some(key => this.hasBinaryPayload(payload[key], visited));
        return false;
    },

    /**
     * Finds the first sensitive field name in a payload.
     *
     * @param {*} payload Response payload.
     * @param {string[]} sensitiveFieldNames Field names to block.
     * @returns {string|null} Sensitive field name or null.
     */
    findSensitiveField: function (payload, sensitiveFieldNames, visited) {
        if (!payload || typeof payload !== 'object') return null;
        visited = visited || new WeakSet();
        if (visited.has(payload)) return null;
        visited.add(payload);
        let blocked = (sensitiveFieldNames || []).map(name => String(name).toLowerCase());
        if (Array.isArray(payload)) {
            for (let index = 0; index < payload.length; index++) {
                let nested = this.findSensitiveField(payload[index], sensitiveFieldNames, visited);
                if (nested) return nested;
            }
            return null;
        }
        let keys = Object.keys(payload);
        for (let index = 0; index < keys.length; index++) {
            let key = keys[index];
            if (blocked.includes(String(key).toLowerCase())) return key;
            let nested = this.findSensitiveField(payload[key], sensitiveFieldNames, visited);
            if (nested) return nested;
        }
        return null;
    }
};
