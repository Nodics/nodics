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

    travelModels: function (options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let rawSchema = options.request.schemaModel.rawSchema;
            let model = options.models[options.index];
            if (model && !UTILS.isBlank(rawSchema.refSchema)) {
                options.callback({
                    request: options.request,
                    response: options.response,
                    model: model,
                    propertiesList: Object.keys(options.request.schemaModel.rawSchema.refSchema),
                    callback: options.callback
                }).then(success => {
                    options.index = options.index + 1;
                    _self.travelModels(options).then(success => {
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
    saveNestedModels: function (options) {
        return new Promise((resolve, reject) => {
            try {
                if (options.propertiesList.length > 0) {
                    let request = options.request;
                    let response = options.response;
                    let model = options.model;
                    let propertiesList = options.propertiesList;
                    let property = propertiesList.shift();
                    let propertyObject = request.schemaModel.rawSchema.refSchema[property];
                    let models = model[property];
                    if (propertyObject.enabled && models && ((UTILS.isObject(models) && !UTILS.isObjectId(models)) || UTILS.isArrayOfObject(models))) {
                        if (propertyObject.type === 'one') models = [models];
                        SERVICE['Default' + propertyObject.schemaName.toUpperCaseFirstChar() + 'Service'].saveAll({
                            tenant: request.tenant,
                            authData: request.authData,
                            searchOptions: request.searchOptions,
                            options: request.options,
                            models: models
                        }).then(success => {
                            if (success.result && success.result.length > 0) {
                                if (propertyObject.type === 'one') {
                                    let key = (propertyObject.propertyName) ? success.result[0][propertyObject.propertyName] : success.result[0]._id;
                                    if (UTILS.isObjectId(key)) {
                                        key = key.toString();
                                    }
                                    model[property] = key;
                                } else {
                                    model[property] = [];
                                    success.result.forEach(element => {
                                        let key = (propertyObject.propertyName) ? element[propertyObject.propertyName] : element._id;
                                        if (UTILS.isObjectId(key)) {
                                            key = key.toString();
                                        }
                                        model[property].push(key);
                                    });
                                }
                                SERVICE.DefaultModelService.saveNestedModels(options).then(success => {
                                    resolve(true);
                                }).catch(error => {
                                    reject(error);
                                });
                            } else {
                                let error = new CLASSES.NodicsError('ERR_SAVE_00007');
                                if (success.errors && success.errors.length > 0) {
                                    success.errors.forEach(err => {
                                        error.add(err);
                                    });
                                }
                                reject(error);
                            }
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        SERVICE.DefaultModelService.saveNestedModels(options).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(error);
            }
        });
    },
    populateNestedModels: function (options) {
        return new Promise((resolve, reject) => {
            if (options.propertiesList.length > 0) {
                let request = options.request;
                let model = options.model;
                let propertiesList = options.propertiesList;
                let property = propertiesList.shift();
                let propertyObject = request.schemaModel.rawSchema.refSchema[property];
                if (propertyObject.enabled && model[property] && (request.options.recursive === true || request.options.recursive[property])) {
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
                    let input = {
                        tenant: request.tenant,
                        authData: request.authData,
                        options: request.options,
                        searchOptions: request.searchOptions,
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
                        SERVICE.DefaultModelService.populateNestedModels(options).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });

                } else {
                    SERVICE.DefaultModelService.populateNestedModels(options).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }
            } else {
                resolve(true);
            }
        });
    },

    removeNestedModels: function (options) {
        return new Promise((resolve, reject) => {
            if (options.propertiesList.length > 0) {
                let request = options.request;
                let model = options.model;
                let propertiesList = options.propertiesList;
                let property = propertiesList.shift();
                let propertyObject = request.schemaModel.rawSchema.refSchema[property];
                if (propertyObject.enabled && model[property] && (request.options.deepRemove === true || request.options.deepRemove[property])) {
                    let query = {};
                    if (propertyObject.type === 'one') {
                        query[propertyObject.propertyName] = model[property][propertyObject.propertyName] || model[property];
                    } else {
                        query[propertyObject.propertyName] = {
                            '$in': model[property].map(item => {
                                return item[propertyObject.propertyName] || item;
                            })
                        };
                    }
                    let input = {
                        tenant: request.tenant,
                        authData: request.authData,
                        options: request.options,
                        searchOptions: request.searchOptions,
                        query: query
                    };
                    SERVICE['Default' + propertyObject.schemaName.toUpperCaseFirstChar() + 'Service'].remove(input).then(success => {
                        SERVICE.DefaultModelService.populateNestedModels(options).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });

                } else {
                    SERVICE.DefaultModelService.populateNestedModels(options).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }
            } else {
                resolve(true);
            }
        });
    },
};
