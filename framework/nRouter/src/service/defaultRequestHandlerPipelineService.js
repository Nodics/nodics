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
            body: request.body || {},
            apiCacheKeyHash: request.apiCacheKeyHash
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
                CONTROLLER[request.router.handler][request.router.operation](request, (error, result) => {
                    if (error) {
                        process.error(request, response, error);
                    } else {
                        response.result = result;
                        if (response.result &&
                            request.router.cache &&
                            request.router.cache.enabled &&
                            request.router.moduleObject.apiCache) {
                            //let cacheKeyHash = SYSTEM.generateHash(SERVICE.DefaultCacheService.createApiKey(request));
                            console.log('2=============: ', request.apiCacheKeyHash);
                            SERVICE.DefaultCacheService.putApi(request.router, request.apiCacheKeyHash, response.result).then(cuccess => {
                                _self.LOG.debug('Data pushed into cache successfully');
                            }).catch(error => {
                                _self.LOG.error('While pushing data into Item cache : ', error);
                            });
                        }
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

    handleRequest: function (request, response, process) {
        let _self = this;
        _self.LOG.debug('processing your request : ', request.originalUrl);
        try {
            CONTROLLER[request.router.controller][request.router.operation](request, (error, result) => {
                if (error) {
                    process.error(request, response, error);
                } else {
                    response.result = result;
                    if (response.result &&
                        request.router.cache &&
                        request.router.cache.enabled &&
                        request.router.moduleObject.apiCache) {
                        //let cacheKeyHash = SYSTEM.generateHash(SERVICE.DefaultCacheService.createApiKey(request));
                        console.log('3=============: ', request.apiCacheKeyHash);
                        SERVICE.DefaultCacheService.putApi(request.router, request.apiCacheKeyHash, response.result).then(cuccess => {
                            _self.LOG.debug('Data pushed into cache successfully');
                        }).catch(error => {
                            _self.LOG.error('While pushing data into Item cache : ', error);
                        });
                        process.nextSuccess(request, response);
                    } else {
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
        this.LOG.debug('Request has been processed successfully : ', request.originalUrl);
        let output = {
            success: true,
            code: 'SUC001',
            msg: 'Processed successfully',
            result: response.result
        };
        if (request.cache) {
            output.cache = request.cache;
        }
        process.resolve(output);
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