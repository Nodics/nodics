/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const util = require('util');

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

    prepareFromSchema: function (moduleName, schemaName, isSubSchema, processed = []) {
        let _self = this;
        let searchSchema = {};
        try {
            let moduleObject = NODICS.getModule(moduleName);
            let searchConfig = CONFIG.get('search');
            if (moduleObject && moduleObject.rawSchema && moduleObject.rawSchema[schemaName]) {
                let rawSchema = moduleObject.rawSchema[schemaName];
                processed.push(schemaName);
                if (isSubSchema || (rawSchema.search && rawSchema.search.enabled && !UTILS.isBlank(rawSchema.definition))) {
                    _self.LOG.debug('  Collecting data from schema: ' + schemaName);
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
                            searchSchema.properties[propName].type = searchSchema.properties[propName].type || 'text';
                            searchSchema.properties[propName].index = searchSchema.properties[propName].index || 'not_analyzed';
                            searchSchema.properties[propName].weight = searchSchema.properties[propName].weight || searchConfig.defaultPropertyWeight;
                            searchSchema.properties[propName].sequence = searchSchema.properties[propName].sequence || searchConfig.defaultPropertySequence;
                            if (rawSchema.refSchema && rawSchema.refSchema[name] &&
                                rawSchema.refSchema[name].searchEnabled &&
                                !processed.includes(rawSchema.refSchema[name].schemaName)) {
                                let subSchema = _self.prepareFromSchema(moduleName, rawSchema.refSchema[name].schemaName, true, processed);
                                if (subSchema && !UTILS.isBlank(subSchema)) {
                                    searchSchema.properties[propName].properties = subSchema.properties;
                                }
                            }
                        }
                    });
                }
            } else {
                _self.LOG.warn('Configuration is not proper for module: ' + moduleName + ' and schema: ' + schemaName);
            }
        } catch (error) {
            _self.LOG.error('While collecting properties from module: ' + moduleName + ' and schema: ' + schemaName);
            throw error;
        }
        return searchSchema;
    },

    prepareFromDefinitions: function (moduleName, tntCode, source, target, typeName) {
        let _self = this;
        try {
            return _self.mergeIndexMetaData(moduleName, tntCode, source, target, typeName);
        } catch (error) {
            _self.LOG.error('Failed while loading search schema from schema definitions');
            _self.LOG.error(error);
            throw error;
        }
    },

    loadSearchSchemaFromDatabase: function (moduleName, tntCode, source, target, typeName) {
        let _self = this;
        try {
            return _self.mergeIndexMetaData(moduleName, tntCode, source, target, typeName);
        } catch (error) {
            _self.LOG.error('Failed while loading search schema from schema definitions');
            _self.LOG.error(error);
            throw error;
        }
    },

    mergeIndexMetaData: function (moduleName, tntCode, source, target, typeName) {
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
                source.properties[propName].type = source.properties[propName].type || 'text';
                source.properties[propName].index = source.properties[propName].index || 'not_analyzed';
                source.properties[propName].weight = source.properties[propName].weight || searchConfig.defaultPropertyWeight;;
                source.properties[propName].sequence = source.properties[propName].sequence || searchConfig.defaultPropertySequence;;
            });
        }
        return _.merge(target, source);
    },

    prepareTypeSchema: function (options) {
        return new Promise((resolve, reject) => {
            let schemaDef = {
                properties: {}
            };
            let properties = Object.keys(options.typeDef.properties);
            if (options.typeDef.properties && properties.length > 0) {
                for (let count = 0; count < properties.length; count++) {
                    let propName = properties[count];
                    let propObj = options.typeDef.properties[propName];
                    schemaDef.properties[propName] = {
                        type: propObj.type || 'text'
                    };
                }
            }
            resolve(schemaDef);
        });
    }
};