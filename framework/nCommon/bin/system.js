/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const fs = require('fs');
const path = require("path");

module.exports = {
    getFileNameWithoutExtension: function(filePath) {
        let fileName = filePath.substring(filePath.lastIndexOf("/") + 1, filePath.indexOf("."));
        fileName = fileName.toUpperCaseFirstChar();

        return fileName;
    },

    schemaWalkThrough: function(options, callback) {
        _.each(NODICS.getModules(), (moduleObject, moduleName) => {
            if (moduleObject.models) {
                _.each(moduleObject.rawSchema, (schemaObject, schemaName) => {
                    if (schemaObject.model) {
                        options.moduleName = moduleName;
                        options.moduleObject = moduleObject;
                        options.schemaName = schemaName;
                        options.schemaObject = schemaObject;
                        callback(options);
                    }
                });
            }
        });
    },

    modelsWalkThrough: function(options, callback) {
        if (options.moduleName) {
            _.each(NODICS.getModules()[options.moduleName].rawSchema, (schemaObject, schemaName) => {
                if (schemaObject.model) {
                    options.schemaName = schemaName;
                    options.schemaObject = schemaObject;
                    callback(options);
                }
            });
        } else {
            _.each(NODICS.getModules(), (moduleObject, moduleName) => {
                if (moduleObject.models) {
                    _.each(moduleObject.rawSchema, (schemaObject, schemaName) => {
                        if (schemaObject.model) {
                            options.moduleName = moduleName;
                            options.moduleObject = moduleObject;
                            options.schemaName = schemaName;
                            options.schemaObject = schemaObject;
                            callback(options);
                        }
                    });
                }
            });
        }

    },

    replacePlaceholders: function(options) {
        var commonDefinitionString = JSON.stringify(options.commonDefinition, function(key, value) {
            if (typeof value === 'function') {
                return value.toString();
            } else {
                return value;
            }
        });
        let contextRoot = CONFIG.get('server').contextRoot;
        commonDefinitionString = commonDefinitionString.replaceAll('moduleName', options.moduleName)
            .replaceAll('modelName', options.modelName + 'Model')
            .replaceAll('schemaName', options.schemaName)
            .replaceAll('modelVar', options.modelName)
            .replaceAll('daoName', options.modelName + 'Dao')
            .replaceAll('mdulName', options.moduleName)
            .replaceAll('ServiceName', options.modelName + 'Service')
            .replaceAll('FacadeName', options.modelName + 'Facade')
            .replaceAll("contextRoot", contextRoot)
            .replaceAll("controllerName", options.modelName + 'Controller');
        return JSON.parse(commonDefinitionString, function(key, value) {
            if (_(value).startsWith('function')) {
                value = value.replace("function", key + ' = function');
                return eval(value);
            } else {
                return value;
            }
        });
    },

    startServers: function() {
        if (CONFIG.get('server').runAsSingleModule) {
            if (!NODICS.getModules().default || !NODICS.getModules().default.app) {
                console.error('   ERROR: Server configurations has not be initialized. Please verify.');
                process.exit(CONFIG.get('errorExitCode'));
            }
            const httpPort = SYSTEM.getPort('default');
            console.log('=>  Starting Server for module : default on PORT : ', httpPort);
            NODICS.getModules().default.app.listen(httpPort);
        } else {
            let modules = NODICS.getModules();
            if (this.isBlank(NODICS.getModules())) {
                console.error('   ERROR: Please define valid active modules');
                process.exit(CONFIG.get('errorExitCode'));
            }
            _.each(modules, function(value, moduleName) {
                if (value.metaData && value.metaData.publish) {
                    if (!value.app) {
                        console.error('   ERROR: Server configurations has not be initialized for module : ', moduleName);
                        process.exit(CONFIG.get('errorExitCode'));
                    }
                    const httpPort = SYSTEM.getPort(moduleName);
                    if (!httpPort) {
                        console.error('   ERROR: Please define listening PORT for module: ', moduleName);
                        process.exit(CONFIG.get('errorExitCode'));
                    }
                    console.log(' =>Starting Server for module : ', moduleName, ' on PORT : ', httpPort);
                    value.app.listen(httpPort);
                }
            });
        }
    },
};