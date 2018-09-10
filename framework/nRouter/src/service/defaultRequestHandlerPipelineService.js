/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');

module.exports = {

    startRequestHandlerPipeline: function (request, response, routerDef) {
        request.local = {
            requestId: SYSTEM.generateUniqueCode(),
            parentRequestId: request.get('requestId'),
            router: routerDef,
            httpResponse: response,
            protocal: request.protocol,
            host: request.hostname,
            originalUrl: request.originalUrl,
            secured: routerDef.secured,
            moduleName: routerDef.moduleName,
            special: (routerDef.controller) ? false : true
        };
        SERVICE.DefaultPipelineService.start('requestHandlerPipeline', request, {}).then(success => {
            response.json(success);
        }).catch(error => {
            response.json(error);
        });
    },

    helpRequest: function (request, response, process) {
        if (request.local.originalUrl.endsWith('?help')) {
            response.success = true;
            response.code = 'SUC001';
            response.msg = 'Processed successfully';
            if (request.local.router.help) {
                response.result = request.local.router.help;
            } else {
                response.result = 'Not defined';
            }
            process.stop(request, response);
        } else {
            process.nextSuccess(request, response);
        }
    },

    parseHeader: function (request, response, process) {
        this.LOG.debug('Parsing request header for : ', request.local.originalUrl);
        if (request.get('authToken')) {
            request.local.authToken = request.get('authToken');
        }
        if (request.get('enterpriseCode')) {
            request.local.enterpriseCode = request.get('enterpriseCode');
        }
        if (!request.local.enterpriseCode &&
            !UTILS.isBlank(request.body) &&
            request.body.enterpriseCode) {
            request.local.enterpriseCode = request.body.enterpriseCode;
        }
        process.nextSuccess(request, response);
    },

    parseBody: function (request, response, process) {
        this.LOG.debug('Parsing request body : ', request.local.originalUrl);
        _.merge(request.local, request.body || {});
        process.nextSuccess(request, response);
    },

    handleSpecialRequest: function (request, response, process) {
        let _self = this;
        this.LOG.debug('Handling special request : ', request.local.originalUrl);
        if (request.local.special) {
            if (!request.local.tenant) {
                request.local.tenant = 'default';
            }
            try {
                CONTROLLER[request.local.router.handler][request.local.router.operation](request, (error, result) => {
                    if (error) {
                        process.error(request, response, error);
                    } else {
                        let cache = false;
                        if (result.cache) {
                            cache = true;
                            delete result.cache;
                        }
                        response.success = true;
                        response.code = 'SUC001';
                        response.msg = 'Processed successfully';
                        response.result = result;
                        if (request.local.router.cache && request.local.router.cache.enabled && request.local.router.moduleObject.apiCache) {
                            SERVICE.DefaultCacheService.putApi(request.local.router.moduleObject.apiCache,
                                request,
                                response,
                                request.local.router.cache).then(cuccess => {
                                    if (cache) {
                                        response.cache = 'item hit';
                                    }
                                    process.stop(request, response);
                                }).catch(error => {
                                    _self.LOG.error('While pushing data into Item cache : ', error);
                                    process.stop(request, response);
                                });
                        } else {
                            if (cache) {
                                response.cache = 'item hit';
                            }
                            process.stop(request, response);
                        }
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
        this.LOG.debug('Redirecting secured/non-secured request  : ', request.local.originalUrl);
        if (request.local.secured) {
            this.LOG.debug('Handling secured request');
            response.targetNode = 'securedRequest';
        } else {
            this.LOG.debug('Handling non-secured request');
            response.targetNode = 'nonSecureRequest';
        }
        process.nextSuccess(request, response);
    },

    handleRequest: function (request, response, process) {
        let _self = this;
        _self.LOG.debug('processing your request : ', request.local.originalUrl);
        try {
            CONTROLLER[request.local.router.controller][request.local.router.operation](request, (error, result) => {
                if (error) {
                    process.error(request, response, error);
                } else {
                    let cache = false;
                    if (result.cache) {
                        cache = true;
                        delete result.cache;
                    }
                    response.result = result;
                    if (request.local.router.cache &&
                        request.local.router.cache.enabled &&
                        request.local.router.moduleObject.apiCache) {
                        SERVICE.DefaultCacheService.putApi(request.local.router.moduleObject.apiCache,
                            request,
                            response,
                            request.local.router.cache).then(cuccess => {
                                if (cache) {
                                    request.local.cache = 'item hit';
                                } else {
                                    request.local.cache = 'mis';
                                }
                                process.nextSuccess(request, response);
                            }).catch(error => {
                                _self.LOG.error('While pushing data into Item cache : ', error);
                                process.nextSuccess(request, response);
                            });
                    } else {
                        if (cache) {
                            response.cache = 'item hit';
                        } else {
                            response.cache = 'mis';
                        }
                        process.nextSuccess(request, response);
                    }
                }
            });
        } catch (error) {
            _self.LOG.error('Got error while service request : ', error);
            process.error(request, response, error);
        }
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully : ', request.local.originalUrl);
        process.resolve({
            success: true,
            code: 'SUC001',
            msg: 'Processed successfully',
            cache: response.cache,
            result: response.result
        });
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors : ', response.errors);
        process.reject({
            success: false,
            code: response.errorCode || 'ERR001',
            msg: 'Process failed with errors',
            error: response.errors
        });
    }
};