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

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating remove request: ');
        if ((request.ids && request.ids.length > 0) || (request.codes && request.codes.length > 0)) {
            process.nextSuccess(request, response);
        } else {
            process.error(request, response, new CLASSES.NodicsError('ERR_DEL_00003', 'Invalid value for ids or codes'));
        }

    },
    checkAccess: function (request, response, process) {
        this.LOG.debug('Checking model access');
        let rawSchema = request.schemaModel.rawSchema;
        if (SERVICE.DefaultSchemaAccessHandlerService.getAccessPoint(request.authData, rawSchema.accessGroups) >= CONFIG.get('accessPoint').removeAccessPoint) {
            process.nextSuccess(request, response);
        } else {
            process.error(request, response, new CLASSES.NodicsError('ERR_AUTH_00003', 'current user do not have access to this resource'));
        }
    },
    buildQuery: function (request, response, process) {
        this.LOG.debug('Building search query & searchOptions');
        request.options = request.options || {};
        if (!request.query || UTILS.isBlank(request.query)) {
            if (request.ids && request.ids.length > 0) {
                let tmpIds = [];
                request.ids.forEach(id => {
                    tmpIds.push(SERVICE.DefaultDatabaseConfigurationService.toObjectId(request.schemaModel, id));
                });
                request.query = {
                    _id: {
                        $in: tmpIds
                    }
                };
            } else if (request.codes && request.codes.length > 0) {
                request.query = {
                    code: {
                        $in: request.codes
                    }
                };
            }
        }
        let inputOptions = request.searchOptions || {};
        inputOptions.explain = inputOptions.explain || false;
        inputOptions.explain = inputOptions.explain || false;
        inputOptions.snapshot = inputOptions.snapshot || false;

        if (inputOptions.timeout === true) {
            inputOptions.timeout = true;
            inputOptions.maxTimeMS = maxTimeMS || CONFIG.get('queryMaxTimeMS');
        }
        request.searchOptions = inputOptions;
        process.nextSuccess(request, response);
    },

    applyPreInterceptors: function (request, response, process) {
        this.LOG.debug('Applying pre update model interceptors');
        let schemaName = request.schemaModel.schemaName;
        let interceptors = SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors(schemaName);
        if (interceptors && interceptors.preRemove) {
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.preRemove), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_DEL_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    applyPreValidators: function (request, response, process) {
        this.LOG.debug('Applying pre model validator');
        let schemaName = request.schemaModel.schemaName;
        let validators = SERVICE.DefaultDatabaseConfigurationService.getSchemaValidators(request.tenant, schemaName);
        if (validators && validators.preRemove) {
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.preRemove), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_DEL_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    executeQuery: function (request, response, process) {
        this.LOG.debug('Executing remove query');
        request.schemaModel.removeItems(request).then(result => {
            response.success = {
                code: 'SUC_DEL_00000',
                result: result
            };
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    populateSubModels: function (request, response, process) {
        this.LOG.debug('Populating sub models');
        if (response.success && response.success.result && response.success.result.n &&
            response.success.result.n > 0 && response.success.result.models && options.recursive) {
            SERVICE.DefaultModelService.travelModels({
                request: request,
                response: response,
                models: response.success.result.models,
                index: 0,
                callback: SERVICE.DefaultModelService.populateNestedModels
            }).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_FIND_00003'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    applyPostValidators: function (request, response, process) {
        this.LOG.debug('Applying post model validator');
        let schemaName = request.schemaModel.schemaName;
        let validators = SERVICE.DefaultDatabaseConfigurationService.getSchemaValidators(request.tenant, schemaName);
        if (validators && validators.postRemove) {
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.postRemove), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_DEL_00006'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    applyPostInterceptors: function (request, response, process) {
        this.LOG.debug('Applying post remove model interceptors');
        if (response.success && response.success.result && response.success.result.n && response.success.result.n > 0) {
            let schemaName = request.schemaModel.schemaName;
            let interceptors = SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors(schemaName);
            if (interceptors && interceptors.postRemove) {
                SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.postRemove), request, response).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_DEL_00006'));
                });
            } else {
                process.nextSuccess(request, response);
            }
        } else {
            process.nextSuccess(request, response);
        }
    },

    invalidateRouterCache: function (request, response, process) {
        this.LOG.debug('Invalidating router cache for removed model');
        try {
            let schemaModel = request.schemaModel;
            if (response.success && response.success.result && response.success.result.n && response.success.result.n > 0) {
                SERVICE.DefaultCacheService.flushCache({
                    moduleName: schemaModel.moduleName,
                    channelName: 'router',
                    prefix: schemaModel.schemaName
                }).then(success => {
                    this.LOG.debug('Cache for router: ' + schemaModel.schemaName + ' has been flushed cuccessfully');
                }).catch(error => {
                    this.LOG.error('Cache for router: ' + schemaModel.schemaName + ' has not been flushed cuccessfully');
                    this.LOG.error(error);
                });
            }
        } catch (error) {
            this.LOG.error('Facing issue while invalidating router cache');
            this.LOG.error(error);
        }
        process.nextSuccess(request, response);
    },

    invalidateItemCache: function (request, response, process) {
        this.LOG.debug('Invalidating item cache for removed model');
        try {
            let schemaModel = request.schemaModel;
            if (response.success && response.success.result && response.success.result.n && response.success.result.n > 0 &&
                schemaModel.rawSchema.cache && schemaModel.rawSchema.cache.enabled) {
                SERVICE.DefaultCacheService.flushCache({
                    moduleName: schemaModel.moduleName,
                    channelName: 'schema',
                    prefix: schemaModel.schemaName
                }).then(success => {
                    this.LOG.debug('Cache for schema: ' + schemaModel.schemaName + ' has been flushed cuccessfully');
                }).catch(error => {
                    this.LOG.error('Cache for schema: ' + schemaModel.schemaName + ' has not been flushed cuccessfully');
                    this.LOG.error(error);
                });
            }
        } catch (error) {
            this.LOG.error('Facing issue while invalidating item cache ');
            this.LOG.error(error);
        }
        process.nextSuccess(request, response);
    },

    triggerModelChangeEvent: function (request, response, process) {
        this.LOG.debug('Triggering event for removed models');
        try {
            let schemaModel = request.schemaModel;
            if (response.success && response.success.result && schemaModel.rawSchema.event && schemaModel.rawSchema.event.enabled) {
                let event = {
                    tenant: request.tenant,
                    event: schemaModel.schemaName + 'Removed',
                    sourceName: schemaModel.moduleName,
                    sourceId: CONFIG.get('nodeId'),
                    target: schemaModel.moduleName,
                    state: "NEW",
                    type: schemaModel.rawSchema.event.type || "ASYNC",
                    targetType: schemaModel.rawSchema.event.targetType || ENUMS.TargetType.MODULE_NODES.key,
                    active: true,
                    data: {
                        schemaName: schemaModel.schemaName,
                        modelName: schemaModel.modelName,
                        result: response.success.result
                    }
                };
                this.LOG.debug('Pushing event for item created : ' + schemaModel.schemaName);
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

    handleDeepRemove: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        let rawSchema = request.schemaModel.rawSchema;
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
    }
};