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
        let input = {
            requestId: SYSTEM.generateUniqueCode(),
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
        if (request.httpRequest.get('authToken')) {
            request.authToken = request.httpRequest.get('authToken');
        }
        if (request.httpRequest.get('enterpriseCode')) {
            request.enterpriseCode = request.httpRequest.get('enterpriseCode');
        }
        process.nextSuccess(request, response);
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
                        response.success = success;
                        process.stop(request, response);
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
        this.LOG.debug('Looking up result in cache system  : ', request.originalUrl);
        try {
            request.apiCacheKeyHash = SYSTEM.generateHash(SERVICE.DefaultCacheService.createApiKey(request.httpRequest));
            SERVICE.DefaultCacheService.getApi(request.router, request.apiCacheKeyHash).then(value => {
                process.stop(request, response, {
                    success: true,
                    code: 'SUC_SYS_00000',
                    msg: SERVICE.DefaultStatusService.get('SUC_SYS_00000').message,
                    cache: 'api hit',
                    result: value.result
                });
            }).catch(error => {
                if (error.code === 'ERR_CACHE_00001') {
                    process.nextSuccess(request, response);
                } else {
                    process.error(request, response, error);
                }
            });
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
                    let moduleObject = NODICS.getModule(request.moduleName);
                    if (UTILS.isApiCashable(response.success.result, request.router) && moduleObject.apiCache) {
                        SERVICE.DefaultCacheService.putApi(request.router, request.apiCacheKeyHash, response.success.result).then(cuccess => {
                            _self.LOG.debug('Data pushed into cache successfully');
                        }).catch(error => {
                            _self.LOG.error('While pushing data into Item cache : ', error);
                        });

                    }
                    process.nextSuccess(request, response);
                }
            });
        } catch (error) {
            _self.LOG.error('Got error while service request : ', error);
            process.error(request, response, error);
        }
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully : ', request.originalUrl);
        response.success.success = response.success.success || true;
        response.success.code = response.success.code || 'SUC_SYS_00000';
        response.success.msg = response.success.msg || SERVICE.DefaultStatusService.get(response.success.code) ? SERVICE.DefaultStatusService.get(response.success.code).message : 'Successfully processed';
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors : ', response.error);
        response.error.success = response.error.success || false;
        response.error.code = response.error.code || 'ERR_SYS_00000';
        response.error.msg = response.error.msg || SERVICE.DefaultStatusService.get(response.error.code) ? SERVICE.DefaultStatusService.get(response.error.code).message : 'Process failed with errors';
        process.reject(response.error);
    }
};