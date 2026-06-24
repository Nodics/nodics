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
            sensitiveFieldNames: ['password', 'token', 'accessToken', 'refreshToken', 'authorization', 'apiKey', 'secret', 'credential']
        };
        try {
            let cacheConfig = typeof CONFIG !== 'undefined' && CONFIG.get && CONFIG.get('cache') || {};
            return _.merge({}, defaults, cacheConfig.cacheability || {});
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
            policyOwner: request.router
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
            policyOwner: request.schemaModel
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
        if (options.enabled === false) return this.reject(context, 'cacheabilityDisabled');
        if (context.legacyAllowed === false) return this.reject(context, 'legacyPolicyRejected');
        if (options.skipBinaryPayloads !== false && this.hasBinaryPayload(context.payload)) return this.reject(context, 'binaryPayload');
        if (options.skipEmptyResults === true && this.hasEmptyResult(context.payload)) return this.reject(context, 'emptyResult');
        if (options.allowSensitiveFields !== true) {
            let sensitiveField = this.findSensitiveField(context.payload, options.sensitiveFieldNames || []);
            if (sensitiveField) return this.reject(context, 'sensitiveField', { sensitiveField: sensitiveField });
        }
        let payloadBytes;
        try {
            payloadBytes = this.measurePayloadBytes(context.payload);
        } catch (error) {
            return this.reject(context, 'payloadNotSerializable');
        }
        if (options.maxPayloadBytes !== undefined && options.maxPayloadBytes !== null && payloadBytes > options.maxPayloadBytes) {
            return this.reject(context, 'payloadTooLarge', { payloadBytes: payloadBytes, maxPayloadBytes: options.maxPayloadBytes });
        }
        return this.accept(context, { payloadBytes: payloadBytes });
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
            reason: 'accepted'
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
            reason: reason
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
