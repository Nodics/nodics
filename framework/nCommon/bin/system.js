const _ = require('lodash');
const fs = require('fs');
const path = require("path");

module.exports = {
    getFileNameWithoutExtension: function(filePath) {
        let fileName = filePath.substring(filePath.lastIndexOf("/") + 1, filePath.indexOf("."));
        fileName = fileName.toUpperCaseFirstChar();

        return fileName;
    },

    processFiles: function(filePath, filePostFix, calback, exclude) {
        if (fs.existsSync(filePath)) {
            let files = fs.readdirSync(filePath);
            if (files) {
                files.map(function(file) {
                    return path.join(filePath, file);
                }).filter(function(file) {
                    return fs.statSync(file).isFile();
                }).filter(function(file) {
                    if (!filePostFix || filePostFix === '*') {
                        return true;
                    } else {
                        return file.endsWith(filePostFix);
                    }
                }).forEach(function(file) {
                    console.log('   INFO: Loading class from : ', file);
                    calback(file);
                });
            }
        }
    },

    schemaWalkThrough: function(options, callback) {
        _.each(NODICS.modules, (moduleObject, moduleName) => {
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
            _.each(NODICS.modules[options.moduleName].rawSchema, (schemaObject, schemaName) => {
                if (schemaObject.model) {
                    options.schemaName = schemaName;
                    options.schemaObject = schemaObject;
                    callback(options);
                }
            });
        } else {
            _.each(NODICS.modules, (moduleObject, moduleName) => {
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
        let contextRoot = CONFIG.server.contextRoot;
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
        //console.log('=========================================================================');
        //console.log(commonDefinitionString);
        //console.log('=========================================================================');
        return JSON.parse(commonDefinitionString, function(key, value) {
            if (_(value).startsWith('function')) {
                value = value.replace("function", key + ' = function');
                return eval(value);
            } else {
                return value;
            }
        });
    }
};