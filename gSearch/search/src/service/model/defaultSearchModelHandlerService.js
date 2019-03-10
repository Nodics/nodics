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

    prepareSearchModels: function (modules = Object.keys(NODICS.getModules())) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (modules && modules.length > 0) {
                    let moduleName = modules.shift();
                    let moduleObject = NODICS.getModule(moduleName);
                    if (!moduleObject.searchModels) {
                        moduleObject.searchModels = {};
                    }
                    _self.prepareModuleSearchModels(moduleName).then(success => {
                        _self.prepareSearchModels(modules).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            } catch (error) {
                _self.LOG.error('Failed while loading search schema from schema definitions');
                _self.LOG.error(error);
                reject(error);
            }
        });
    },

    prepareModuleSearchModels: function (moduleName, tenants = NODICS.getTenants()) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (moduleName && tenants && tenants.length > 0) {
                    let tntCode = tenants.shift();
                    let moduleObject = NODICS.getModule(moduleName);
                    if (!moduleObject.searchModels[tntCode]) {
                        moduleObject.searchModels[tntCode] = {};
                    }
                    let searchEngine = SERVICE.DefaultSearchConfigurationService.getTenantSearchEngine(moduleName, tntCode);
                    if (searchEngine && searchEngine.getOptions() && searchEngine.getOptions().enabled) {
                        _self.prepareTenantSearchModels(moduleName, tntCode).then(success => {
                            _self.prepareModuleSearchModels(moduleName, tenants).then(success => {
                                resolve(true);
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        //_self.LOG.warn('Search is not enabled for module: ' + moduleName + ', tenant: ' + tntCode);
                        resolve(true);
                    }
                } else {
                    resolve(true);
                }
            } catch (error) {
                _self.LOG.error('Failed while loading search schema from schema definitions');
                _self.LOG.error(error);
                reject(error);
            }
        });
    },

    prepareTenantSearchModels: function (moduleName, tntCode) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let searchEngine = SERVICE.DefaultSearchConfigurationService.getTenantSearchEngine(moduleName, tntCode);
                if (searchEngine && searchEngine.getOptions() && searchEngine.getOptions().enabled) {
                    let rawSearchModelDef = SERVICE.DefaultSearchConfigurationService.getRawSearchModelDefinition(searchEngine.getOptions().engine);
                    let moduleTenantSearchRawSchema = SERVICE.DefaultSearchConfigurationService.getRawSearchSchema(moduleName, tntCode);
                    let moduleObject = NODICS.getModule(moduleName);
                    if (moduleObject && moduleTenantSearchRawSchema && !UTILS.isBlank(moduleTenantSearchRawSchema)) {
                        let indexList = [];
                        let indexTypes = Object.keys(moduleTenantSearchRawSchema);
                        for (let count = 0; count < indexTypes.length; count++) {
                            let typeName = indexTypes[count];
                            let typeDef = moduleTenantSearchRawSchema[typeName];
                            let searchModelName = typeName.toUpperCaseFirstChar() + 'SearchModel';
                            let searchModel = {
                                moduleName: moduleName,
                                tntCode: tntCode,
                                searchEngine: searchEngine,
                                indexName: typeDef.indexName,
                                typeName: typeName,
                                typeDef: typeDef,
                                LOG: SERVICE.DefaultLoggerService.createLogger(searchModelName)
                            };
                            _self.registerSearchModels(rawSearchModelDef.default, searchModel);
                            _self.registerSearchModels(rawSearchModelDef[moduleName], searchModel);
                            _self.registerSearchModels(rawSearchModelDef[typeName], searchModel);
                            moduleObject.searchModels[tntCode][searchModelName] = searchModel;
                            if (typeDef.schemaName) {
                                let collection = NODICS.getModels(moduleName, tntCode)[typeDef.schemaName.toUpperCaseFirstChar() + 'Model'];
                                if (collection) {
                                    collection.searchModelName = searchModelName;
                                    collection.typeName = typeName;
                                }
                            }

                            if (!indexList.includes(typeDef.indexName) && !searchEngine.isActiveIndex(typeDef.indexName)) {
                                indexList.push(_self.createIndex(searchEngine, typeDef.indexName));
                            }
                        }
                        if (indexList.length > 0) {
                            Promise.all(indexList).then(success => {
                                resolve(true);
                            }).catch(error => {
                                reject(error);
                            });
                        } else {
                            resolve(true);
                        }
                    } else {
                        resolve(true);
                    }
                } else {
                    //_self.LOG.warn('Search is not enabled for module: ' + moduleName + ', tenant: ' + tntCode);
                    resolve(true);
                }
            } catch (error) {
                _self.LOG.error('Failed while loading search schema from schema definitions');
                _self.LOG.error(error);
                throw error;
            }
        });
    },

    registerSearchModels: function (defaultSearchModelDef, modelSchema) {
        if (defaultSearchModelDef) {
            Object.keys(defaultSearchModelDef).forEach(element => {
                defaultSearchModelDef[element](modelSchema);
            });
        }
    },

    createIndex: function (searchEngine, indexName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                _self.LOG.debug('Creating index for indexName: ' + indexName);
                searchEngine.getConnection().indices.create({
                    index: indexName
                }, function (error, response) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(response);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    },

    updateIndexesMapping: function (modules = Object.keys(NODICS.getModules())) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (modules && modules.length > 0) {
                    let moduleName = modules.shift();
                    let moduleObject = NODICS.getModule(moduleName);
                    if (!moduleObject.searchModels) {
                        moduleObject.searchModels = {};
                    }
                    _self.updateModuleIndexesMapping(moduleName).then(success => {
                        _self.updateIndexesMapping(modules).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            } catch (error) {
                _self.LOG.error('Failed while loading search schema from schema definitions');
                _self.LOG.error(error);
                reject(error);
            }
        });
    },

    updateModuleIndexesMapping: function (moduleName, tenants = NODICS.getTenants()) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (moduleName && tenants && tenants.length > 0) {
                    let tntCode = tenants.shift();
                    let moduleObject = NODICS.getModule(moduleName);
                    if (!moduleObject.searchModels[tntCode]) {
                        moduleObject.searchModels[tntCode] = {};
                    }
                    let searchEngine = SERVICE.DefaultSearchConfigurationService.getTenantSearchEngine(moduleName, tntCode);
                    if (searchEngine && searchEngine.getOptions() && searchEngine.getOptions().enabled) {
                        let searchModels = NODICS.getSearchModels(moduleName, tntCode);
                        if (searchModels && !UTILS.isBlank(searchModels)) {
                            _self.updateIndexTypeMapping({
                                searchModelsName: Object.keys(searchModels),
                                moduleName: moduleName,
                                tntCode: tntCode,
                                searchEngine: searchEngine
                            }).then(success => {
                                _self.updateModuleIndexesMapping(moduleName, tenants).then(success => {
                                    resolve(true);
                                }).catch(error => {
                                    reject(error);
                                });
                            }).catch(error => {
                                reject(error);
                            });
                        } else {
                            resolve(true);
                        }
                    } else {
                        _self.LOG.warn('Search is not enabled for module: ' + moduleName + ', tenant: ' + tntCode);
                        resolve(true);
                    }
                } else {
                    resolve(true);
                }
            } catch (error) {
                _self.LOG.error('Failed while loading search schema from schema definitions');
                _self.LOG.error(error);
                reject(error);
            }
        });
    },

    updateIndexTypeMapping: function (options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (options.searchModelsName && options.searchModelsName.length > 0) {
                    let searchModelName = options.searchModelsName.shift();
                    let searchModel = NODICS.getSearchModels(options.moduleName, options.tntCode)[searchModelName];
                    if (searchModel) {
                        let typeDef = searchModel.typeDef;
                        let indexName = searchModel.indexName;
                        let typeName = searchModel.typeName;
                        if (SERVICE[options.searchEngine.getOptions().schemaHandler].prepareTypeSchema) {
                            SERVICE[options.searchEngine.getOptions().schemaHandler].prepareTypeSchema({
                                typeName: typeName,
                                typeDef: typeDef
                            }).then(schemaDef => {
                                if (schemaDef && !UTILS.isBlank(schemaDef)) {
                                    searchModel.doUpdateMapping({
                                        searchSchema: schemaDef
                                    }).then(success => {
                                        // searchModel.doGetMapping({}).then(success => {
                                        //     console.log('Got Mapping: ', success);
                                        // }).catch(error => {
                                        //     console.log(error);
                                        // });
                                        _self.updateIndexTypeMapping(options).then(success => {
                                            resolve(true);
                                        }).catch(error => {
                                            reject(error);
                                        });
                                    }).catch(error => {
                                        reject(error);
                                    });
                                } else {
                                    _self.LOG.warn('Got blank schema definition to update mapping for typeName: ' + typeName);
                                    _self.updateIndexTypeMapping(options).then(success => {
                                        resolve(true);
                                    }).catch(error => {
                                        reject(error);
                                    });
                                }
                            }).catch(error => {
                                reject(error);
                            });
                        } else {
                            reject('Please validate your schema handler, looks definitions is not fine: could not found prepareTypeSchema function');
                        }
                    } else {
                        _self.LOG.error('Invalid search model definition for typeName: ' + typeName + ', module: ' + options.moduleName + ', tenant: ' + options.tntCode);
                        reject('Invalid search model definition for typeName: ' + typeName + ', module: ' + options.moduleName + ', tenant: ' + options.tntCode);
                    }
                } else {
                    resolve(true);
                }
            } catch (error) {
                _self.LOG.error('Failed while loading search schema from schema definitions');
                _self.LOG.error(error);
                reject(error);
            }
        });
    }
};