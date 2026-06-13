/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module database/service/model/DefaultModelService
 * @description Handles schema-driven nested model operations for generated CRUD
 * services. It traverses `refSchema` definitions to save, populate, and remove
 * related models without hardcoding module-specific relationships.
 * @layer service
 * @owner nDatabase
 * @override Project modules may override this service to customize reference
 * traversal, recursive loading, or deep removal rules while preserving
 * schema-driven reference metadata.
 *
 * @property {Object} request.schemaModel.rawSchema.refSchema Schema reference contract.
 * @property {Object} SERVICE.DefaultDatabaseConfigurationService Converts database object ids.
 * @property {Object} SERVICE.Default<SchemaName>Service Generated schema service registry.
 */
module.exports = {

    /**
     * Initializes the nested model service.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the nested model service.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Traverses a model list and delegates reference processing to a callback.
     *
     * @param {Object} options Traversal options.
     * @param {Object[]} options.models Models to traverse.
     * @param {number} options.index Current model index.
     * @param {Object} options.request Nodics model request.
     * @param {Object} options.response Aggregated operation response.
     * @param {Function} options.callback Reference-processing callback.
     * @returns {Promise<boolean>} Resolves after traversal completes.
     */
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

    /**
     * Saves nested referenced models before the owning model is persisted.
     *
     * @param {Object} options Reference processing options.
     * @param {Object} options.request Nodics model request.
     * @param {Object} options.model Model being processed.
     * @param {string[]} options.propertiesList Mutable reference property list.
     * @returns {Promise<boolean>} Resolves after nested references are saved.
     * @sideEffects Replaces nested objects with reference ids on the parent model.
     */
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
                                    // if (UTILS.isObjectId(key)) {
                                    //     key = key.toString();
                                    // }
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
    /**
     * Populates referenced models according to recursive request options.
     *
     * @param {Object} options Reference processing options.
     * @param {Object} options.request Nodics model request.
     * @param {Object} options.model Model being processed.
     * @param {string[]} options.propertiesList Mutable reference property list.
     * @returns {Promise<boolean>} Resolves after references are populated or skipped.
     * @sideEffects Replaces reference ids with loaded model documents when requested.
     */
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

    /**
     * Removes referenced models according to deep-remove request options.
     *
     * @param {Object} options Reference processing options.
     * @param {Object} options.request Nodics model request.
     * @param {Object} options.model Model being processed.
     * @param {string[]} options.propertiesList Mutable reference property list.
     * @returns {Promise<boolean>} Resolves after nested references are removed or skipped.
     */
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
