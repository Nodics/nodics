/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const requestPromise = require('node-fetch');
const _ = require('lodash');
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
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
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
    fetch: function (requestUrl) {
        this.LOG.debug('Hitting module communication URL', {
            methodName: requestUrl.method,
            uri: requestUrl.uri,
            layer: requestUrl.nodicsContext && requestUrl.nodicsContext.layer
        });
        return new Promise((resolve, reject) => {
            try {
                let fetchOptions = {
                    method: requestUrl.method,
                    headers: requestUrl.headers
                };
                if (!['GET', 'HEAD'].includes(String(requestUrl.method).toUpperCase()) && requestUrl.body !== undefined) {
                    fetchOptions.body = typeof requestUrl.body === 'string' ? requestUrl.body : JSON.stringify(requestUrl.body);
                }
                if (requestUrl.uri.startsWith('https://')) {
                    fetchOptions.agent = new https.Agent({ rejectUnauthorized: requestUrl.rejectUnauthorized !== false });
                }
                requestPromise(requestUrl.uri, fetchOptions).then(async response => {
                    if (!response.ok) {
                        let responseBody = await response.text();
                        let error = new Error('Remote module request failed with HTTP status ' + response.status +
                            (responseBody ? ': ' + responseBody.substring(0, 1000) : ''));
                        error.status = response.status;
                        throw error;
                    }
                    return requestUrl.json === false ? response.text() : response.json();
                }).then(response => {
                    resolve(response);
                }).catch(error => {
                    reject(CLASSES.NodicsError.enrich(error, this.buildFetchErrorContext(requestUrl)));
                });
            } catch (error) {
                reject(CLASSES.NodicsError.enrich(error, this.buildFetchErrorContext(requestUrl)));
            }
        });
    }
};
