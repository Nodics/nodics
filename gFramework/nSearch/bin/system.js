/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
let elasticsearch = require('elasticsearch');

module.exports = {

    /*getSearchActiveModules: function () {
        let modules = NODICS.getModules();
        let dbModules = [];
        _.each(modules, (value, moduleName) => {
            if (CONFIG.get('search')[moduleName]) {
                dbModules.push(moduleName);
            }
        });
        return dbModules;
    },

    createSearchConnections: function () {
        return new Promise((resolve, reject) => {
            this.createTenantSearchEngines(NODICS.getTenants()).then(success => {
                SYSTEM.LOG.debug('Search connections has been established successfully');
                resolve(true);
            }).catch(error => {
                SYSTEM.LOG.error('Failed establishing connections with search engine');
                reject(error);
            });
        });
    },

    createTenantSearchEngines: function (tntCodes) {
        return new Promise((resolve, reject) => {
            try {
                if (tntCodes && tntCodes.length > 0) {
                    let tntCode = tntCodes.shift();
                    let modules = SYSTEM.getSearchActiveModules();
                    SYSTEM.createModulesSearchEngines(modules, tntCode).then(success => {
                        SYSTEM.createTenantSearchEngines(tntCodes).then(success => {
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
            } catch (err) {
                reject({
                    success: false,
                    code: 'ERR_SRCH_00000',
                    error: err
                });
            }
        });
    },

    createModulesSearchEngines: function (modules, tntCode) {
        return new Promise((resolve, reject) => {
            try {
                if (modules && modules.length > 0) {
                    let moduleName = modules.shift();
                    SYSTEM.createModuleSearchEngines(moduleName, tntCode).then(success => {
                        SYSTEM.createModulesSearchEngines(modules, tntCode).then(success => {
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
            } catch (err) {
                reject({
                    success: false,
                    code: 'ERR_SRCH_00000',
                    error: err
                });
            }
        });
    },

    createModuleSearchEngines: function (moduleName, tntCode) {
        return new Promise((resolve, reject) => {
            try {
                let defaultSearchConfig = CONFIG.get('search', tntCode);
                let searchOptions = NODICS.getSearchConfiguration(moduleName, tntCode);
                if (searchOptions && searchOptions.options.enabled) {
                    let searchEngine = new CLASSES.SearchEngine();
                    searchEngine.setOptions(searchOptions.options);
                    searchEngine.setConnectionOptions(searchOptions.connection);

                    let client = new elasticsearch.Client(searchOptions.connection);
                    client.ping({
                        requestTimeout: defaultSearchConfig.requestTimeout
                    }, function (error) {
                        if (error) {
                            SYSTEM.LOG.warn('Search cluster is not reachable for module : ' + moduleName + ', tenant: ' + tntCode + ', hosts: ' + searchOptions.connection.hosts);
                            reject({
                                success: false,
                                code: 'ERR_SRCH_00000',
                                msg: 'Search cluster is not reachable for module : ' + moduleName + ', tenant: ' + tntCode + ', hosts: ' + searchOptions.connection.hosts
                            });
                        } else {
                            searchEngine.setConnection(client);
                            searchEngine.setActive(true);
                            resolve(true);
                        }
                    });
                } else {
                    SYSTEM.LOG.warn('Search is not enabled for module: ' + moduleName);
                    resolve(true);
                }
            } catch (err) {
                SYSTEM.LOG.error('Facing issue to connect with search cluster');
                SYSTEM.LOG.error(err);
                reject({
                    success: false,
                    code: 'ERR_SRCH_00000',
                    error: err
                });
            }
        });
    },

    prepareSearchSchema: function () {
        return new Promise((resolve, reject) => {
            SYSTEM.loadSearchSchemaFromSchema();
            SYSTEM.loadSearchSchema();
            SYSTEM.loadSearchSchemaFromDatabase().then(success => {
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },

    loadSearchSchemaFromSchema: function () {
        try {
            Object.keys(NODICS.getModules()).forEach(moduleName => {
                SYSTEM.loadSearchSchemaForModule(moduleName);
            });
        } catch (error) {
            SYSTEM.LOG.error('Failed while loading search schema from schema definitions');
            SYSTEM.LOG.error(error);
            throw error;
        }
    },

    loadSearchSchemaForModule: function (moduleName) {
        try {
            let moduleObject = NODICS.getModule(moduleName);
            if (moduleObject && moduleObject.rawSchema) {
                SYSTEM.LOG.debug('Collecting data from module: ' + moduleName);
                Object.keys(moduleObject.rawSchema).forEach(schemaName => {
                    let searchSchema = SYSTEM.loadSearchSchemaForSchema(moduleName, schemaName);
                    if (searchSchema && !UTILS.isBlank(searchSchema)) {
                        let rawSchema = moduleObject.rawSchema[schemaName];
                        let tenants = rawSchema.tenants || NODICS.getTenants();
                        tenants.forEach(tntCode => {
                            NODICS.addTenantRawSearchSchema(moduleName, tntCode, searchSchema);
                        });
                    }
                });
            }
        } catch (error) {
            SYSTEM.LOG.error('While collecting properties from module: ' + moduleName);
            throw error;
        }
    },

    loadSearchSchemaForSchema: function (moduleName, schemaName, isSubSchema, processed = []) {
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
                                let subSchema = SYSTEM.loadSearchSchemaForSchema(moduleName, rawSchema.refSchema[name].schemaName, true, processed);
                                if (subSchema && !UTILS.isBlank(subSchema)) {
                                    searchSchema.properties[propName].properties = subSchema.properties;
                                }
                            }
                        }
                    });
                }
            } else {
                SYSTEM.LOG.warn('Configuration is not proper for module: ' + moduleName + ' and schema: ' + schemaName);
            }
        } catch (error) {
            SYSTEM.LOG.error('While collecting properties from module: ' + moduleName + ' and schema: ' + schemaName);
            throw error;
        }
        return searchSchema;
    },

    loadSearchSchema: function () {
        try {
            let searchSchemas = {};
            SYSTEM.loadFiles('/src/search/indexes.js', searchSchemas);
            let tenants = NODICS.getTenants();
            if (!UTILS.isBlank(searchSchemas) && tenants && tenants.length > 0) {
                tenants.forEach(tntCode => {
                    Object.keys(searchSchemas).forEach(moduleName => {
                        let moduleIndexSchemas = searchSchemas[moduleName];
                        Object.keys(moduleIndexSchemas).forEach(indexType => {
                            let source = moduleIndexSchemas[indexType];
                            let target = NODICS.getTenantRawSearchSchema(moduleName, tntCode, source.typeName || indexType);
                            let mergedTypeSchema = SYSTEM.mergeIndexMetaData(source, target);
                            NODICS.addTenantRawSearchSchema(moduleName, tntCode, mergedTypeSchema, tntCode);
                        });
                    });
                });
            }
        } catch (error) {
            SYSTEM.LOG.error('Failed while loading search schema from schema definitions');
            SYSTEM.LOG.error(error);
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
                    if (indexers && indexers.success && indexers.result && indexers.result.length > 0) {
                        indexers.result.forEach(definition => {
                            let target = NODICS.getTenantRawSearchSchema(definition.moduleName, tntCode, definition.typeName) || {};
                            let mergedTypeSchema = SYSTEM.mergeIndexMetaData(definition, target);
                            NODICS.addTenantRawSearchSchema(definition.moduleName, tntCode, mergedTypeSchema, tntCode);
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

    mergeIndexMetaData: function (source, target, moduleName, tntCode) {
        let searchConfig = CONFIG.get('search', tntCode);
        source.indexName = source.indexName || moduleName;
        source.typeName = source.typeName || typeName;
        source.idPropertyName = source.idPropertyName || 'code';
        if (moduleName || source.moduleName) {
            source.moduleName = source.moduleName || moduleName;
        }
        if (source.properties && !UTILS.isBlank(source.properties)) {
            Object.keys(source.properties).forEach(propName => {
                source.properties[propName].enabled = source.properties[propName].enabled || false;
                source.properties[propName].name = source.properties[propName].name || propName;
                source.properties[propName].type = source.properties[propName].type || 'search';
                source.properties[propName].weight = source.properties[propName].weight || searchConfig.defaultPropertyWeight;;
                source.properties[propName].sequence = source.properties[propName].sequence || searchConfig.defaultPropertySequence;;
            });
        }
        return _.merge(target, source);
    }*/
};