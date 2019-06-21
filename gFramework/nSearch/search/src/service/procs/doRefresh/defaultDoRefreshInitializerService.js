/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

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

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating do refresh request');
        if (!request.searchModel) {
            process.error(request, response, 'Invalid search model or search is not active for this schema');
        } else {
            process.nextSuccess(request, response);
        }
    },

    buildOptions: function (request, response, process) {
        this.LOG.debug('Building query options');
        process.nextSuccess(request, response);
    },

    applyPreInterceptors: function (request, response, process) {
        this.LOG.debug('Applying pre do refresh interceptors');
        let indexName = request.indexName || request.searchModel.indexName;
        let interceptors = SERVICE.DefaultSearchConfigurationService.getInterceptors(indexName);
        if (interceptors && interceptors.preDoRefresh) {
            SERVICE.DefaultInterceptorHandlerService.executeInterceptors([].concat(interceptors.preDoRefresh), {
                schemaModel: request.schemaModel,
                searchModel: request.searchModel,
                indexName: request.searchModel.indexName,
                typeName: request.searchModel.typeName,
                tenant: request.tenant,
                options: request.options,
                query: request.query,
            }, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_SRCH_00000',
                    error: error.toString()
                });
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    executeQuery: function (request, response, process) {
        this.LOG.debug('Executing get query');
        request.searchModel.doRefresh(request).then(result => {
            response.success = {
                success: true,
                code: 'SUC_SRCH_00000',
                result: result
            };
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, {
                success: false,
                code: 'ERR_SRCH_00000',
                error: error
            });
        });
    },

    applyPostInterceptors: function (request, response, process) {
        this.LOG.debug('Applying post do refresh interceptors');
        let indexName = request.indexName || request.searchModel.indexName;
        let interceptors = SERVICE.DefaultSearchConfigurationService.getInterceptors(indexName);
        if (interceptors && interceptors.postDoRefresh) {
            SERVICE.DefaultInterceptorHandlerService.executeInterceptors([].concat(interceptors.postDoRefresh), {
                schemaModel: request.schemaModel,
                searchModel: request.searchModel,
                indexName: request.searchModel.indexName,
                typeName: request.searchModel.typeName,
                tenant: request.tenant,
                query: request.query
            }, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_FIND_00005',
                    error: error.toString()
                });
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    triggerModelChangeEvent: function (request, response, process) {
        this.LOG.debug('Triggering event for modified model');
        try {
            let searchModel = request.searchModel;
            let eventOnRefresh = CONFIG.get('search').eventOnRefresh;
            if (eventOnRefresh) {
                let event = {
                    enterpriseCode: request.enterpriseCode || 'default',
                    tenant: request.tenant || 'default',
                    event: 'indexingPerformed',
                    source: searchModel.moduleName,
                    target: searchModel.moduleName,
                    state: "NEW",
                    type: "ASYNC",
                    targetType: ENUMS.TargetType.EACH_NODE.key,
                    active: true,
                    data: response.success.result
                };
                this.LOG.debug('Pushing event for item created : ', searchModel.indexName);
                SERVICE.DefaultEventService.publish(event).then(success => {
                    this.LOG.debug('Event successfully posted');
                }).catch(error => {
                    this.LOG.error('While posting model change event : ', error);
                });
            }
        } catch (error) {
            this.LOG.error('Facing issue while pushing save event : ', error);
        }
        process.nextSuccess(request, response);
    },
    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        response.success.msg = SERVICE.DefaultStatusService.get(response.success.code || 'SUC_SYS_00000').message;
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        if (response.errors && response.errors.length === 1) {
            process.reject(response.errors[0]);
        } else if (response.errors && response.errors.length > 1) {
            process.reject({
                success: false,
                code: 'ERR_SYS_00000',
                error: response.errors
            });
        } else {
            process.reject(response.error);
        }
    }
};