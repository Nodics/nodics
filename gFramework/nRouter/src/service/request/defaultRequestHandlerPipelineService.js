/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module router/service/request/DefaultRequestHandlerPipelineService
 * @description Shared request pipeline service that normalizes authentication headers,
 * handles help and special requests, chooses secured versus non-secured flow, performs
 * API cache lookup, and dispatches requests to generated or custom controllers.
 * @layer pipeline
 * @owner nRouter
 * @override Project modules may override this service or specific pipeline definitions
 * in a later-loaded module to change request governance without changing Nodics core code.
 *
 * @property {Object} CLASSES.NodicsError Standard Nodics error class used for request failures.
 * @property {Object} CONFIG Runtime configuration registry used for default tenant fallback.
 * @property {Object} CONTROLLER Dynamic controller registry populated from active module hierarchy.
 * @property {Object} SERVICE.DefaultCacheConfigurationService Builds cache keys for API requests.
 * @property {Object} SERVICE.DefaultCacheService Reads and writes API response cache entries.
 * @property {Object} request.auth Normalized authentication contract produced by `parseHeader`.
 * @property {string} request.entCode Enterprise code resolved from modern or legacy headers.
 * @property {string} request.tenant Tenant resolved by secured/non-secured downstream pipelines.
 * @property {Object} response.targetNode Pipeline branch selected by `redirectRequest`.
 */
