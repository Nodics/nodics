/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const ObjectId = require('mongodb').ObjectId;

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
        this.LOG.debug('Validating get request: ');
        let options = request.options;
        if (!request.collection) {
            process.error(request, response, {
                success: false,
                code: 'ERR_FIND_00001',
                msg: 'Model not available within tenant: ' + request.tenant
            });
        } else if (options && options.projection) {
            if (!UTILS.isObject(options.projection)) {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_FIND_00001'
                });
            }
        } else if (options && options.sort) {
            if (!UTILS.isObject(options.sort)) {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_FIND_00002'
                });
            }
        } else {
            process.nextSuccess(request, response);
        }
    },

    buildOptions: function (request, response, process) {
        this.LOG.debug('Building query options');
        let inputOptions = request.options || {};
        request.query = request.query || {};
        let pageSize = inputOptions.pageSize || CONFIG.get('defaultPageSize');
        let pageNumber = inputOptions.pageNumber || CONFIG.get('defaultPageNumber');
        inputOptions.limit = pageSize;
        inputOptions.skip = pageSize * pageNumber;
        inputOptions.explain = inputOptions.explain || false;
        inputOptions.snapshot = inputOptions.snapshot || false;

        if (inputOptions.timeout === true) {
            inputOptions.timeout = true;
            inputOptions.maxTimeMS = maxTimeMS || CONFIG.get('queryMaxTimeMS');
        }
        request.options = inputOptions;
        process.nextSuccess(request, response);
    },

    lookupCache: function (request, response, process) {
        let moduleObject = NODICS.getModules()[request.collection.moduleName];
        if (moduleObject.itemCache &&
            request.collection.cache &&
            request.collection.cache.enabled) {
            request.cacheKeyHash = SERVICE.DefaultCacheService.createItemKey(request);
            this.LOG.debug('Model cache lookup for key: ', request.cacheKeyHash);
            SERVICE.DefaultCacheService.get({
                cache: moduleObject.itemCache,
                hashKey: request.cacheKeyHash,
                options: request.collection.cache
            }).then(value => {
                this.LOG.debug('Fulfilled from model cache');
                process.stop(request, response, {
                    success: true,
                    code: 'SUC_FIND_00000',
                    cache: 'item hit',
                    result: value.result
                });
            }).catch(error => {
                if (error.code === 'ERR_CACHE_00001') {
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
        let moduleName = request.moduleName || request.collection.moduleName;
        let schemaName = request.collection.schemaName;
        let interceptors = SERVICE.DefaultDatabaseConfigurationService.getInterceptors(moduleName, schemaName);
        if (interceptors && interceptors.preGet) {
            let interceptorRequest = {
                collection: request.collection,
                tenant: request.tenant,
                query: request.query,
                options: request.options
            };
            let interceptorResponse = {};
            SERVICE.DefaultInterceptorHandlerService.executeInterceptors([].concat(interceptors.preGet), interceptorRequest, interceptorResponse).then(success => {
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
        this.LOG.debug('Executing get query');
        request.collection.getItems(request).then(result => {
            response.success = {
                success: true,
                code: 'SUC_FIND_00000',
                cache: 'item mis',
                result: result
            };
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, {
                success: false,
                code: 'ERR_FIND_00000',
                error: error
            });
        });
    },

    populateSubModels: function (request, response, process) {
        this.LOG.debug('Populating sub models');
        let rawSchema = request.collection.rawSchema;
        let inputOptions = request.options || {};

        if (response.success.result.length > 0 &&
            inputOptions.recursive === true &&
            !UTILS.isBlank(rawSchema.refSchema)) {
            this.populateModels(request, response, response.success.result, 0).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_FIND_00003',
                    error: error
                });
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    populateVirtualProperties: function (request, response, process) {
        this.LOG.debug('Populating virtual properties');
        SERVICE.DefaultVirtualPropertiesHandlerService.populateVirtualProperties(request.collection.rawSchema, response.success.result);
        process.nextSuccess(request, response);
    },

    applyPostInterceptors: function (request, response, process) {
        this.LOG.debug('Applying post model interceptors');
        let moduleName = request.moduleName || request.collection.moduleName;
        let schemaName = request.collection.schemaName;
        let interceptors = SERVICE.DefaultDatabaseConfigurationService.getInterceptors(moduleName, schemaName);
        if (interceptors && interceptors.postGet) {
            let interceptorRequest = {
                collection: request.collection,
                tenant: request.tenant,
                query: request.query,
                options: request.options,
                result: response.success
            };
            let interceptorResponse = {};
            SERVICE.DefaultInterceptorHandlerService.executeInterceptors([].concat(interceptors.postGet), interceptorRequest, interceptorResponse).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                response.error = {
                    success: false,
                    code: 'ERR_FIND_00005',
                    error: error
                };
                process.error(request, response);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    updateCache: function (request, response, process) {
        this.LOG.debug('Updating cache for new Items');
        let moduleObject = NODICS.getModules()[request.collection.moduleName];
        if (UTILS.isItemCashable(response.success.result, request.collection) && moduleObject.itemCache) {
            if (request.collection.cache.ttl === undefined) {
                request.collection.cache.ttl = moduleObject.itemCache.config.ttl || 0;
            }
            this.LOG.debug('Model cache store for key: ', request.cacheKeyHash);
            SERVICE.DefaultCacheService.put({
                cache: moduleObject.itemCache,
                hashKey: request.cacheKeyHash,
                value: response.success.result,
                options: request.collection.cache
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
                _self.populateProperties(request, response, model, Object.keys(request.collection.rawSchema.refSchema)).then(success => {
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
                let refSchema = request.collection.rawSchema.refSchema;
                let propertyObject = refSchema[property];
                let query = {};
                if (propertyObject.type === 'one') {
                    if (propertyObject.propertyName === '_id') {
                        query[propertyObject.propertyName] = UTILS.isObjectId(model[property]) ? model[property] : ObjectId(model[property]);
                    } else {
                        query[propertyObject.propertyName] = model[property];
                    }
                } else {
                    if (propertyObject.propertyName === '_id') {
                        query[propertyObject.propertyName] = {
                            '$in': UTILS.isObjectId(model[property]) ? model[property] : ObjectId(model[property])
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

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        response.success.msg = SERVICE.DefaultStatusService.get(response.success.code || 'SUC_SYS_00000').message;
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed and got errors');
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