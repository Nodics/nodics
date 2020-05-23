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
        this.LOG.debug('Validating get request ');
        let searchOptions = request.searchOptions || {};
        if (!request.schemaModel) {
            process.error(request, response, new CLASSES.NodicsError('ERR_FIND_00003', 'Model not available within tenant: ' + request.tenant));
        } else if (searchOptions && searchOptions.projection && !UTILS.isObject(searchOptions.projection)) {
            process.error(request, response, new CLASSES.NodicsError('ERR_FIND_00003', 'Invalid projection object'));
        } else if (searchOptions && searchOptions.sort && !UTILS.isObject(searchOptions.sort)) {
            process.error(request, response, new CLASSES.NodicsError('ERR_FIND_00003', 'Invalid sort object'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    checkAccess: function (request, response, process) {
        this.LOG.debug('Checking model access');
        let rawSchema = request.schemaModel.rawSchema;
        if (SERVICE.DefaultSchemaAccessHandlerService.getAccessPoint(request.authData, rawSchema.accessGroups) >= CONFIG.get('accessPoint').readAccessPoint) {
            process.nextSuccess(request, response);
        } else {
            process.error(request, response, new CLASSES.NodicsError('ERR_AUTH_00003', 'current user do not have access to this resource'));
        }
    },
    buildQuery: function (request, response, process) {
        this.LOG.debug('Building query');
        request.options = request.options || {};
        process.nextSuccess(request, response);
    },
    buildOptions: function (request, response, process) {
        this.LOG.debug('Building query searchOptions');
        let inputOptions = request.searchOptions || {};
        request.query = request.query || {};
        let pageSize = inputOptions.pageSize || CONFIG.get('defaultPageSize');
        let pageNumber = inputOptions.pageNumber || CONFIG.get('defaultPageNumber');
        pageNumber = pageNumber ? (pageNumber <= 0) ? 0 : pageNumber - 1 : 0;
        inputOptions.limit = pageSize;
        inputOptions.skip = pageSize * pageNumber;
        inputOptions.explain = inputOptions.explain || false;
        inputOptions.snapshot = inputOptions.snapshot || false;
        if (inputOptions.timeout === true) {
            inputOptions.timeout = true;
            inputOptions.maxTimeMS = maxTimeMS || CONFIG.get('queryMaxTimeMS');
        }
        request.searchOptions = inputOptions;
        process.nextSuccess(request, response);
    },
    lookupCache: function (request, response, process) {
        if (request.schemaModel.cache &&
            request.schemaModel.cache.enabled) {
            request.cacheKeyHash = SERVICE.DefaultCacheConfigurationService.createItemKey(request);
            this.LOG.debug('Model cache lookup for key: ' + request.cacheKeyHash);
            SERVICE.DefaultCacheService.get({
                moduleName: request.moduleName || request.schemaModel.moduleName,
                channelName: SERVICE.DefaultCacheService.getSchemaCacheChannel(request.schemaModel.schemaName),
                key: request.cacheKeyHash
            }).then(value => {
                this.LOG.debug('Fulfilled from model cache');
                process.stop(request, response, {
                    code: 'SUC_FIND_00000',
                    cache: 'item hit',
                    result: value.result
                });
            }).catch(error => {
                if (error.code === 'ERR_CACHE_00001') {
                    process.nextSuccess(request, response);
                } else if (error.code === 'ERR_CACHE_00006') {
                    this.LOG.warn(error.toJson(false));
                    process.nextSuccess(request, response);
                } else {
                    process.error(request, response, error);
                }
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    applyPreInterceptors: function (request, response, process) {
        this.LOG.debug('Applying pre get model interceptors');
        let interceptors = {};
        let baseSchemas = request.schemaModel.rawSchema.parents;
        if (baseSchemas && baseSchemas.length > 0) {
            baseSchemas.push(request.schemaModel.schemaName);
        } else {
            baseSchemas = [request.schemaModel.schemaName];
        }
        baseSchemas.forEach(schemaName => {
            interceptors = _.merge(interceptors, SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors(schemaName));
        });
        if (interceptors && interceptors.preGet) {
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.preGet), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_FIND_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    applyPreValidators: function (request, response, process) {
        this.LOG.debug('Applying pre model validator');
        let validators = {};
        let baseSchemas = request.schemaModel.rawSchema.parents;
        if (baseSchemas && baseSchemas.length > 0) {
            baseSchemas.push(request.schemaModel.schemaName);
        } else {
            baseSchemas = [request.schemaModel.schemaName];
        }
        baseSchemas.forEach(schemaName => {
            validators = _.merge(validators, SERVICE.DefaultDatabaseConfigurationService.getSchemaValidators(request.tenant, schemaName));
        });
        if (validators && validators.preGet) {
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.preGet), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_FIND_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    executeQuery: function (request, response, process) {
        this.LOG.debug('Executing get query');
        request.schemaModel.getItems(request).then(result => {
            response.success = {
                code: 'SUC_FIND_00000',
                cache: 'item mis',
                result: result
            };
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    populateSubModels: function (request, response, process) {
        this.LOG.debug('Populating sub models');
        let rawSchema = request.schemaModel.rawSchema;
        let inputOptions = request.options || {};

        if (response.success.result.length > 0 && inputOptions.recursive && !UTILS.isBlank(rawSchema.refSchema)) {
            this.populateModels(request, response, response.success.result, 0).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    populateVirtualProperties: function (request, response, process) {
        this.LOG.debug('Populating virtual properties');
        let virtualProperties = request.schemaModel.rawSchema.virtualProperties;
        if (response.success.result && virtualProperties && !UTILS.isBlank(virtualProperties)) {
            SERVICE.DefaultSchemaVirtualPropertiesHandlerService.populateVirtualProperties(virtualProperties, response.success.result);
            process.nextSuccess(request, response);
        } else {
            process.nextSuccess(request, response);
        }
    },
    applyPostValidators: function (request, response, process) {
        this.LOG.debug('Applying post model validator');
        let validators = {};
        let baseSchemas = request.schemaModel.rawSchema.parents;
        if (baseSchemas && baseSchemas.length > 0) {
            baseSchemas.push(request.schemaModel.schemaName);
        } else {
            baseSchemas = [request.schemaModel.schemaName];
        }
        baseSchemas.forEach(schemaName => {
            validators = _.merge(validators, SERVICE.DefaultDatabaseConfigurationService.getSchemaValidators(request.tenant, schemaName));
        });
        if (validators && validators.postGet) {
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.postGet), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_FIND_00006'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    applyPostInterceptors: function (request, response, process) {
        this.LOG.debug('Applying post model interceptors');
        let interceptors = {};
        let baseSchemas = request.schemaModel.rawSchema.parents;
        if (baseSchemas && baseSchemas.length > 0) {
            baseSchemas.push(request.schemaModel.schemaName);
        } else {
            baseSchemas = [request.schemaModel.schemaName];
        }
        baseSchemas.forEach(schemaName => {
            interceptors = _.merge(interceptors, SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors(schemaName));
        });
        if (interceptors && interceptors.postGet) {
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.postGet), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_FIND_00006'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    updateCache: function (request, response, process) {
        this.LOG.debug('Updating cache for new Items');
        if (UTILS.isItemCashable(response.success.result, request.schemaModel)) {
            SERVICE.DefaultCacheService.put({
                moduleName: request.moduleName || request.schemaModel.moduleName,
                channelName: SERVICE.DefaultCacheService.getSchemaCacheChannel(request.schemaModel.schemaName),
                key: request.cacheKeyHash,
                value: response.success.result,
                ttl: request.schemaModel.cache.ttl
            }).then(success => {
                this.LOG.info('Item saved in item cache');
            }).catch(error => {
                this.LOG.error('While saving item in item cache : ', error);
            });
        }
        process.nextSuccess(request, response);
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
            if (model[property] && (request.options.recursive === true || request.options.recursive[property])) {
                let refSchema = request.schemaModel.rawSchema.refSchema;
                let propertyObject = refSchema[property];
                if (propertyObject.enabled) {
                    let query = {};
                    let searchOptions = _.merge(_.merge({}, request.searchOptions || {}), propertyObject.searchOptions || {});
                    if (propertyObject.type === 'one') {
                        if (propertyObject.propertyName === '_id') {
                            query[propertyObject.propertyName] = SERVICE.DefaultDatabaseConfigurationService.toObjectId(request.schemaModel, model[property]);
                        } else {
                            query[propertyObject.propertyName] = model[property];
                        }
                    } else {
                        if (propertyObject.propertyName === '_id') {
                            query[propertyObject.propertyName] = {
                                '$in': model[property].map(id => {
                                    return SERVICE.DefaultDatabaseConfigurationService.toObjectId(request.schemaModel, id);
                                })
                            };
                        } else {
                            query[propertyObject.propertyName] = {
                                '$in': model[property]
                            };
                        }
                    }
                    SERVICE['Default' + propertyObject.schemaName.toUpperCaseFirstChar() + 'Service'].get({
                        tenant: request.tenant,
                        authData: request.authData,
                        options: request.options,
                        searchOptions: searchOptions,
                        query: query
                    }).then(success => {
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
                    _self.populateProperties(request, response, model, propertiesList).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }
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
    }
};