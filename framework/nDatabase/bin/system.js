/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    validateDatabaseConfiguration: function(dbName) {
        var flag = true;
        if (!dbName) {
            dbName = 'default';
        }
        if (!CONFIG.get('database')) {
            this.LOG.error('Databse configuration not found. Please configure in properties.js file.');
            flag = false;
        }
        if (!CONFIG.get('database')[dbName]) {
            this.LOG.error('Default databse configuration not found. Please configure in properties.js file.');
            flag = false;
        }
        return flag;
    },

    createModelName: function(modelName) {
        var name = modelName.toUpperCaseFirstChar() + 'Model';
        return name;
    },

    getModelName: function(modelName) {
        var name = modelName.toUpperCaseFirstChar().replace("Model", "");
        return name;
    },

    validateSchemaDefinition: function(modelName, schemaDefinition) {
        let flag = true;
        if (!schemaDefinition.super) {
            this.LOG.error('Invalid schema definition for : ' + modelName + ', please define super attribute');
            flag = false;
        } else if (!schemaDefinition.definition) {
            this.LOG.error('Invalid schema definition for : ' + modelName + ', please define definition attribute');
            flag = false;
        }
    },

    buildItemLevelCache: function(rawSchema) {
        let itemLevelCache = CONFIG.get('cache').itemLevelCache[rawSchema.modelName];
        if (itemLevelCache) {
            rawSchema.cache = itemLevelCache;
        }
    }
};