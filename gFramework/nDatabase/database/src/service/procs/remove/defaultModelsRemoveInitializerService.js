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
        this.LOG.debug('Validating remove request: ');
        if ((request.ids && request.ids.length > 0) || (request.codes && request.codes.length > 0)) {
            process.nextSuccess(request, response);
        } else {
            process.error(request, response, new CLASSES.NodicsError('ERR_DEL_00003', 'Invalid value for ids or codes'));
        }

    },

    buildQuery: function (request, response, process) {
        this.LOG.debug('Building query options');
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
            console.log('-------------------- Item Removed Result ------------------------: ' + request.options.returnModified);
            console.log(response.success.result);
            console.log('-----------------------------------------------------------------');
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    populateSubModels: function (request, response, process) {
        this.LOG.debug('Populating sub models');
        let rawSchema = request.schemaModel.rawSchema;
        let inputOptions = request.options || {};
        if (response.success && response.success.result && response.success.result.n &&
            response.success.result.n > 0 && response.success.result.models &&
            inputOptions.recursive === true && !UTILS.isBlank(rawSchema.refSchema)) {
            this.populateModels(request, response, response.success.result.models, 0).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_FIND_00003'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    populateModels: function (request, response, models, index) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let model = models[index];
            if (model) {
                _self.populateProperties(request, response, model, Object.keys(request.schemaModel.rawSchema.refSchema)).then(success => {
                    _self.populateModels(request, response, models, index + 1).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    populateProperties: function (request, response, model, propertiesList) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let property = propertiesList.shift();
            if (model[property]) {
                let refSchema = request.schemaModel.rawSchema.refSchema;
                let propertyObject = refSchema[property];
                let query = {};
                if (propertyObject.type === 'one') {
                    if (propertyObject.propertyName === '_id') {
                        query[propertyObject.propertyName] = SERVICE.DefaultDatabaseConfigurationService.toObjectId(request.schemaModel, model[property]);
                    } else {
                        query[propertyObject.propertyName] = model[property];
                    }
                } else {
                    if (propertyObject.propertyName === '_id') {
                        query[propertyObject.propertyName] = {
                            '$in': SERVICE.DefaultDatabaseConfigurationService.toObjectId(request.schemaModel, model[property])
                        };
                    } else {
                        query[propertyObject.propertyName] = {
                            '$in': model[property]
                        };
                    }
                }
                let input = {
                    tenant: request.tenant,
                    query: query
                };
                SERVICE['Default' + propertyObject.schemaName.toUpperCaseFirstChar() + 'Service'].get(input).then(success => {
                    if (success.result.length > 0) {
                        if (propertyObject.type === 'one') {
                            model[property] = success.result[0];
                        } else {
                            model[property] = success.result;
                        }
                    } else {
                        model[property] = null;
                    }
                    if (propertiesList.length > 0) {
                        _self.populateProperties(request, response, model, propertiesList).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        resolve(true);
                    }
                }).catch(error => {
                    reject(error);
                });

            } else {
                if (propertiesList.length > 0) {
                    _self.populateProperties(request, response, model, propertiesList).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            }
        });
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

    handleWorkflowProcess: function (request, response, process) {
        try {
            let schemaModel = request.schemaModel;
            let removedModels = response.success.result.models;
            if (!request.ignoreWorkflowEvent && removedModels && removedModels.length > 0 && schemaModel.workflowCodes && schemaModel.workflowCodes.length > 0) {
                this.LOG.debug('Triggering event for workflow association');
                let event = {
                    tenant: request.tenant,
                    event: 'initiateWorkflow',
                    sourceName: schemaModel.moduleName,
                    sourceId: CONFIG.get('nodeId'),
                    target: 'workflow',
                    state: "NEW",
                    type: "SYNC",
                    targetType: ENUMS.TargetType.MODULE.key,
                    active: true,
                    data: []
                };
                schemaModel.workflowCodes.forEach(workflowCode => {
                    removedModels.forEach(removedItem => {
                        event.data.push({
                            workflowCode: workflowCode,
                            itemType: 'INTERNAL',
                            item: {
                                code: removedItem.code,
                                active: false,
                                detail: {
                                    schemaName: schemaModel.schemaName,
                                    moduleName: schemaModel.moduleName,
                                }
                            }
                        });
                    });
                });
                this.LOG.debug('Pushing event for item initialize in workflow : ' + schemaModel.schemaName);
                SERVICE.DefaultEventService.publish(event).then(success => {
                    this.LOG.debug('Workflow associated successfully');
                }).catch(error => {
                    this.LOG.error('While associating workflow : ', error);
                });
            }
        } catch (error) {
            this.LOG.error('Facing issue while pushing workflow init event : ', error);
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