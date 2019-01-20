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
     * This function is used to setup your service just after service is loaded.
     */
    init: function () {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to setup your service just before routers are getting activated.
     */
    postInit: function () {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    prepareSearchSchema: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.loadSearchSchemaFromSchema();
            _self.loadSearchSchema();
            _self.loadSearchSchemaFromDatabase().then(success => {
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },

    prepareSearchModels: function () {
        let _self = this;
        try {
            Object.keys(NODICS.getModules()).forEach(moduleName => {
                let moduleObject = NODICS.getModule(moduleName);
                if (!moduleObject.searchModels) {
                    moduleObject.searchModels = {};
                }
                _self.prepareModuleSearchModels(moduleName);
            });
        } catch (error) {
            _self.LOG.error('Failed while loading search schema from schema definitions');
            _self.LOG.error(error);
            throw error;
        }
    },

    updateIndexesMapping: function () {
        let _self = this;
        try {
            Object.keys(NODICS.getModules()).forEach(moduleName => {
                _self.updateModuleIndexesMapping(moduleName);
            });
        } catch (error) {
            _self.LOG.error('Failed while loading search schema from schema definitions');
            _self.LOG.error(error);
            throw error;
        }
    },


    loadSearchSchemaFromSchema: function () {
        let _self = this;
        try {
            Object.keys(NODICS.getModules()).forEach(moduleName => {
                _self.loadSearchSchemaForModule(moduleName);
            });
        } catch (error) {
            _self.LOG.error('Failed while loading search schema from schema definitions');
            _self.LOG.error(error);
            throw error;
        }
    },

    loadSearchSchemaForModule: function (moduleName) {
        let _self = this;
        try {
            let moduleObject = NODICS.getModule(moduleName);
            if (moduleObject && moduleObject.rawSchema) {
                _self.LOG.debug('Collecting data from module: ' + moduleName);
                Object.keys(moduleObject.rawSchema).forEach(schemaName => {
                    let rawSchema = moduleObject.rawSchema[schemaName];
                    let tenants = rawSchema.tenants || NODICS.getTenants();
                    tenants.forEach(tntCode => {
                        let searchEngine = SERVICE.DefaultSearchConfigurationService.getTenantSearchEngine(moduleName, tntCode);
                        if (searchEngine) {
                            let searchOptions = searchEngine.getOptions();
                            if (searchOptions.enabled && searchOptions.schemaHandler &&
                                SERVICE[searchOptions.schemaHandler] &&
                                SERVICE[searchOptions.schemaHandler].prepareFromSchema &&
                                typeof SERVICE[searchOptions.schemaHandler].prepareFromSchema === 'function') {
                                let searchSchema = SERVICE[searchOptions.schemaHandler].prepareFromSchema(moduleName, schemaName);
                                if (searchSchema && !UTILS.isBlank(searchSchema)) {
                                    SERVICE.DefaultSearchConfigurationService.addTenantRawSearchSchema(moduleName, tntCode, searchSchema);
                                }
                            } else {
                                _self.LOG.error('Invalid connection handler configuration for : ' + moduleName + ', tenant: ' + tntCode);
                            }
                        } else {
                            _self.LOG.error('Invalid connection handler configuration for : ' + moduleName + ', tenant: ' + tntCode);
                        }
                    });
                });
            }
        } catch (error) {
            _self.LOG.error('While collecting properties from module: ' + moduleName);
            throw error;
        }
    },

    loadSearchSchema: function () {
        let _self = this;
        try {
            let searchSchemas = {};
            SYSTEM.loadFiles('/src/search/indexes.js', searchSchemas);
            let tenants = NODICS.getTenants();
            if (!UTILS.isBlank(searchSchemas) && tenants && tenants.length > 0) {
                tenants.forEach(tntCode => {
                    Object.keys(searchSchemas).forEach(moduleName => {
                        let searchEngine = SERVICE.DefaultSearchConfigurationService.getTenantSearchEngine(moduleName, tntCode);
                        if (searchEngine) {
                            let searchOptions = searchEngine.getOptions();
                            if (searchOptions.enabled && searchOptions.schemaHandler &&
                                SERVICE[searchOptions.schemaHandler] &&
                                SERVICE[searchOptions.schemaHandler].prepareFromDefinitions &&
                                typeof SERVICE[searchOptions.schemaHandler].prepareFromDefinitions === 'function') {
                                let moduleIndexSchemas = searchSchemas[moduleName];
                                Object.keys(moduleIndexSchemas).forEach(typeName => {
                                    let source = moduleIndexSchemas[typeName];
                                    let target = SERVICE.DefaultSearchConfigurationService.getTenantRawSearchSchema(moduleName, tntCode, source.typeName || typeName);
                                    let mergedTypeSchema = SERVICE[searchOptions.schemaHandler].prepareFromDefinitions(moduleName, tntCode, source, target, typeName);
                                    if (mergedTypeSchema && !UTILS.isBlank(mergedTypeSchema)) {
                                        SERVICE.DefaultSearchConfigurationService.addTenantRawSearchSchema(moduleName, tntCode, mergedTypeSchema);
                                    }
                                });
                            } else {
                                _self.LOG.error('Invalid connection handler configuration for : ' + moduleName + ', tenant: ' + tntCode);
                            }
                        } else {
                            _self.LOG.error('Invalid connection handler configuration for : ' + moduleName + ', tenant: ' + tntCode);
                        }
                    });
                });
            }
        } catch (error) {
            _self.LOG.error('Failed while loading search schema from schema definitions');
            _self.LOG.error(error);
            throw error;
        }
    },

    loadSearchSchemaFromDatabase: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            let tenants = NODICS.getTenants();
            tenants.forEach(tntCode => {
                SERVICE.DefaultIndexerService.get({
                    tenant: tntCode,
                }).then(indexers => {
                    if (indexers && indexers.success && indexers.result && indexers.result.length > 0) {
                        indexers.result.forEach(definition => {
                            let searchEngine = SERVICE.DefaultSearchConfigurationService.getTenantSearchEngine(definition.moduleName, tntCode);
                            if (searchEngine) {
                                let searchOptions = searchEngine.getOptions();
                                if (searchOptions.enabled && searchOptions.schemaHandler &&
                                    SERVICE[searchOptions.schemaHandler] &&
                                    SERVICE[searchOptions.schemaHandler].prepareFromDefinitions &&
                                    typeof SERVICE[searchOptions.schemaHandler].prepareFromDefinitions === 'function') {
                                    let target = SERVICE.DefaultSearchConfigurationService.getTenantRawSearchSchema(definition.moduleName, tntCode, definition.typeName) || {};
                                    let mergedTypeSchema = SERVICE[searchOptions.schemaHandler].loadSearchSchemaFromDatabase(definition.moduleName, tntCode, source, target, definition.typeName);
                                    if (mergedTypeSchema && !UTILS.isBlank(mergedTypeSchema)) {
                                        SERVICE.DefaultSearchConfigurationService.addTenantRawSearchSchema(moduleName, tntCode, mergedTypeSchema);
                                    }
                                }
                            }
                        });
                    }
                    resolve(true);
                }).catch(error => {
                    _self.LOG.error('Failed while loading search schema from schema definitions');
                    reject(error);
                });
            });
        });
    },

    updateModuleIndexesMapping: function (moduleName) {
        let _self = this;
        try {
            NODICS.getTenants().forEach(tntCode => {
                let searchEngine = SERVICE.DefaultSearchConfigurationService.getTenantSearchEngine(moduleName, tntCode);
                if (searchEngine) {
                    let searchOptions = searchEngine.getOptions();
                    if (searchOptions.enabled && searchOptions.schemaHandler &&
                        SERVICE[searchOptions.schemaHandler] &&
                        SERVICE[searchOptions.schemaHandler].prepareFromDefinitions &&
                        typeof SERVICE[searchOptions.schemaHandler].prepareFromDefinitions === 'function') {
                        _self.updateTenantIndexesMapping(moduleName, tntCode);
                    }
                }
            });
        } catch (error) {
            _self.LOG.error('Failed while loading search schema from schema definitions');
            _self.LOG.error(error);
            throw error;
        }
    },

    updateTenantIndexesMapping: function (moduleName, tntCode) {
        let _self = this;
        try {
            let searchEngine = SERVICE.DefaultSearchConfigurationService.getTenantSearchEngine(moduleName, tntCode);
            if (searchEngine) {
                let searchOptions = searchEngine.getOptions();
                if (searchOptions.enabled && searchOptions.schemaHandler &&
                    SERVICE[searchOptions.schemaHandler] &&
                    SERVICE[searchOptions.schemaHandler].updateIndexTypeMapping &&
                    typeof SERVICE[searchOptions.schemaHandler].updateIndexTypeMapping === 'function') {
                    let moduleTenantSearchRawSchema = SERVICE.DefaultSearchConfigurationService.getRawSearchSchema(moduleName, tntCode);
                    if (moduleTenantSearchRawSchema && !UTILS.isBlank(moduleTenantSearchRawSchema)) {
                        let allPromise = [];
                        console.log('==> ', moduleName);
                        Object.keys(moduleTenantSearchRawSchema).forEach(typeName => {
                            let indexDefinition = moduleTenantSearchRawSchema[typeName];
                            allPromise.push(SERVICE[searchOptions.schemaHandler].updateIndexTypeMapping({
                                moduleName: moduleName,
                                tntCode: tntCode,
                                searchEngine: searchEngine,
                                rawSearchSchema: moduleTenantSearchRawSchema,
                                typeName: typeName,
                                indexDefinition: indexDefinition
                            }));
                        });
                    }
                }
            }
        } catch (error) {
            _self.LOG.error('Failed while loading search schema from schema definitions');
            _self.LOG.error(error);
            throw error;
        }
    },

    prepareModuleSearchModels: function (moduleName) {
        let _self = this;
        try {
            let moduleObject = NODICS.getModule(moduleName);
            NODICS.getTenants().forEach(tntCode => {
                if (!moduleObject.searchModels[tntCode]) {
                    moduleObject.searchModels[tntCode] = {};
                }
                let searchEngine = SERVICE.DefaultSearchConfigurationService.getTenantSearchEngine(moduleName, tntCode);
                if (searchEngine) {
                    let searchOptions = searchEngine.getOptions();
                    if (searchOptions.enabled && searchOptions.schemaHandler &&
                        SERVICE[searchOptions.schemaHandler] &&
                        SERVICE[searchOptions.schemaHandler].prepareFromDefinitions &&
                        typeof SERVICE[searchOptions.schemaHandler].prepareFromDefinitions === 'function') {
                        _self.prepareTenantSearchModels(moduleName, tntCode);
                    }
                }
            });
        } catch (error) {
            _self.LOG.error('Failed while loading search schema from schema definitions');
            _self.LOG.error(error);
            throw error;
        }
    },

    prepareTenantSearchModels: function (moduleName, tntCode) {
        let _self = this;
        try {
            let searchEngine = SERVICE.DefaultSearchConfigurationService.getTenantSearchEngine(moduleName, tntCode);
            if (searchEngine) {
                let searchOptions = searchEngine.getOptions();
                if (searchOptions.enabled && searchOptions.schemaHandler &&
                    SERVICE[searchOptions.schemaHandler] &&
                    SERVICE[searchOptions.schemaHandler].prepareSearchModel &&
                    typeof SERVICE[searchOptions.schemaHandler].prepareSearchModel === 'function') {
                    let rawSearchModelDef = SERVICE.DefaultSearchConfigurationService.getRawSearchModelDefinition(searchOptions.engine);
                    let moduleTenantSearchRawSchema = SERVICE.DefaultSearchConfigurationService.getRawSearchSchema(moduleName, tntCode);
                    let moduleObject = NODICS.getModule(moduleName);
                    if (moduleObject && moduleTenantSearchRawSchema && !UTILS.isBlank(moduleTenantSearchRawSchema)) {
                        Object.keys(moduleTenantSearchRawSchema).forEach(typeName => {
                            let indexDef = moduleTenantSearchRawSchema[typeName];
                            let searchModelName = typeName.toUpperCaseFirstChar() + 'SearchModel';
                            let searchModel = {
                                moduleName: moduleName,
                                tntCode: tntCode,
                                searchEngine: searchEngine,
                                typeName: typeName,
                                indexDef: indexDef
                            };
                            _self.registerSearchModels(rawSearchModelDef.default, searchModel);
                            _self.registerSearchModels(rawSearchModelDef[moduleName], searchModel);
                            _self.registerSearchModels(rawSearchModelDef[typeName], searchModel);
                            moduleObject.searchModels[tntCode][searchModelName] = searchModel;
                        });
                    }
                }
            }
        } catch (error) {
            _self.LOG.error('Failed while loading search schema from schema definitions');
            _self.LOG.error(error);
            throw error;
        }
    },

    registerSearchModels: function (defaultSearchModelDef, modelSchema) {
        if (defaultSearchModelDef) {
            Object.keys(defaultSearchModelDef).forEach(element => {
                defaultSearchModelDef[element](modelSchema);
            });
        }
    }
};