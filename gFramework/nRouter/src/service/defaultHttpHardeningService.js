/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nRouter/service/DefaultHttpHardeningService
 * @description Applies topology-aware HTTP hardening to Express applications using
 * layered Nodics configuration for proxy trust, security headers, CORS, rate
 * limits, and body parser limits.
 * @layer service
 * @owner nRouter
 * @override Project, environment, server, or node modules may override this
 * service or the `httpHardening` property tree to align HTTP behavior with
 * deployment topology without changing framework source.
 *
 * @property {Object} requestCounters In-memory per-process rate-limit counters.
 */
module.exports = {

    /**
     * In-memory request counters used by the default rate limiter.
     *
     * @type {Object}
     */
    requestCounters: {},

    /**
     * Initializes the HTTP hardening service.
     *
     * @param {Object} options Nodics initialization options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Finalizes the HTTP hardening service.
     *
     * @param {Object} options Nodics initialization options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Returns effective HTTP hardening configuration.
     *
     * @returns {Object} Effective HTTP hardening policy.
     */
    getPolicy: function () {
        return CONFIG.get('httpHardening') || {};
    },

    /**
     * Applies Express app-level properties such as proxy trust.
     *
     * @param {Object} app Express app instance.
     * @returns {void}
     * @sideEffects Updates Express app settings.
     */
    applyAppProperties: function (app) {
        let policy = this.getPolicy();
        if (!policy.enabled) {
            return;
        }
        if (typeof app.set === 'function' && Object.prototype.hasOwnProperty.call(policy, 'trustProxy')) {
            app.set('trust proxy', policy.trustProxy);
        }
    },

    /**
     * Applies hardening middleware in front of body parsing and route handling.
     *
     * @param {Object} app Express app instance.
     * @returns {void}
     * @sideEffects Registers security header, CORS, and rate-limit middleware.
     */
    applyHttpMiddleware: function (app) {
        let policy = this.getPolicy();
        if (!policy.enabled || typeof app.use !== 'function') {
            return;
        }
        app.use((req, res, next) => {
            this.applySecurityHeaders(req, res, policy.securityHeaders);
            if (this.applyCors(req, res, policy.cors)) {
                return;
            }
            if (!this.applyRateLimit(req, res, policy.rateLimit)) {
                return;
            }
            next();
        });
    },

    /**
     * Applies configured security response headers.
     *
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {Object} securityHeaders Security header policy.
     * @returns {void}
     * @sideEffects Mutates response headers.
     */
    applySecurityHeaders: function (req, res, securityHeaders) {
        if (!securityHeaders || !securityHeaders.enabled || !securityHeaders.headers || typeof res.setHeader !== 'function') {
            return;
        }
        Object.keys(securityHeaders.headers).forEach(headerName => {
            let value = securityHeaders.headers[headerName];
            if (value !== undefined && value !== null && value !== false) {
                res.setHeader(headerName, String(value));
            }
        });
    },

    /**
     * Applies CORS policy and completes preflight requests when configured.
     *
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {Object} cors CORS policy.
     * @returns {boolean} True when the request was completed as CORS preflight.
     */
    applyCors: function (req, res, cors) {
        if (!cors || !cors.enabled || typeof res.setHeader !== 'function') {
            return false;
        }
        let requestOrigin = req.headers && req.headers.origin;
        let allowedOrigin = this.resolveAllowedOrigin(requestOrigin, cors);
        if (allowedOrigin) {
            res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
            if (cors.allowCredentials) {
                res.setHeader('Access-Control-Allow-Credentials', 'true');
            }
            this.setHeaderFromList(res, 'Access-Control-Allow-Methods', cors.allowedMethods);
            this.setHeaderFromList(res, 'Access-Control-Allow-Headers', cors.allowedHeaders);
            this.setHeaderFromList(res, 'Access-Control-Expose-Headers', cors.exposedHeaders);
            if (cors.maxAge !== undefined && cors.maxAge !== null) {
                res.setHeader('Access-Control-Max-Age', String(cors.maxAge));
            }
        }
        if (String(req.method || '').toUpperCase() === 'OPTIONS') {
            res.statusCode = allowedOrigin ? 204 : 403;
            if (typeof res.end === 'function') {
                res.end();
            }
            return true;
        }
        return false;
    },

    /**
     * Resolves the response origin value for a CORS request.
     *
     * @param {string} requestOrigin Incoming request origin.
     * @param {Object} cors CORS policy.
     * @returns {string|undefined} Allowed origin header value.
     */
    resolveAllowedOrigin: function (requestOrigin, cors) {
        let allowedOrigins = cors.allowedOrigins || [];
        if (!requestOrigin || allowedOrigins.length === 0) {
            return undefined;
        }
        if (allowedOrigins.indexOf('*') >= 0) {
            return cors.allowCredentials ? requestOrigin : '*';
        }
        return allowedOrigins.indexOf(requestOrigin) >= 0 ? requestOrigin : undefined;
    },

    /**
     * Applies a list-valued response header.
     *
     * @param {Object} res Express response.
     * @param {string} headerName Header name.
     * @param {Array<string>} values Header values.
     * @returns {void}
     */
    setHeaderFromList: function (res, headerName, values) {
        if (values && values.length > 0) {
            res.setHeader(headerName, values.join(', '));
        }
    },

    /**
     * Applies a simple in-memory rate limit for the current process.
     *
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {Object} rateLimit Rate-limit policy.
     * @returns {boolean} True when the request may continue.
     * @sideEffects Updates in-memory request counters and may write a 429 response.
     */
    applyRateLimit: function (req, res, rateLimit) {
        if (!rateLimit || !rateLimit.enabled) {
            return true;
        }
        if (rateLimit.skipOptions && String(req.method || '').toUpperCase() === 'OPTIONS') {
            return true;
        }
        let now = Date.now();
        let windowMs = Number(rateLimit.windowMs || 60000);
        let max = Number(rateLimit.max || 0);
        if (max <= 0) {
            return true;
        }
        let key = this.getRateLimitKey(req, rateLimit);
        let counter = this.requestCounters[key];
        if (!counter || counter.resetAt <= now) {
            counter = {
                count: 0,
                resetAt: now + windowMs
            };
            this.requestCounters[key] = counter;
        }
        counter.count += 1;
        if (typeof res.setHeader === 'function') {
            res.setHeader('X-RateLimit-Limit', String(max));
            res.setHeader('X-RateLimit-Remaining', String(Math.max(max - counter.count, 0)));
            res.setHeader('X-RateLimit-Reset', String(Math.ceil(counter.resetAt / 1000)));
        }
        if (counter.count > max) {
            res.statusCode = 429;
            if (typeof res.json === 'function') {
                res.json({
                    code: 'ERR_RTR_00004',
                    responseCode: '429',
                    message: 'HTTP rate limit exceeded'
                });
            } else if (typeof res.end === 'function') {
                res.end('HTTP rate limit exceeded');
            }
            return false;
        }
        return true;
    },

    /**
     * Resolves the rate-limit key from headers or request connection metadata.
     *
     * @param {Object} req Express request.
     * @param {Object} rateLimit Rate-limit policy.
     * @returns {string} Rate-limit key.
     */
    getRateLimitKey: function (req, rateLimit) {
        let headers = req.headers || {};
        let keyHeaders = rateLimit.keyHeaders || [];
        for (let index = 0; index < keyHeaders.length; index++) {
            let value = headers[String(keyHeaders[index]).toLowerCase()];
            if (value) {
                return String(value).split(',')[0].trim();
            }
        }
        return req.ip || (req.connection && req.connection.remoteAddress) || 'unknown';
    },

    /**
     * Returns URL-encoded parser options from HTTP hardening configuration.
     *
     * @returns {Object} URL-encoded parser options.
     */
    getUrlencodedParserOptions: function () {
        let policy = this.getPolicy();
        return (policy.body && policy.body.urlencoded) || { extended: true };
    },

    /**
     * Returns JSON parser options from HTTP hardening configuration.
     *
     * @returns {Object} JSON parser options.
     */
    getJsonParserOptions: function () {
        let policy = this.getPolicy();
        return (policy.body && policy.body.json) || {};
    },

    /**
     * Returns text parser options from HTTP hardening configuration.
     *
     * @returns {Object} Text parser options.
     */
    getTextParserOptions: function () {
        let policy = this.getPolicy();
        return (policy.body && policy.body.text) || {};
    }
};
