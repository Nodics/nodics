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

    startRequestHandlerPipeline: function (request, response, routerDef) {
        let input = {
            requestId: UTILS.generateUniqueCode(),
            parentRequestId: request.get('requestId'),
            router: routerDef,
            httpRequest: request,
            httpResponse: response,
            protocal: request.protocol,
            host: request.hostname,
            originalUrl: request.originalUrl,
            secured: routerDef.secured,
            moduleName: routerDef.moduleName,
            special: (routerDef.controller) ? false : true,
            method: request.method,
            body: request.body || {}
        };
        SERVICE.DefaultPipelineService.start('requestHandlerPipeline', input, {}).then(success => {
            response.json(success);
        }).catch(error => {
            response.json(error);
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
        this.LOG.debug('Parsing request header for : ', request.originalUrl);
        request.cache = null;
        if (request.httpRequest.get('apiKey')) {
            request.apiKey = request.httpRequest.get('apiKey');
        }
        if (request.httpRequest.get('authToken')) {
            request.authToken = request.httpRequest.get('authToken');
        }
        if (request.httpRequest.get('enterpriseCode')) {
            request.enterpriseCode = request.httpRequest.get('enterpriseCode');
        }
        if (!request.apiKey && !request.authToken && !request.enterpriseCode) {
            process.error(request, response, {
                success: false,
                code: 'ERR_AUTH_00002'
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    parseBody: function (request, response, process) {
        this.LOG.debug('Parsing request body : ', request.originalUrl);
        process.nextSuccess(request, response);
    },

    handleSpecialRequest: function (request, response, process) {
        let _self = this;
        this.LOG.debug('Handling special request : ', request.originalUrl);
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
        this.LOG.debug('Redirecting secured/non-secured request  : ', request.originalUrl);
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
        this.LOG.debug('Looking up result in cache system  : ', request.originalUrl);
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
                        msg: SERVICE.DefaultStatusService.get('SUC_SYS_00000').message,
                        cache: 'api hit',
                        result: value.result
                    });
                }).catch(error => {
                    if (error.code === 'ERR_CACHE_00010') {
                        _self.LOG.warn(error.msg);
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
        _self.LOG.debug('processing your request : ', request.originalUrl);
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
                            _self.LOG.warn(error.msg);
                        });
                    }
                    process.nextSuccess(request, response);
                }
            });
        } catch (error) {
            process.error(request, response, error);
        }
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully : ', request.originalUrl);
        let success = response.success;
        if (!UTILS.isObject(success)) {
            success = {
                success: true,
                code: 'SUC_SYS_00000',
                result: success
            };
        }
        success.success = success.success || true;
        success.code = success.code || 'SUC_SYS_00000';
        if (!success.msg) {
            success.msg = SERVICE.DefaultStatusService.get(success.code) ? SERVICE.DefaultStatusService.get(success.code).message : 'Successfully processed';
        }
        process.resolve(success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        if (response.errors && response.errors.length === 1) {
            let error = response.errors[0];
            if (!UTILS.isObject(error)) {
                error = {
                    success: false,
                    code: 'ERR_SYS_00000',
                    error: error
                };
            }
            error.success = error.success || false;
            error.code = error.code || 'ERR_SYS_00000';
            if (!error.msg) {
                error.msg = SERVICE.DefaultStatusService.get(error.code) ? SERVICE.DefaultStatusService.get(error.code).message : 'Process failed with errors';
            }
            if (error.error) {
                error.msg = error.error.message;
                error.stack = error.error.stack;

            }
            this.LOG.error(error);
            process.reject(error);
        } else {
            let error = {
                success: false,
                code: 'ERR_SYS_00000',
                msg: SERVICE.DefaultStatusService.get('ERR_SYS_00000') ? SERVICE.DefaultStatusService.get('ERR_SYS_00000').message : 'Process failed with errors',
                error: response.errors
            };
            this.LOG.error(error);
            process.reject();
        }
    }
};