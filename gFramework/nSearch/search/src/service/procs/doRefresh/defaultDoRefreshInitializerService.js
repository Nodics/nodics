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
            process.error(request, response, new CLASSES.SearchNodics('ERR_SRCH_00003', 'Invalid search model or search is not active for this schema'));
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
        let interceptors = SERVICE.DefaultSearchConfigurationService.getSearchInterceptors(indexName);
        if (interceptors && interceptors.preDoRefresh) {
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.preDoRefresh), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsNodics(error, null, 'ERR_SRCH_00007'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    applyPreValidators: function (request, response, process) {
        this.LOG.debug('Applying pre do refresh validators');
        let indexName = request.indexName || request.searchModel.indexName;
        let validators = SERVICE.DefaultSearchConfigurationService.getSearchValidators(request.tenant, indexName);
        if (validators && validators.preDoRefresh) {
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.preDoRefresh), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsNodics(error, null, 'ERR_SRCH_00007'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    executeQuery: function (request, response, process) {
        this.LOG.debug('Executing get query');
        request.searchModel.doRefresh(request).then(result => {
            response.success = {
                code: 'SUC_SRCH_00000',
                result: result
            };
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    applyPostValidators: function (request, response, process) {
        this.LOG.debug('Applying post do refresh validators');
        let indexName = request.indexName || request.searchModel.indexName;
        let validators = SERVICE.DefaultSearchConfigurationService.getSearchValidators(request.tenant, indexName);
        if (validators && validators.postDoRefresh) {
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.postDoRefresh), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsNodics(error, null, 'ERR_SRCH_00008'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    applyPostInterceptors: function (request, response, process) {
        this.LOG.debug('Applying post do refresh interceptors');
        let indexName = request.indexName || request.searchModel.indexName;
        let interceptors = SERVICE.DefaultSearchConfigurationService.getSearchInterceptors(indexName);
        if (interceptors && interceptors.postDoRefresh) {
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.postDoRefresh), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsNodics(error, null, 'ERR_SRCH_00008'));
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
                    tenant: request.tenant || 'default',
                    event: 'indexingPerformed',
                    sourceName: searchModel.moduleName,
                    sourceId: CONFIG.get('nodeId'),
                    target: searchModel.moduleName,
                    state: "NEW",
                    type: "ASYNC",
                    targetType: ENUMS.TargetType.MODULE_NODES.key,
                    active: true,
                    data: response.success.result
                };
                this.LOG.debug('Pushing event for item created : ' + searchModel.indexName);
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
    }
};