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

    prepareSearchSchema: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                _self.loadSearchSchemaFromSchema();
                _self.loadSearchSchema();
                _self.loadSearchSchemaFromDatabase().then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
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
                                    let collection = NODICS.getModels(moduleName, tntCode)[schemaName.toUpperCaseFirstChar() + 'Model'];
                                    if (collection) {
                                        collection.typeName = searchSchema.typeName;
                                    }
                                    SERVICE.DefaultSearchConfigurationService.addTenantRawSearchSchema(moduleName, tntCode, searchSchema);
                                }
                            } else {
                                _self.LOG.error('Invalid connection handler configuration for : ' + moduleName + ', tenant: ' + tntCode);
                            }
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
            SERVICE.DefaultFilesLoaderService.loadFiles('/src/search/indexes.js', searchSchemas);
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
            try {
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
            } catch (error) {
                reject(error);
            }
        });
    }
};