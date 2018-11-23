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

    buildQuery: function (request, response, process) {
        this.LOG.debug('Building query options');
        let inputOptions = request.options || {};
        inputOptions.explain = inputOptions.explain || false;
        inputOptions.explain = inputOptions.explain || false;
        inputOptions.snapshot = inputOptions.snapshot || false;

        if (inputOptions.timeout === true) {
            inputOptions.timeout = true;
            inputOptions.maxTimeMS = maxTimeMS || CONFIG.get('queryMaxTimeMS');
        }
        request.options = inputOptions;
        process.nextSuccess(request, response);
    },

    applyPreInterceptors: function (request, response, process) {
        this.LOG.debug('Applying pre update model interceptors');
        let moduleName = request.moduleName || request.collection.moduleName;
        let modelName = request.collection.modelName;
        let interceptors = NODICS.getInterceptors(moduleName, modelName);
        if (interceptors && interceptors.preRemove) {
            SERVICE.DefaultInterceptorHandlerService.executeRemoveInterceptors({
                collection: request.collection,
                query: request.query,
                interceptorList: [].concat(interceptors.preRemove)
            }).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_FIND_00004',
                    error: error
                });
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    executeQuery: function (request, response, process) {
        this.LOG.debug('Executing remove query');
        try {
            request.collection.removeItems(request).then(result => {
                response.success = {
                    success: true,
                    code: 'SUC_DEL_00000',
                    result: result
                };
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_DEL_00000',
                    error: error
                });
            });
        } catch (error) {
            process.error(request, response, {
                success: false,
                code: 'ERR_DEL_00000',
                error: error
            });
        }
    },

    applyPostInterceptors: function (request, response, process) {
        this.LOG.debug('Applying post remove model interceptors');
        if (response.success && response.success.result && response.success.result.length > 0) {
            let moduleName = request.moduleName || request.collection.moduleName;
            let modelName = request.collection.modelName;
            let interceptors = NODICS.getInterceptors(moduleName, modelName);
            if (interceptors && interceptors.postRemove) {
                SERVICE.DefaultInterceptorHandlerService.executeRemoveInterceptors({
                    collection: request.collection,
                    query: request.query,
                    result: response.success.result,
                    interceptorList: [].concat(interceptors.postRemove)
                }).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, {
                        success: false,
                        code: 'ERR_FIND_00005',
                        error: error
                    });
                });
            } else {
                process.nextSuccess(request, response);
            }
        } else {
            process.nextSuccess(request, response);
        }
    },

    invalidateCache: function (request, response, process) {
        this.LOG.debug('Invalidating cache for removed model');
        try {
            let moduleObject = NODICS.getModules()[request.collection.moduleName];
            let collection = request.collection;
            if (response.success && response.success.result && moduleObject.itemCache &&
                collection.rawSchema.cache && collection.rawSchema.cache.enabled) {
                SERVICE.DefaultCacheService.flushItemCache({
                    moduleName: collection.moduleName,
                    prefix: collection.schemaName
                }).then(success => {
                    this.LOG.debug('Cache for model:' + collection.modelName + ' has been flushed cuccessfully');
                }).catch(error => {
                    this.LOG.error('Cache for model:' + collection.modelName + ' has not been flushed cuccessfully');
                    this.LOG.error(error);
                });
            }
        } catch (error) {
            this.LOG.error('Facing issue while pushing save event : ', error);
        }
        process.nextSuccess(request, response);
    },

    triggerModelChangeEvent: function (request, response, process) {
        this.LOG.debug('Triggering event for removed models');
        try {
            let collection = request.collection;
            if (response.success && response.success.result && collection.rawSchema.event) {
                let event = {
                    enterpriseCode: request.enterpriseCode,
                    tenant: request.tenant,
                    event: 'removed',
                    source: collection.moduleName,
                    target: collection.moduleName,
                    state: "NEW",
                    type: "ASYNC",
                    targetType: ENUMS.TargetType.EACH_NODE.key,
                    params: [{
                        key: 'schemaName',
                        value: collection.schemaName
                    }, {
                        key: 'modelName',
                        value: collection.modelName
                    }, {
                        key: 'data',
                        value: response.success.result
                    }]
                };
                this.LOG.debug('Pushing event for item created : ', collection.schemaName);
                SERVICE.DefaultEventService.publish(event, (error, response) => {
                    if (error) {
                        _self.LOG.error('While posting model change event : ', error);
                    } else {
                        _self.LOG.debug('Event successfully posted');
                    }
                });
            }
        } catch (error) {
            this.LOG.error('Facing issue while pushing save event : ', error);
        }
        process.nextSuccess(request, response);
    },

    handleDeepRemove: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        let rawSchema = request.collection.rawSchema;
        if (request.options.returnModified &&
            request.options.deepRemove &&
            response.success.result &&
            response.success.result.models &&
            !UTILS.isBlank(rawSchema.refSchema)) {
            let models = response.success.result.models;
            process.nextSuccess(request, response);
        } else {
            process.nextSuccess(request, response);
        }
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed and got errors');
        process.reject(response.error);
    }
};