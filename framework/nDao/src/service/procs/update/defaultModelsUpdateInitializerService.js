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
        if (!request.query || UTILS.isBlank(request.query)) {
            process.error(request, response, 'Update criteria can not be null or blank');
        } else if (!request.model || UTILS.isBlank(request.model)) {
            process.error(request, response, 'Update value can not be null or blank');
        } else {
            process.nextSuccess(request, response);
        }
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
        if (interceptors && interceptors.preUpdate) {
            SERVICE.DefaultInterceptorHandlerService.executeUpdateInterceptors({
                collection: request.collection,
                query: request.query,
                model: request.model,
                interceptorList: [].concat(interceptors.preUpdate)
            }).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    executeQuery: function (request, response, process) {
        this.LOG.debug('Executing remove query');
        try {
            request.collection.updateItems(request).then(result => {
                response.success = result;
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } catch (error) {
            process.error(request, response, error);
        }
    },

    applyPostInterceptors: function (request, response, process) {
        this.LOG.debug('Applying post update model interceptors');
        if (response.success && response.success.length > 0) {
            let moduleName = request.moduleName || request.collection.moduleName;
            let modelName = request.collection.modelName;
            let interceptors = NODICS.getInterceptors(moduleName, modelName);
            if (interceptors && interceptors.postUpdate) {
                SERVICE.DefaultInterceptorHandlerService.executeUpdateInterceptors({
                    collection: request.collection,
                    query: request.query,
                    model: request.model,
                    result: response.success,
                    interceptorList: [].concat(interceptors.postUpdate)
                }).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
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
            let collection = request.collection;
            if (response.success && response.success.models && collection.rawSchema.event) {
                let event = {
                    enterpriseCode: request.enterpriseCode,
                    tenant: request.tenant,
                    event: 'save',
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
                        value: response.success.models
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