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
                        _self.prepareTypeSearchModels({
                            moduleObject: moduleObject,
                            moduleTenantSearchRawSchema: moduleTenantSearchRawSchema,
                            rawSearchModelDef: rawSearchModelDef,
                            moduleName: moduleName,
                            tntCode: tntCode,
                            searchEngine: searchEngine,
                            indexNames: Object.keys(moduleTenantSearchRawSchema)
                        }).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
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
                reject(error);
            }
        });
    },
    prepareTypeSearchModels: function (options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (options.indexNames && options.indexNames.length > 0) {
                    let indexName = options.indexNames.shift();
                    let indexDef = options.moduleTenantSearchRawSchema[indexName];
                    let searchModelName = indexName.toUpperCaseFirstChar() + 'SearchModel';
                    let searchModel = {
                        moduleName: options.moduleName,
                        tntCode: options.tntCode,
                        searchEngine: options.searchEngine,
                        indexName: indexDef.indexName || indexName,
                        typeName: indexDef.typeName || indexDef.indexName || indexName,
                        indexDef: indexDef,
                        LOG: SERVICE.DefaultLoggerService.createLogger(searchModelName)
                    };
                    _self.registerSearchModels(options.rawSearchModelDef.default, searchModel);
                    _self.registerSearchModels(options.rawSearchModelDef[options.moduleName], searchModel);
                    _self.registerSearchModels(options.rawSearchModelDef[indexDef.indexName], searchModel);
                    options.moduleObject.searchModels[options.tntCode][searchModelName] = searchModel;
                    if (indexDef.schemaName) {
                        let schemaModel = NODICS.getModels(options.moduleName, options.tntCode)[indexDef.schemaName.toUpperCaseFirstChar() + 'Model'];
                        if (schemaModel) {
                            schemaModel.searchModelName = searchModelName;
                            schemaModel.indexName = indexDef.indexName;
                            schemaModel.typeName = indexDef.typeName;
                        }
                    }
                    if (!options.searchEngine.isActiveIndex(indexDef.indexName)) {
                        _self.createIndex(options.searchEngine, indexDef.indexName).then(success => {
                            _self.prepareTypeSearchModels(options).then(success => {
                                resolve(true);
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        _self.prepareTypeSearchModels(options).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
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
                        searchEngine.addIndex(indexName, {});
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
                        let indexDef = searchModel.indexDef;
                        let indexName = searchModel.indexName;
                        let typeName = searchModel.typeName;
                        let indexObj = options.searchEngine.getIndex(indexName);
                        if (indexObj && indexObj.mappings && indexObj.mappings[typeName]) {
                            _self.LOG.debug('Mapping already available for indexName: ' + indexName);
                            _self.updateIndexTypeMapping(options).then(success => {
                                resolve(true);
                            }).catch(error => {
                                reject(error);
                            });
                        } else {
                            if (SERVICE[options.searchEngine.getOptions().schemaHandler].prepareTypeSchema) {
                                SERVICE[options.searchEngine.getOptions().schemaHandler].prepareTypeSchema({
                                    indexName: indexName,
                                    indexDef: indexDef
                                }).then(schemaDef => {
                                    if (schemaDef && !UTILS.isBlank(schemaDef)) {
                                        searchModel.doUpdateMapping({
                                            searchSchema: schemaDef
                                        }).then(success => {
                                            _self.updateIndexTypeMapping(options).then(success => {
                                                resolve(true);
                                            }).catch(error => {
                                                reject(error);
                                            });
                                        }).catch(error => {
                                            reject(error);
                                        });
                                    } else {
                                        _self.LOG.warn('Got blank schema definition to update mapping for indexName: ' + indexName);
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
                        }
                    } else {
                        _self.LOG.error('Invalid search model definition for indexName: ' + indexName + ', module: ' + options.moduleName + ', tenant: ' + options.tntCode);
                        reject('Invalid search model definition for indexName: ' + indexName + ', module: ' + options.moduleName + ', tenant: ' + options.tntCode);
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