/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

    searchConfig: {},
    searchEngines: {},

    postInitialize: function () {

    },

    postApp: function () {
        this.prepareSearchSchema().then(success => {
            this.LOG.debug('Search schema have been loaded successfully');
            //console.log('=================>>>>', util.inspect(this.getAllIndexTypeMetaData(), false, 4));
        }).catch(error => {
            this.LOG.error(error);
        });
    },

    /**
     * This function is used to get module specific search configuration, if not enabled, it will return undefined
     * @param {*} moduleName 
     * @param {*} tntCode 
     */
    getSearchConfiguration: function (moduleName, tntCode) {
        let searchOptions = CONFIG.get('search', tntCode);
        let connOptions;
        let connConfig = _.merge(searchOptions.default, searchOptions[moduleName] || {});
        if (connConfig.options.enabled) {
            connOptions = connConfig[connConfig.options.engine];
        }
        return connOptions;
    },

    addSearchEngine: function (moduleName, tenant, searchEngine) {
        if (!moduleName) {
            moduleName = 'default';
        }
        if (!NODICS.isModuleActive(moduleName)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!this.searchEngines[moduleName]) {
            this.searchEngines[moduleName] = {};
        }
        this.searchEngines[moduleName][tenant] = searchEngine;
    },

    removeSearchEngine: function (moduleName, tenant) {
        if (!this.isModuleActive(moduleName)) {
            throw new Error('Invalid module name: ' + moduleName);
        }
        if (this.searchEngines[moduleName] && this.searchEngines[moduleName][tenant]) {
            delete this.searchEngines[moduleName][tenant];
        }
        return true;
    },

    getSearchEngine: function (moduleName, tenant) {
        if (!this.isModuleActive(moduleName)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!NODICS.getTenants().includes(tenant)) {
            throw new Error('Invalid tenant name: ' + tenant);
        } else {
            let searchEngine = this.searchEngines[moduleName] || this.searchEngines.default;
            if (!searchEngine[tenant]) {
                throw new Error('Invalid search configuration for tenant: ' + tenant);
            } else {
                return searchEngine[tenant];
            }
        }
    },

    addIndexTypeMetaData: function (tntCode, definition) {
        if (!this.searchConfig[tntCode]) {
            this.searchConfig[tntCode] = {};
        }
        this.searchConfig[tntCode][definition.typeName] = definition;
    },

    getAllIndexTypeMetaData: function () {
        return this.searchConfig;
    },

    getTenantIndexTypeMetaData: function (tntCode) {
        if (!NODICS.getTenants().includes(tntCode)) {
            throw new Error('Invalid tenant name: ' + tntCode);
        } else {
            return this.searchConfig[tntCode];
        }
    },

    getIndexTypeMetaData: function (tntCode, typeName) {
        if (!NODICS.getTenants().includes(tntCode) || !this.searchConfig[tntCode]) {
            throw new Error('Invalid tenant name: ' + tntCode);
        } else {
            return this.searchConfig[tntCode][typeName];
        }
    },


    prepareSearchSchema: function () {
        return new Promise((resolve, reject) => {
            this.loadSearchSchemaFromSchema();
            this.loadSearchSchema();
            this.loadSearchSchemaFromDatabase().then(success => {
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });

    },

    loadSearchSchemaFromSchema: function () {
        try {
            Object.keys(NODICS.getModules()).forEach(moduleName => {
                this.loadSearchSchemaForModule(moduleName);
            });
        } catch (error) {
            this.LOG.error('Failed while loading search schema from schema definitions');
            this.LOG.error(error);
            throw error;
        }
    },

    loadSearchSchemaForModule: function (moduleName) {
        let _self = this;
        try {
            let moduleObject = NODICS.getModule(moduleName);
            if (moduleObject && moduleObject.rawSchema) {
                this.LOG.debug('Collecting data from module: ' + moduleName);
                Object.keys(moduleObject.rawSchema).forEach(schemaName => {
                    let searchSchema = _self.loadSearchSchemaForSchema(moduleName, schemaName);
                    if (searchSchema && !UTILS.isBlank(searchSchema)) {
                        let rawSchema = moduleObject.rawSchema[schemaName];
                        let tenants = rawSchema.tenants || NODICS.getTenants();
                        tenants.forEach(tntCode => {
                            this.addIndexTypeMetaData(tntCode, searchSchema);
                        });
                    }
                });
            }
        } catch (error) {
            this.LOG.error('While collecting properties from module: ' + moduleName);
            throw error;
        }
    },

    loadSearchSchemaForSchema: function (moduleName, schemaName, isSubSchema, processed = []) {
        let _self = this;
        let searchSchema = {};
        try {
            let moduleObject = NODICS.getModule(moduleName);
            let searchConfig = CONFIG.get('search');
            if (moduleObject && moduleObject.rawSchema && moduleObject.rawSchema[schemaName]) {
                let rawSchema = moduleObject.rawSchema[schemaName];
                processed.push(schemaName);
                if (isSubSchema || (rawSchema.search && rawSchema.search.enabled && !UTILS.isBlank(rawSchema.definition))) {
                    this.LOG.debug('  Collecting data from schema: ' + schemaName);
                    searchSchema = _.merge({}, rawSchema.search || {});
                    searchSchema.indexName = searchSchema.indexName || moduleName;
                    searchSchema.typeName = searchSchema.typeName || schemaName;
                    searchSchema.idPropertyName = searchSchema.idPropertyName || 'code';
                    searchSchema.moduleName = moduleName;
                    searchSchema.schemaName = schemaName;
                    searchSchema.properties = {};
                    Object.keys(rawSchema.definition).forEach(name => {
                        let options = rawSchema.definition[name];
                        if (options.searchOptions && !UTILS.isBlank(options.searchOptions) && options.searchOptions.enabled) {
                            let propName = options.searchOptions.name || name;
                            searchSchema.properties[propName] = options.searchOptions;
                            searchSchema.properties[propName].name = searchSchema.properties[propName].name || name;
                            searchSchema.properties[propName].type = searchSchema.properties[propName].type || 'search';
                            searchSchema.properties[propName].weight = searchSchema.properties[propName].weight || searchConfig.defaultPropertyWeight;
                            searchSchema.properties[propName].sequence = searchSchema.properties[propName].sequence || searchConfig.defaultPropertySequence;
                            if (rawSchema.refSchema && rawSchema.refSchema[name] &&
                                rawSchema.refSchema[name].searchEnabled &&
                                !processed.includes(rawSchema.refSchema[name].schemaName)) {
                                let subSchema = _self.loadSearchSchemaForSchema(moduleName, rawSchema.refSchema[name].schemaName, true, processed);
                                if (subSchema && !UTILS.isBlank(subSchema)) {
                                    searchSchema.properties[propName].properties = subSchema.properties;
                                }
                            }
                        }
                    });
                }
            } else {
                this.LOG.warn('Configuration is not proper for module: ' + moduleName + ' and schema: ' + schemaName);
            }
        } catch (error) {
            this.LOG.error('While collecting properties from module: ' + moduleName + ' and schema: ' + schemaName);
            throw error;
        }
        return searchSchema;
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
                        let moduleIndexSchemas = searchSchemas[moduleName];
                        Object.keys(moduleIndexSchemas).forEach(indexType => {
                            _self.mergeIndexMetaData(indexType, moduleIndexSchemas[indexType], moduleName, tntCode);
                        });
                    });
                });
            }
        } catch (error) {
            this.LOG.error('Failed while loading search schema from schema definitions');
            this.LOG.error(error);
            throw error;
        }
    },

    loadSearchSchemaFromDatabase: function () {
        return new Promise((resolve, reject) => {
            let tenants = NODICS.getTenants();
            tenants.forEach(tntCode => {
                SERVICE.DefaultIndexerService.get({
                    tenant: tntCode,
                }).then(indexers => {
                    //console.log('=====================> ', indexers);
                    if (indexers && indexers.success && indexers.result && indexers.result.length > 0) {
                        indexers.result.forEach(definition => {
                            _self.mergeIndexMetaData(definition.typeName, definition, null, tntCode);
                        });
                    }
                    resolve(true);
                }).catch(error => {
                    this.LOG.error('Failed while loading search schema from schema definitions');
                    reject(error);
                });
            });
        });
    },

    mergeIndexMetaData: function (typeName, schemaDef, moduleName, tntCode) {
        let searchConfig = CONFIG.get('search', tntCode);
        schemaDef.indexName = schemaDef.indexName || moduleName;
        schemaDef.typeName = schemaDef.typeName || typeName;
        schemaDef.idPropertyName = schemaDef.idPropertyName || 'code';
        if (moduleName || schemaDef.moduleName) {
            schemaDef.moduleName = schemaDef.moduleName || moduleName;
        }
        if (schemaDef.properties && !UTILS.isBlank(schemaDef.properties)) {
            Object.keys(schemaDef.properties).forEach(propName => {
                schemaDef.properties[propName].enabled = schemaDef.properties[propName].enabled || false;
                schemaDef.properties[propName].name = schemaDef.properties[propName].name || propName;
                schemaDef.properties[propName].type = schemaDef.properties[propName].type || 'search';
                schemaDef.properties[propName].weight = schemaDef.properties[propName].weight || searchConfig.defaultPropertyWeight;;
                schemaDef.properties[propName].sequence = schemaDef.properties[propName].sequence || searchConfig.defaultPropertySequence;;
            });
        }
        this.addIndexTypeMetaData(tntCode, _.merge(this.getIndexTypeMetaData(tntCode, typeName) || {}, schemaDef));
    }
};