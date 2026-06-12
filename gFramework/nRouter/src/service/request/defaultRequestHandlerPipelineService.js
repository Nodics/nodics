/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');

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

    getHeaderValue: function (httpRequest, names) {
        let value;
        _.each(names, name => {
            if (!value) {
                value = httpRequest.get(name);
            }
        });
        return value;
    },

    getBearerToken: function (authorization) {
        if (UTILS.isBlank(authorization)) {
            return null;
        }
        let bearerParts = authorization.match(/^Bearer\s+(.+)$/i);
        return bearerParts ? bearerParts[1].trim() : null;
    },

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

    parseBody: function (request, response, process) {
        process.nextSuccess(request, response);
    },

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

    lookupCache: function (request, response, process) {
        let _self = this;
        this.LOG.debug('Looking up result in cache system  : ' + request.originalUrl);
        try {
            let keyHash = UTILS.generateHash(SERVICE.DefaultCacheConfigurationService.createApiKey(request.httpRequest));
            request.apiCacheKeyHash = request.router.prefix ? request.router.prefix + '_' + keyHash : keyHash;
            if (request.router.cache && request.router.cache.enabled) {
                SERVICE.DefaultCacheService.get({
                    moduleName: request.moduleName,
                    channelName: SERVICE.DefaultCacheService.getRouterCacheChannel(request.router.routerName),
                    key: request.apiCacheKeyHash,
                    ttl: request.router.cache.ttl
                }).then(value => {
                    process.stop(request, response, {
                        code: 'SUC_CACHE_00002',
                        cache: 'api hit',
                        result: value.result
                    });
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

    handleRequest: function (request, response, process) {
        let _self = this;
        _self.LOG.debug('processing your request : ' + request.originalUrl);
        try {
            CONTROLLER[request.router.controller][request.router.operation](request, (error, success) => {
                if (error) {
                    process.error(request, response, error);
                } else {
                    response.success = success;
                    if (response.success && response.success.result && UTILS.isApiCashable(response.success.result, request.router)) {
                        SERVICE.DefaultCacheService.put({
                            moduleName: request.moduleName,
                            channelName: SERVICE.DefaultCacheService.getRouterCacheChannel(request.router.routerName),
                            key: request.apiCacheKeyHash,
                            value: response.success.result,
                            ttl: request.router.cache ? request.router.cache.ttl : undefined
                        }).then(cuccess => {
                            _self.LOG.debug('Data pushed into cache successfully');
                        }).catch(error => {
                            _self.LOG.warn(error.message);
                        });
                    }
                    process.nextSuccess(request, response);
                }
            });
        } catch (error) {
            process.error(request, response, error);
        }
    }
};
