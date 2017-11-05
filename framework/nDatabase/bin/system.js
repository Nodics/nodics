/*
    Nodics - Enterprice API management framework

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
            console.error('   ERROR: Databse configuration not found. Please configure in properties.js file.');
            flag = false;
        }
        if (!CONFIG.get('database')[dbName]) {
            console.error('   ERROR: Default databse configuration not found. Please configure in properties.js file.');
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
            console.error('   ERROR: Invalid schema definition for : ' + modelName + ', please define super attribute');
            flag = false;
        } else if (!schemaDefinition.definition) {
            console.error('   ERROR: Invalid schema definition for : ' + modelName + ', please define definition attribute');
            flag = false;
        }
    }
}