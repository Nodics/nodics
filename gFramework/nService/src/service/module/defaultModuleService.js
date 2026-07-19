/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const requestPromise = require('node-fetch');
const _ = require('lodash');
const http = require('http');
const https = require('https');

/**
 * @module service/module/DefaultModuleService
 * @description Builds and executes internal module-to-module and external HTTP
 * requests for Nodics. It normalizes authentication, API key, and enterprise
 * headers to the modern standard while preserving legacy header compatibility.
 * @layer service
 * @owner nService
 * @override Project modules may override this service to customize service
 * discovery, header policy, timeout handling, or fetch implementation while
 * preserving `buildRequest`, `buildExternalRequest`, and `fetch` contracts.
 *
 * @property {Object} SERVICE.DefaultRouterService Resolves module API URLs.
 * @property {Object} CLASSES.NodicsError Enriches remote-call errors with request context.
 */
module.exports = {
    _agents: null,
    _circuits: null,
    _diagnostics: null,
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        this.initializeTransport();
        if (SERVICE.DefaultRuntimeLifecycleService) {
            SERVICE.DefaultRuntimeLifecycleService.registerContributor('moduleHttpTransport', {
                order: 900,
                shutdown: () => this.closeTransport()
            });
        }
        return Promise.resolve(true);
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /** Returns the effective layered HTTP resilience policy. */
    getTransportConfiguration: function () {
        return _.merge({
            timeoutMs: 5000,
            retry: { maxAttempts: 2, baseDelayMs: 50, maxDelayMs: 1000, jitterRatio: 0.2, statuses: [], errorCodes: [] },
            circuitBreaker: { enabled: true, failureThreshold: 5, recoveryTimeoutMs: 30000 },
            connectionPool: { keepAlive: true, keepAliveMsecs: 1000, maxSockets: 128, maxFreeSockets: 16, timeoutMs: 60000 }
        }, CONFIG.get('serviceCommunication') || {});
    },

    /** Lazily creates shared agents, circuit state, and diagnostic counters. */
    initializeTransport: function () {
        let pool = this.getTransportConfiguration().connectionPool;
        let agentOptions = {
            keepAlive: pool.keepAlive !== false,
            keepAliveMsecs: pool.keepAliveMsecs,
            maxSockets: pool.maxSockets,
            maxFreeSockets: pool.maxFreeSockets,
            timeout: pool.timeoutMs
        };
        if (!this._agents) {
            this._agents = {
                http: new http.Agent(agentOptions),
                https: new https.Agent(agentOptions)
            };
        }
        this._circuits = this._circuits || new Map();
        this._diagnostics = this._diagnostics || {
            requests: 0, successes: 0, failures: 0, timeouts: 0, retries: 0, circuitRejected: 0,
            totalLatencyMs: 0, lastFailureAt: null
        };
        return this._agents;
    },

    /** Destroys all shared HTTP connection pools during runtime shutdown. */
    closeTransport: function () {
        if (this._agents) {
            this._agents.http.destroy();
            this._agents.https.destroy();
        }
        this._agents = null;
        return Promise.resolve(true);
    },

    /** Returns sanitized transport counters and per-target circuit state. */
    getTransportDiagnostics: function () {
        this.initializeTransport();
        let circuits = {};
        this._circuits.forEach((value, key) => {
            circuits[key] = { state: value.state, failures: value.failures, openedAt: value.openedAt || null };
        });
        return _.merge({}, this._diagnostics, {
            averageLatencyMs: this._diagnostics.requests ? Math.round(this._diagnostics.totalLatencyMs / this._diagnostics.requests) : 0,
            circuits: circuits
        });
    },

    /** Resolves the logical module or origin circuit partition for a request. */
    getCircuitKey: function (requestUrl) {
        let parsed = new URL(requestUrl.uri);
        return (requestUrl.nodicsContext && requestUrl.nodicsContext.moduleName) || parsed.origin;
    },

    /** Rejects open circuits or advances an expired circuit to half-open. */
    assertCircuitAvailable: function (key, policy) {
        if (policy.enabled === false) return;
        let circuit = this._circuits.get(key);
        if (!circuit || circuit.state === 'closed') return;
        if (Date.now() - circuit.openedAt >= policy.recoveryTimeoutMs) {
            circuit.state = 'half-open';
            return;
        }
        let error = new Error('Remote service circuit is open');
        error.code = 'EOPENBREAKER';
        this._diagnostics.circuitRejected++;
        throw error;
    },

    /** Closes and resets a target circuit after successful communication. */
    recordCircuitSuccess: function (key) {
        this._circuits.set(key, { state: 'closed', failures: 0, openedAt: null });
    },

    /** Records a terminal request failure and opens its circuit at threshold. */
    recordCircuitFailure: function (key, policy) {
        if (policy.enabled === false) return;
        let circuit = this._circuits.get(key) || { state: 'closed', failures: 0, openedAt: null };
        circuit.failures++;
        if (circuit.state === 'half-open' || circuit.failures >= policy.failureThreshold) {
            circuit.state = 'open';
            circuit.openedAt = Date.now();
        }
        this._circuits.set(key, circuit);
    },

    /** Determines whether retrying a request is safe or explicitly idempotent. */
    isRetrySafe: function (requestUrl) {
        let method = String(requestUrl.method || 'GET').toUpperCase();
        return ['GET', 'HEAD', 'OPTIONS'].includes(method) || Boolean(requestUrl.idempotencyKey ||
            (requestUrl.headers && (requestUrl.headers['Idempotency-Key'] || requestUrl.headers['idempotency-key'])));
    },

    /** Classifies configured transient statuses and network failures. */
    isRetryableError: function (error, retryPolicy) {
        return retryPolicy.statuses.includes(error.status) || retryPolicy.errorCodes.includes(error.code) || error.name === 'AbortError';
    },

    /** Waits for bounded exponential backoff with configured jitter. */
    delayRetry: function (attempt, retryPolicy) {
        let base = Math.min(retryPolicy.maxDelayMs, retryPolicy.baseDelayMs * Math.pow(2, attempt - 1));
        let jitter = base * retryPolicy.jitterRatio * ((Math.random() * 2) - 1);
        return new Promise(resolve => {
            let timer = setTimeout(resolve, Math.max(0, Math.round(base + jitter)));
            if (timer.unref) timer.unref();
        });
    },

    /**
     * Normalizes standard auth, API key, and enterprise headers.
     *
     * @param {Object} headers Input header map.
     * @returns {Object} Header map using `Authorization`, `x-api-key`, and `x-enterprise-code`.
     */
    normalizeHeaders: function (headers) {
        let normalizedHeaders = {};
        let authToken = headers.Authorization || headers.authorization || headers.authToken;
        let apiKey = headers['x-api-key'] || headers['X-API-Key'] || headers.apiKey;
        let entCode = headers['x-enterprise-code'] || headers['X-Enterprise-Code'] || headers.entCode;

        _.each(headers, (value, key) => {
            if (!['Authorization', 'authorization', 'authToken', 'x-api-key', 'X-API-Key', 'apiKey', 'x-enterprise-code', 'X-Enterprise-Code', 'entCode'].includes(key)) {
                normalizedHeaders[key] = value;
            }
        });
        if (authToken) {
            authToken = String(authToken);
            normalizedHeaders.Authorization = authToken.match(/^Bearer\s+/i) ? authToken : 'Bearer ' + authToken;
        }
        if (apiKey) {
            normalizedHeaders['x-api-key'] = apiKey;
        }
        if (entCode) {
            normalizedHeaders['x-enterprise-code'] = entCode;
        }
        return normalizedHeaders;
    },

    /**
     * Builds an internal module request URL and fetch options.
     *
     * @param {Object} options Module request options.
     * @param {string} options.moduleName Target module name.
     * @param {string} options.apiName API path.
     * @param {string} [options.methodName=GET] HTTP method.
     * @param {Object} [options.requestBody] Request body.
     * @param {Object} [options.header] Additional headers.
     * @returns {Object} Fetch request options with Nodics context metadata.
     */
    buildRequest: function (options) {
        this.LOG.debug('Building request url for module ', options.moduleName);
        let header = {
            'content-type': options.contentType || CONFIG.get('defaultContentType')
        };
        if (options.header) {
            _.merge(header, options.header);
        }
        header = this.normalizeHeaders(header);
        let url = SERVICE.DefaultRouterService.prepareUrl(options);
        if (!options.apiName.startsWith('/')) {
            url += '/';
        }
        let apiName = options.apiName || '';
        if (!apiName.startsWith('/')) apiName = '/' + apiName;
        url = url.replace(/\/+$/, '');
        return {
            method: options.methodName || 'GET',
            uri: url + '/' + (options.apiVersion || 'v0') + apiName,
            headers: header,
            body: options.requestBody || {},
            json: options.responseType || true,
            timeoutMs: options.timeoutMs,
            maxAttempts: options.maxAttempts,
            maxResponseBytes: options.maxResponseBytes,
            followRedirects: options.followRedirects,
            idempotencyKey: options.idempotencyKey,
            nodicsContext: {
                layer: 'remote-module',
                moduleName: options.moduleName,
                methodName: options.methodName || 'GET',
                apiName: options.apiName
            }
        };
    },

    /**
     * Builds an external HTTP request and fetch options.
     *
     * @param {Object} options External request options.
     * @param {string} options.uri Absolute target URI.
     * @param {string} [options.methodName=GET] HTTP method.
     * @param {Object} [options.params] Query parameters.
     * @param {Object} [options.requestBody] Request body.
     * @param {Object} [options.header] Additional headers.
     * @param {number} [options.maxResponseBytes] Maximum accepted response body size.
     * @param {boolean} [options.followRedirects=true] Whether HTTP redirects may be followed.
     * @returns {Object} Fetch request options with external context metadata.
     */
    buildExternalRequest: function (options) {
        this.LOG.debug('Building external request url');
        let header = {
            'content-type': options.contentType || CONFIG.get('defaultContentType')
        };
        if (options.header) {
            _.merge(header, options.header);
        }
        header = this.normalizeHeaders(header);
        let uri = options.uri;
        if (options.params && !UTILS.isBlank(options.params)) {
            uri = uri + '?';
            Object.keys(options.params).forEach(param => {
                if (!uri.endsWith('?')) {
                    uri = uri + '&';
                }
                uri = uri + param + '=' + options.params[param];
            });
        }
        return {
            method: options.methodName || 'GET',
            uri: uri,
            headers: header,
            body: options.requestBody || {},
            json: options.responseType || true,
            rejectUnauthorized: options.rejectUnauthorized !== false,
            timeoutMs: options.timeoutMs,
            maxAttempts: options.maxAttempts,
            maxResponseBytes: options.maxResponseBytes,
            followRedirects: options.followRedirects,
            idempotencyKey: options.idempotencyKey,
            nodicsContext: {
                layer: 'external-http',
                methodName: options.methodName || 'GET',
                uri: uri
            }
        };
    },

    /**
     * Builds clean error context for internal/external fetch failures.
     *
     * @param {Object} requestUrl Fetch request options.
     * @returns {Object} Sanitized Nodics error context.
     */
    buildFetchErrorContext: function (requestUrl) {
        let context = _.merge({}, requestUrl.nodicsContext || {});
        context.uri = requestUrl.uri;
        context.methodName = requestUrl.method;
        if (requestUrl.body) {
            context.tenant = requestUrl.body.tenant;
            context.sourceName = requestUrl.body.sourceName;
            context.target = requestUrl.body.target;
            context.eventName = requestUrl.body.event;
        }
        return CLASSES.NodicsError.cleanContext(context);
    },

    /**
     * Executes an internal or external HTTP request.
     *
     * @param {Object} requestUrl Fetch request options built by this service.
     * @returns {Promise<Object>} Fetch response body.
     * @throws {CLASSES.NodicsError} Rejects with enriched remote-call context.
     */
    fetch: async function (requestUrl) {
        this.LOG.debug('Hitting module communication URL', {
            methodName: requestUrl.method,
            uri: requestUrl.uri,
            layer: requestUrl.nodicsContext && requestUrl.nodicsContext.layer
        });
        this.initializeTransport();
        let policy = this.getTransportConfiguration();
        let circuitKey = this.getCircuitKey(requestUrl);
        let maxAttempts = Math.max(1, Number(requestUrl.maxAttempts || policy.retry.maxAttempts || 1));
        if (!this.isRetrySafe(requestUrl)) maxAttempts = 1;
        let startedAt = Date.now();
        this._diagnostics.requests++;
        try {
            this.assertCircuitAvailable(circuitKey, policy.circuitBreaker);
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                let controller = new AbortController();
                let timeoutMs = Number(requestUrl.timeoutMs || policy.timeoutMs);
                let timeout = setTimeout(() => controller.abort(), timeoutMs);
                if (timeout.unref) timeout.unref();
                let fetchOptions = {
                    method: requestUrl.method,
                    headers: requestUrl.headers,
                    signal: controller.signal,
                    size: requestUrl.maxResponseBytes,
                    redirect: requestUrl.followRedirects === false ? 'error' : 'follow'
                };
                if (!['GET', 'HEAD'].includes(String(requestUrl.method).toUpperCase()) && requestUrl.body !== undefined) {
                    fetchOptions.body = typeof requestUrl.body === 'string' ? requestUrl.body : JSON.stringify(requestUrl.body);
                }
                fetchOptions.agent = requestUrl.uri.startsWith('https://') ? this._agents.https : this._agents.http;
                try {
                    let response = await requestPromise(requestUrl.uri, fetchOptions);
                    if (!response.ok) {
                        let error = new Error('Remote module request failed with HTTP status ' + response.status);
                        error.status = response.status;
                        throw error;
                    }
                    let result = requestUrl.json === false ? await response.text() : await response.json();
                    clearTimeout(timeout);
                    this.recordCircuitSuccess(circuitKey);
                    this._diagnostics.successes++;
                    return result;
                } catch (error) {
                    clearTimeout(timeout);
                    if (error.name === 'AbortError') {
                        error.code = 'ETIMEDOUT';
                        this._diagnostics.timeouts++;
                    }
                    if (attempt < maxAttempts && this.isRetryableError(error, policy.retry)) {
                        this._diagnostics.retries++;
                        await this.delayRetry(attempt, policy.retry);
                        continue;
                    }
                    throw error;
                }
            }
        } catch (error) {
            this.recordCircuitFailure(circuitKey, policy.circuitBreaker);
            this._diagnostics.failures++;
            this._diagnostics.lastFailureAt = new Date().toISOString();
            throw CLASSES.NodicsError.enrich(error, this.buildFetchErrorContext(requestUrl));
        } finally {
            this._diagnostics.totalLatencyMs += Date.now() - startedAt;
        }
    }
};