module.exports = {
    /**
     * Initializes the request handler pipeline service during service loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the request handler pipeline service after service loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Blocks route categories that are not exposed for the active runtime.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.router Effective route definition selected from active modules.
     * @param {Object} response Nodics response context.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     * @throws Emits `ERR_AUTH_00003` when the route category is disabled.
     */
    validateApiExposure: function (request, response, process) {
        let category = this.getApiExposureCategory(request.router || {});
        if (!category || this.isApiExposureEnabled(category)) {
            process.nextSuccess(request, response);
            return;
        }
        process.error(request, response, new CLASSES.NodicsError('ERR_AUTH_00003', 'API category is disabled for this runtime: ' + category));
    },

    /**
     * Resolves the route exposure category from route metadata.
     *
     * @param {Object} router Effective route definition.
     * @returns {string|undefined} Exposure category.
     */
    getApiExposureCategory: function (router) {
        if (!router || !router.apiExposure) {
            return undefined;
        }
        if (_.isString(router.apiExposure)) {
            return router.apiExposure;
        }
        return router.apiExposure.category;
    },

    /**
     * Checks whether an API exposure category is enabled for the active runtime.
     *
     * @param {string} category Exposure category.
     * @returns {boolean} True when the category is exposed.
     */
    isApiExposureEnabled: function (category) {
        let exposure = CONFIG.get('apiExposure') || {};
        let defaultConfig = exposure.default || {};
        let categoryConfig = exposure.categories && exposure.categories[category] || {};
        if (Object.prototype.hasOwnProperty.call(categoryConfig, 'enabled')) {
            return categoryConfig.enabled !== false;
        }
        if (Object.prototype.hasOwnProperty.call(defaultConfig, 'enabled')) {
            return defaultConfig.enabled !== false;
        }
        return true;
    },

    /**
     * Stops normal execution and returns configured router help when the caller appends `?help`.
     *
     * @param {Object} request Nodics request context.
     * @param {string} request.originalUrl Original Express URL.
     * @param {Object} request.router Effective router definition selected from active modules.
     * @param {Object} response Nodics response context mutated with help success payload.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     * @sideEffects May write `response.success` and stop the pipeline.
     * @throws Emits `ERR_HLP_00000` through the pipeline when help metadata is not available.
     */
    helpRequest: function (request, response, process) {
        if (request.originalUrl.endsWith('?help')) {
            if (request.router.help) {
                response.success = {
                    code: 'SUC_HLP_00000',
                    result: request.router.help
                };
                process.stop(request, response);
            } else {
                process.error(request, response, new CLASSES.NodicsError('ERR_HLP_00000'));
            }
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Returns the first available request header value from a preferred-name list.
     *
     * @param {Object} httpRequest Express request wrapper.
     * @param {string[]} names Header names in lookup priority order.
     * @returns {string|undefined} First available header value.
     */
    getHeaderValue: function (httpRequest, names) {
        let value;
        _.each(names, name => {
            if (!value) {
                value = httpRequest.get(name);
            }
        });
        return value;
    },

    /**
     * Extracts a bearer token from a standard Authorization header.
     *
     * @param {string} authorization Raw Authorization header value.
     * @returns {string|null} Token value without the Bearer prefix, or null when absent.
     */
    getBearerToken: function (authorization) {
        if (UTILS.isBlank(authorization)) {
            return null;
        }
        let bearerParts = authorization.match(/^Bearer\s+(.+)$/i);
        return bearerParts ? bearerParts[1].trim() : null;
    },

    /**
     * Normalizes modern and legacy authentication headers into one request auth contract.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.httpRequest Express request wrapper.
     * @returns {Object} Normalized auth metadata.
     * @returns {string|null} returns.type Credential type when exactly one credential is supplied.
     * @returns {string|null} returns.credential Credential value when exactly one credential is supplied.
     * @returns {Object[]} returns.credentials All supplied API key and bearer credentials.
     * @returns {string|undefined} returns.entCode Enterprise code from modern or legacy headers.
     * @returns {string[]} returns.legacyHeaders Deprecated headers used by the caller.
     * @override Projects may override this method to add enterprise-specific credential types.
     */
    normalizeAuthHeaders: function (request) {
        let authorizationHeader = this.getHeaderValue(request.httpRequest, ['Authorization']);
        let modernAuthToken = this.getBearerToken(authorizationHeader);
        let legacyAuthToken = this.getHeaderValue(request.httpRequest, ['authToken']);
        let modernApiKey = this.getHeaderValue(request.httpRequest, ['x-api-key', 'X-API-Key']);
        let legacyApiKey = this.getHeaderValue(request.httpRequest, ['apiKey']);
        let modernEntCode = this.getHeaderValue(request.httpRequest, ['x-enterprise-code', 'X-Enterprise-Code']);
        let legacyEntCode = this.getHeaderValue(request.httpRequest, ['entCode']);
        let authToken = modernAuthToken || legacyAuthToken;
        let apiKey = modernApiKey || legacyApiKey;
        let entCode = modernEntCode || legacyEntCode;
        let credentials = [];
        let legacyHeaders = [];

        if (apiKey) {
            credentials.push({
                type: 'apiKey',
                credential: apiKey,
                source: modernApiKey ? 'x-api-key' : 'apiKey'
            });
        }
        if (authToken) {
            credentials.push({
                type: 'bearer',
                credential: authToken,
                source: modernAuthToken ? 'Authorization' : 'authToken'
            });
        }
        if (legacyApiKey) {
            legacyHeaders.push('apiKey');
        }
        if (legacyAuthToken) {
            legacyHeaders.push('authToken');
        }
        if (legacyEntCode) {
            legacyHeaders.push('entCode');
        }

        return {
            type: credentials.length === 1 ? credentials[0].type : null,
            credential: credentials.length === 1 ? credentials[0].credential : null,
            credentials: credentials,
            entCode: entCode,
            source: credentials.length === 1 ? credentials[0].source : null,
            legacyHeaders: legacyHeaders,
            deprecated: legacyHeaders.length > 0
        };
    },

    /**
     * Parses authentication and enterprise headers and writes normalized fields to the request.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.httpRequest Express request wrapper.
     * @param {Object} response Nodics response context.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     * @sideEffects Writes `request.auth`, `request.apiKey`, `request.authToken`, and `request.entCode`.
     * @throws Emits `ERR_AUTH_00002` through the pipeline when neither credentials nor enterprise code are supplied.
     */
    parseHeader: function (request, response, process) {
        this.LOG.debug('Parsing request header for : ' + request.originalUrl);
        request.auth = this.normalizeAuthHeaders(request);
        if (request.auth.deprecated) {
            this.LOG.warn('Deprecated auth header(s) used: ' + request.auth.legacyHeaders.join(', '));
        }
        if (request.auth.type === 'apiKey') {
            request.apiKey = request.auth.credential;
        }
        if (request.auth.type === 'bearer') {
            request.authToken = request.auth.credential;
        }
        if (request.auth.entCode) {
            request.entCode = request.auth.entCode;
        }
        if (!request.auth.credentials.length && !request.auth.entCode) {
            process.error(request, response, new CLASSES.NodicsError('ERR_AUTH_00002'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Placeholder body parsing pipeline step.
     *
     * Body parsing is normally handled by configured Express body parser handlers. This
     * method remains as an override point for modules that need request-context body
     * enrichment before controller dispatch.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} response Nodics response context.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     * @override Project modules may override this operation for product-specific body normalization.
     */
    parseBody: function (request, response, process) {
        process.nextSuccess(request, response);
    },

    /**
     * Executes special routes directly against the configured handler operation.
     *
     * @param {Object} request Nodics request context.
     * @param {boolean} request.special Indicates whether the selected router is a special route.
     * @param {Object} request.router Effective router definition with handler and operation.
     * @param {Object} response Nodics response context.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     * @sideEffects Sets default tenant before invoking special handlers when tenant is not already resolved.
     * @throws Propagates controller errors through the pipeline.
     */
    handleSpecialRequest: function (request, response, process) {
        if (request.special) {
            this.LOG.debug('Handling special request : ' + request.originalUrl);
            if (!request.tenant) {
                request.tenant = CONFIG.get('defaultTenant') || 'default';
            }
            try {
                CONTROLLER[request.router.handler][request.router.operation](request, (error, success) => {
                    if (error) {
                        process.error(request, response, error);
                    } else {
                        process.stop(request, response, success);
                    }
                });
            } catch (error) {
                process.error(request, response, error);
            }
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Selects the next pipeline node for secured or non-secured request handling.
     *
     * @param {Object} request Nodics request context.
     * @param {boolean} request.secured Indicates whether route security is enabled.
     * @param {Object} response Nodics response context mutated with the next target node.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     * @sideEffects Writes `response.targetNode` with `securedRequest` or `nonSecureRequest`.
     */
    redirectRequest: function (request, response, process) {
        this.LOG.debug('Redirecting secured/non-secured request  : ' + request.originalUrl);
        if (request.secured) {
            this.LOG.debug('Handling secured request');
            response.targetNode = 'securedRequest';
        } else {
            this.LOG.debug('Handling non-secured request');
            response.targetNode = 'nonSecureRequest';
        }
        process.nextSuccess(request, response);
    },

    /**
     * Checks the API cache before dispatching the request to the controller.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.router Effective router definition, including cache settings.
     * @param {Object} request.httpRequest Express request wrapper used to build cache key.
     * @param {Object} response Nodics response context.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     * @sideEffects Writes `request.apiCacheKeyHash` and may stop the pipeline with cached data.
     * @throws Propagates non-cache-miss cache errors through the pipeline.
     */
    lookupCache: function (request, response, process) {
        let _self = this;
        this.LOG.debug('Looking up result in cache system  : ' + request.originalUrl);
        try {
            let keyHash = UTILS.generateHash(SERVICE.DefaultCacheConfigurationService.createApiKey(request));
            request.apiCacheKeyHash = request.router.prefix ? request.router.prefix + '_' + keyHash : keyHash;
            let cacheConfig = CONFIG.get('cache') || {};
            if (cacheConfig.enabled !== false && request.router.cache && request.router.cache.enabled) {
                SERVICE.DefaultCacheService.get({
                    tenant: request.tenant,
                    moduleName: request.moduleName,
                    channelName: SERVICE.DefaultCacheService.getRouterCacheChannel(request.router.routerName),
                    key: request.apiCacheKeyHash,
                    ttl: request.router.cache.ttl
                }).then(value => {
                    let cachedResponse = _.cloneDeep(value);
                    cachedResponse.cache = 'api hit';
                    process.stop(request, response, cachedResponse);
                }).catch(error => {
                    if (error.code === 'ERR_CACHE_00001') {
                        process.nextSuccess(request, response);
                    } else if (error.code === 'ERR_CACHE_00006') {
                        _self.LOG.warn(error.message);
                        process.nextSuccess(request, response);
                    } else {
                        process.error(request, response, error);
                    }
                });
            } else {
                process.nextSuccess(request, response);
            }
        } catch (error) {
            process.error(request, response, error);
        }
    },

    /**
     * Dispatches the request to the selected controller and operation.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.router Effective router definition with controller and operation names.
     * @param {Object} response Nodics response context mutated with controller success result.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     * @sideEffects Calls dynamic controller registry and asynchronously stores cacheable results.
     * @throws Propagates controller dispatch errors through the pipeline.
     */
    handleRequest: function (request, response, process) {
        let _self = this;
        _self.LOG.debug('processing your request : ' + request.originalUrl);
        try {
            CONTROLLER[request.router.controller][request.router.operation](request, (error, success) => {
                if (error) {
                    process.error(request, response, error);
                } else {
                    response.success = success;
                    let cacheDecision = SERVICE.DefaultCachePolicyService && typeof SERVICE.DefaultCachePolicyService.isApiCacheable === 'function' ?
                        SERVICE.DefaultCachePolicyService.isApiCacheable(request, response.success) :
                        { cacheable: response.success && response.success.result && UTILS.isApiCashable(response.success.result, request.router), reason: 'legacyPolicy', reasonCode: 'RSN_CACHE_00010' };
                    request.cachePolicyDecision = cacheDecision;
                    if (cacheDecision.cacheable) {
                        SERVICE.DefaultCacheService.put({
                            tenant: request.tenant,
                            moduleName: request.moduleName,
                            channelName: SERVICE.DefaultCacheService.getRouterCacheChannel(request.router.routerName),
                            key: request.apiCacheKeyHash,
                            value: response.success,
                            ttl: request.router.cache ? request.router.cache.ttl : undefined
                        }).then(cuccess => {
                            _self.LOG.debug('Data pushed into cache successfully');
                        }).catch(error => {
                            _self.LOG.warn(error.message);
                        });
                    } else if (cacheDecision.reason && cacheDecision.reason !== 'legacyPolicy' && (!CONFIG.get('cache') || !CONFIG.get('cache').cacheability || CONFIG.get('cache').cacheability.logSkippedReason !== false)) {
                        _self.LOG.debug('Skipping API cache write: ' + cacheDecision.reasonCode + ' ' + cacheDecision.reason);
                    }
                    process.nextSuccess(request, response);
                }
            });
        } catch (error) {
            process.error(request, response, error);
        }
    }
};
