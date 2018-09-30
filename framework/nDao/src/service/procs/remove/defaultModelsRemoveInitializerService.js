/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating remove request: ');
        process.nextSuccess(request, response);
    },

    applyPreInterceptors: function (request, response, process) {
        this.LOG.debug('Applying pre remove model interceptors');
        let moduleName = request.moduleName || request.collection.moduleName;
        let modelName = request.collection.modelName;
        let interceptors = NODICS.getInterceptors(moduleName, modelName);
        if (interceptors && interceptors.preRemove) {
            SERVICE.DefaultInterceptorHandlerService.executeInterceptors(
                request,
                response,
                request.success,
                [].concat(interceptors.preRemove)).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
        } else {
            process.nextSuccess(request, response);
        }
    },

    buildQuery: function (request, response, process) {
        this.LOG.debug('Building query options');
        let inputOptions = request.options || {};
        let queryOptions = {};
        let pageSize = inputOptions.pageSize || CONFIG.get('defaultPageSize');
        let pageNumber = inputOptions.pageNumber || CONFIG.get('defaultPageNumber');
        queryOptions.limit = pageSize;
        queryOptions.skip = pageSize * pageNumber;
        queryOptions.explain = inputOptions.explain || false;
        queryOptions.snapshot = inputOptions.snapshot || false;

        if (inputOptions.sort) {
            queryOptions.sort = inputOptions.sort;
        }
        if (inputOptions.projection) {
            queryOptions.projection = inputOptions.projection;
        }
        if (inputOptions.hint) {
            queryOptions.hint = inputOptions.hint;
        }
        if (inputOptions.timeout === true) {
            queryOptions.timeout = true;
            queryOptions.maxTimeMS = maxTimeMS || CONFIG.get('queryMaxTimeMS');
        }
        request.queryOptions = queryOptions;
        request.query = inputOptions.query || {};
        process.nextSuccess(request, response);
    },

    executeQuery: function (request, response, process) {
        this.LOG.debug('Executing remove query');
        try {
            request.collection.removeItems(request).then(result => {
                console.log('Removed Items: ', result);
                if (result && UTILS.isArray(result)) {
                    result.forEach(element => {
                        response.success.push(element);
                    });
                } else {
                    response.success.push(result);
                }
                process.nextSuccess(request, response);
            }).catch(error => {
                console.log(error);
                process.error(request, response, error);
            });
        } catch (error) {
            console.log(error);
            process.error(request, response, error);
        }
    },

    applyPostInterceptors: function (request, response, process) {
        this.LOG.debug('Applying post remove model interceptors');
        let moduleName = request.moduleName || request.collection.moduleName;
        let modelName = request.collection.modelName;
        let interceptors = NODICS.getInterceptors(moduleName, modelName);
        if (interceptors && interceptors.postRemove) {
            SERVICE.DefaultInterceptorHandlerService.executeInterceptors(
                request,
                response,
                request.success,
                [].concat(interceptors.postRemove)).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
        } else {
            process.nextSuccess(request, response);
        }
    },

    invalidateCache: function (request, response, process) {
        this.LOG.debug('Invalidating cache for removed model');
        process.nextSuccess(request, response);
    },

    triggerModelChangeEvent: function (request, response, process) {
        this.LOG.debug('Triggering event for modified model');
        process.nextSuccess(request, response);
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed and got errors');
        process.reject(response.errors);
    }
};