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
            response.success = true;
            response.code = 'SUC001';
            response.msg = 'Processed successfully';
            if (request.router.help) {
                response.result = request.router.help;
            } else {
                response.result = 'Not defined';
            }
            process.stop(request, response);
        } else {
            process.nextSuccess(request, response);
        }
    },

    parseHeader: function (request, response, process) {
        this.LOG.debug('Parsing request header for : ' + request.originalUrl);
        request.cache = null;
        if (request.httpRequest.get('apiKey')) {
            request.apiKey = request.httpRequest.get('apiKey');
        }
        if (request.httpRequest.get('authToken')) {
            request.authToken = request.httpRequest.get('authToken');
        }
        if (request.httpRequest.get('entCode')) {
            request.entCode = request.httpRequest.get('entCode');
        }
        if (!request.apiKey && !request.authToken && !request.entCode) {
            process.error(request, response, new CLASSES.NodicsError({
                code: 'ERR_AUTH_00002'
            }));
        } else {
            process.nextSuccess(request, response);
        }
    },

    parseBody: function (request, response, process) {
        this.LOG.debug('Parsing request body : ' + request.originalUrl);
        process.nextSuccess(request, response);
    },

    handleSpecialRequest: function (request, response, process) {
        let _self = this;
        this.LOG.debug('Handling special request : ' + request.originalUrl);
        if (request.special) {
            if (!request.tenant) {
                request.tenant = 'default';
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
                        success: true,
                        code: 'SUC_SYS_00000',
                        message: SERVICE.DefaultStatusService.get('SUC_SYS_00000').message,
                        cache: 'api hit',
                        result: value.result
                    });
                }).catch(error => {
                    if (error.code === 'ERR_CACHE_00010') {
                        _self.LOG.warn(error.message);
                        process.nextSuccess(request, response);
                    } else if (error.code === 'ERR_CACHE_00001') {
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