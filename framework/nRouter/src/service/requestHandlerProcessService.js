/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    startRequestHandlerProcess: function(request, response, routerDef) {
        try {
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
            SERVICE.ProcessService.startProcess('requestHandlerProcess', request, {});
        } catch (error) {
            response.json(error);
        }
    },

    parseHeader: function(request, response, process) {
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

    parseBody: function(request, response, process) {
        this.LOG.debug('Parsing request body : ', request.local.originalUrl);
        process.nextSuccess(request, response);
    },

    handleSpecialRequest: function(request, response, process) {
        let _self = this;
        this.LOG.debug('Handling special request : ', request.local.originalUrl);
        if (request.local.special) {
            if (!request.local.tenant) {
                request.local.tenant = 'default';
            }
            try {
                CONTROLLER[request.local.router.handler][request.local.router.operation](request, (error, result) => {
                    if (error) {
                        _self.LOG.error('Got error while handling special request : ', error);
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
                            let options = {
                                ttl: request.local.router.ttl
                            };
                            SERVICE.CacheService.putApi(request.local.router.moduleObject.apiCache,
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

    redirectRequest: function(request, response, process) {
        this.LOG.debug('Redirecting secured/non-secured request  : ', request.local.originalUrl);
        if (request.local.secured) {
            this.LOG.debug('Handling secured request');
            process.nextSuccess(request, response);
        } else {
            this.LOG.debug('Handling non-secured request');
            process.nextFailure(request, response);
        }
    },

    handleRequest: function(request, response, process) {
        let _self = this;
        _self.LOG.debug('processing your request : ', request.local.originalUrl);
        try {
            CONTROLLER[request.local.router.controller][request.local.router.operation](request, (error, result) => {
                if (error) {
                    _self.LOG.error('Got error while processing request : ', error);
                    response.success = false;
                    delete response.result;
                    delete response.msg;
                    delete response.code;
                    response.errors.PROC_ERR_0003 = {
                        code: 'ERR003',
                        msg: error.toString()
                    };
                    process.nextFailure(request, response);
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
                    if (request.local.router.cache &&
                        request.local.router.cache.enabled &&
                        request.local.router.moduleObject.apiCache) {
                        let options = {
                            ttl: request.local.router.ttl
                        };
                        SERVICE.CacheService.putApi(request.local.router.moduleObject.apiCache,
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
            response.success = false;
            delete response.result;
            delete response.msg;
            delete response.code;
            response.errors.PROC_ERR_0003 = {
                code: 'ERR003',
                msg: error.toString()
            };
            process.nextFailure(request, response);
        }
    },

    handleSucessEnd: function(request, response) {
        this.LOG.debug('Request has been processed successfully : ', request.local.originalUrl);
        request.local.httpResponse.json(response);
    },

    handleFailureEnd: function(request, response) {
        this.LOG.debug('Request has been processed with some failures : ', request.local.originalUrl);
        request.local.httpResponse.json(response);
    },

    handleErrorEnd: function(request, response) {
        this.LOG.debug('Request has been processed and got errors : ', request.local.originalUrl);
        request.local.httpResponse.json(response);
    }
};