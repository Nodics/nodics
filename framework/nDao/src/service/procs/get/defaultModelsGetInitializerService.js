/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating get request: ');
        let options = request.options;
        if (options && options.projection) {
            if (!UTILS.isObject(options.projection)) {
                process.error(request, response, 'Invalid select value');
            }
        } else if (options && options.sort) {
            if (!UTILS.isObject(options.sort)) {
                process.error(request, response, 'Invalid sort value');
            }
        } else {
            process.nextSuccess(request, response);
        }
    },

    buildOptions: function (request, response, process) {
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

    lookupCache: function (request, response, process) {
        this.LOG.debug('Item lookup into cache system : ', request.collection.moduleName);
        let moduleObject = NODICS.getModules()[request.collection.moduleName];
        if (moduleObject.itemCache &&
            request.collection.rawSchema.cache &&
            request.collection.rawSchema.cache.enabled) {
            request.cacheKeyHash = SERVICE.DefaultCacheService.createItemKey(request);
            let input = {
                tenant: request.tenant,
                schemaName: request.collection.schemaName,
                moduleName: request.collection.moduleName,
                moduleObject: moduleObject,
                cacheClient: moduleObject.itemCache,
                hashKey: request.cacheKeyHash,
            };
            SERVICE.DefaultCacheService.get(input).then(value => {
                this.LOG.info('Fulfilled from Item cache : ');
                if (value && UTILS.isArray(value)) {
                    value.forEach(element => {
                        response.success.push(element);
                    });
                } else {
                    response.success.push(value);
                }
                process.stop(request, response);
            }).catch(error => {
                response.errors.push(error);
                process.nextSuccess(request, response);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    applyPreInterceptors: function (request, response, process) {
        this.LOG.debug('Applying pre model interceptors');
        let moduleName = request.moduleName || request.collection.moduleName;
        let modelName = request.collection.modelName;
        let interceptors = NODICS.getInterceptors(moduleName, modelName);
        if (interceptors && interceptors.preGet) {
            SERVICE.DefaultInterceptorHandlerService.executeInterceptors(
                request,
                response,
                request.success,
                [].concat(interceptors.preGet)).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
        } else {
            process.nextSuccess(request, response);
        }
    },

    executeQuery: function (request, response, process) {
        this.LOG.debug('Executing query');
        request.collection.getItems(request).then(result => {
            if (result && UTILS.isArray(result)) {
                result.forEach(element => {
                    response.success.push(element);
                });
            } else {
                response.success.push(result);
            }
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    populateSubModels: function (request, response, process) {
        this.LOG.debug('Populating sub models');
        let rawSchema = request.collection.rawSchema;
        let inputOptions = request.options || {};
        if (response.success &&
            response.success.length > 0 &&
            inputOptions.recursive === true &&
            !UTILS.isBlank(rawSchema.refSchema)) {
            this.populateModels(request, response, response.success, 0).then(success => {
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
        SERVICE.DefaultVirtualPropertiesHandlerService.populateVirtualProperties(request.collection.rawSchema, response.success);
        process.nextSuccess(request, response);
    },

    applyPostInterceptors: function (request, response, process) {
        this.LOG.debug('Applying post model interceptors');
        let moduleName = request.moduleName || request.collection.moduleName;
        let modelName = request.collection.modelName;
        let interceptors = NODICS.getInterceptors(moduleName, modelName);
        if (interceptors && interceptors.postGet) {
            SERVICE.DefaultInterceptorHandlerService.executeInterceptors(
                request,
                response,
                request.success,
                [].concat(interceptors.postGet)).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
        } else {
            process.nextSuccess(request, response);
        }
    },

    updateCache: function (request, response, process) {
        this.LOG.debug('Updating cache for new Items');
        let moduleObject = NODICS.getModules()[request.collection.moduleName];
        if (response.success &&
            response.success.length > 0 &&
            request.cacheKeyHash &&
            moduleObject.itemCache &&
            request.collection.rawSchema.cache &&
            request.collection.rawSchema.cache.enabled) {
            let input = {
                tenant: request.tenant,
                schemaName: request.collection.schemaName,
                moduleName: request.collection.moduleName,
                moduleObject: moduleObject,
                cacheClient: moduleObject.itemCache,
                hashKey: request.cacheKeyHash,
                docs: response.success,
                itemCacheOptions: request.collection.rawSchema.cache
            };
            SERVICE.DefaultCacheService.put(input).then(success => {
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
                _self.populateProperties(
                    request,
                    response,
                    model,
                    Object.keys(request.collection.rawSchema.refSchema)).then(success => {
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
                    query[propertyObject.propertyName] = model[property];
                } else {
                    query[propertyObject.propertyName] = {
                        '$in': model[property]
                    };
                }
                let input = {
                    tenant: request.tenant,
                    options: {
                        query: query
                    }
                };
                SERVICE['Default' + propertyObject.schemaName.toUpperCaseFirstChar() + 'Service'].get(input).then(result => {
                    if (result.length > 0) {
                        if (propertyObject.type === 'one') {
                            model[property] = result[0];
                        } else {
                            model[property] = result;
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
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed and got errors');
        process.reject(response.errors);
    }
};