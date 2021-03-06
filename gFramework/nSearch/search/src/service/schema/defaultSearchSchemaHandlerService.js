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

    prepareSearchSchema: function (tenants = NODICS.getActiveTenants()) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                _self.loadSearchSchemaFromSchema(tenants);
                _self.loadSearchSchema(tenants);
                _self.loadSearchSchemaFromDatabase(tenants).then(success => {
                    _self.extractSchemaOptions();
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.SearchNodics(error, ' Failed preparing search schema'));
            }
        });
    },

    loadSearchSchemaFromSchema: function (tenants = NODICS.getActiveTenants()) {
        let _self = this;
        try {
            tenants.forEach(tntCode => {
                Object.keys(NODICS.getModules()).forEach(moduleName => {
                    _self.loadSearchSchemaForModule(moduleName, tntCode);
                });
            });
        } catch (error) {
            throw error;
        }
    },

    loadSearchSchemaForModule: function (moduleName, tntCode) {
        let _self = this;
        try {
            let moduleObject = NODICS.getModule(moduleName);
            if (moduleObject && moduleObject.rawSchema) {
                _self.LOG.debug('Collecting data from module: ' + moduleName);
                Object.keys(moduleObject.rawSchema).forEach(schemaName => {
                    _self.prepareFromSchema(moduleName, schemaName, tntCode);
                });
            }
        } catch (error) {
            throw new CLASSES.SearchNodics(error, 'While collecting properties from module: ' + moduleName);
        }
    },

    prepareFromSchema: function (moduleName, schemaName, tntCode) {
        let moduleObject = NODICS.getModule(moduleName);
        let rawSchema = moduleObject.rawSchema[schemaName];
        if (!rawSchema.tenants || rawSchema.tenants.includes(tntCode)) {
            let searchEngine = SERVICE.DefaultSearchConfigurationService.getTenantSearchEngine(moduleName, tntCode);
            if (searchEngine) {
                let searchOptions = searchEngine.getOptions();
                if (searchOptions.enabled && searchOptions.schemaHandler &&
                    SERVICE[searchOptions.schemaHandler] &&
                    SERVICE[searchOptions.schemaHandler].prepareFromSchema &&
                    typeof SERVICE[searchOptions.schemaHandler].prepareFromSchema === 'function') {
                    let searchSchema = SERVICE[searchOptions.schemaHandler].prepareFromSchema(moduleName, schemaName);
                    if (searchSchema && !UTILS.isBlank(searchSchema)) {
                        if (rawSchema.cache) {
                            searchSchema.cache = _.merge(_.merge({}, rawSchema.cache), rawSchema.search.cache || {});
                        }
                        searchSchema.event = rawSchema.search.event || rawSchema.event || false;
                        let schemaModel = NODICS.getModels(moduleName, tntCode)[schemaName.toUpperCaseFirstChar() + 'Model'];
                        if (schemaModel) {
                            schemaModel.typeName = searchSchema.typeName;
                        }
                        SERVICE.DefaultSearchConfigurationService.addTenantRawSearchSchema(moduleName, tntCode, searchSchema);
                    }
                } else {
                    _self.LOG.error('Invalid connection handler configuration for : ' + moduleName + ', tenant: ' + tntCode);
                }
            }
        }
    },

    loadSearchSchema: function (tenants = NODICS.getActiveTenants()) {
        let _self = this;
        try {
            let searchSchemas = {};
            SERVICE.DefaultFilesLoaderService.loadFiles('/src/search/indexes.js', searchSchemas);
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
            throw new CLASSES.SearchNodics(error, 'Failed while loading search schema from schema definitions');
        }
    },

    loadSearchSchemaFromDatabase: function (tenants = NODICS.getActiveTenants()) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                tenants.forEach(tntCode => {
                    SERVICE.DefaultIndexService.get({
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
                        reject(error);
                    });
                });
            } catch (error) {
                reject(new CLASSES.SearchNodics(error));
            }
        });
    },

    extractSchemaOptions: function () {
        let searchSchemas = SERVICE.DefaultSearchConfigurationService.getAllRawSearchSchema();
        if (searchSchemas && !UTILS.isBlank(searchSchemas)) {
            _.each(searchSchemas, (moduleObject, ModuleName) => {
                _.each(moduleObject, (tenantObject, tenantName) => {
                    _.each(tenantObject, (schemaObject, indexName) => {
                        let defaultProps = {};
                        let valueProviders = {};
                        let validators = {};
                        let properties = Object.keys(schemaObject.properties);
                        for (let count = 0; count < properties.length; count++) {
                            let propertyName = properties[count];
                            let propertyObject = schemaObject.properties[propertyName];
                            if (propertyObject.default && !UTILS.isBlank(propertyObject.default)) {
                                defaultProps[propertyName] = propertyObject.default;
                            }
                            if (propertyObject.valueProvider && !UTILS.isBlank(propertyObject.valueProvider)) {
                                valueProviders[propertyName] = propertyObject.valueProvider;
                            }
                            if (propertyObject.validator && !UTILS.isBlank(propertyObject.validator)) {
                                validators[propertyName] = propertyObject.validator;
                            }
                        }
                        if (!UTILS.isBlank(defaultProps)) {
                            schemaObject.defaultValues = defaultProps;
                        }
                        if (!UTILS.isBlank(valueProviders)) {
                            schemaObject.valueProviders = valueProviders;
                        }
                        if (!UTILS.isBlank(validators)) {
                            schemaObject.validators = validators;
                        }
                    });
                });
            });
        }
    },
};