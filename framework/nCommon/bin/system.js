/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const util = require('util');

module.exports = {
    getFileNameWithoutExtension: function(filePath) {
        let fileName = filePath.substring(filePath.lastIndexOf("/") + 1, filePath.indexOf("."));
        return fileName.toUpperCaseFirstChar();
    },

    schemaWalkThrough: function(options) {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(options.currentDir)) {
                fs.mkdirSync(options.currentDir);
            } else if (NODICS.isModifed()) {
                SYSTEM.removeDirectory(options.currentDir, false);
                let allPromise = [];
                _.each(NODICS.getModules(), (moduleObject, moduleName) => {
                    if (moduleObject.models) {
                        _.each(moduleObject.rawSchema, (schemaObject, schemaName) => {
                            if (schemaObject.model) {
                                options.moduleName = moduleName;
                                options.moduleObject = moduleObject;
                                options.schemaName = schemaName;
                                options.schemaObject = schemaObject;
                                allPromise.push(SYSTEM.createObject(options));
                            }
                        });
                    }
                });
                if (allPromise.length > 0) {
                    Promise.all(allPromise).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            } else {
                resolve(true);
            }
        });
    },

    createObject: function(options) {
        return new Promise((resolve, reject) => {
            let _self = this;
            options.modelName = options.schemaName.toUpperCaseEachWord();
            if (options.schemaObject.model) {
                let entityName = options.modelName + options.postFix;
                let fileName = options.currentDir + '/' + entityName + '.js';
                let copyWrite = '/*\n' +
                    '\tNodics - Enterprice Micro-Services Management Framework\n\n' +

                    '\tCopyright (c) 2017 Nodics All rights reserved.\n\n' +

                    '\tThis software is the confidential and proprietary information of Nodics ("Confidential Information")\n' +
                    '\tYou shall not disclose such Confidential Information and shall use it only in accordance with the\n' +
                    '\tterms of the license agreement you entered into with Nodics\n' +

                    '*/\n\n';
                let data = copyWrite + 'module.exports = ' + SYSTEM.replacePlaceholders(options).replace(/\\n/gm, '\n').replaceAll("\"", "") + ';';
                data = data.replaceAll('= {', '= { \n\t').replaceAll('},', '},\n\t').replaceAll('}}', '}\n}');
                fs.writeFile(fileName,
                    data,
                    'utf-8',
                    function(error, success) {
                        if (error) {
                            SYSTEM.LOG.error('While creating object for file : ', fileName, ' : ', error);
                            reject(error);
                        } else {
                            SYSTEM.LOG.debug('Creating class object for : ', fileName);
                            DAO[entityName] = require(fileName);
                            DAO[entityName].LOG = SYSTEM.createLogger(entityName);
                            resolve(true);
                        }
                    });
            }
        });
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
        return commonDefinitionString;
    },

    startServers: function() {
        return new Promise((resolve, reject) => {
            try {
                if (CONFIG.get('server').runAsSingleModule) {
                    if (!NODICS.getModules().default || !NODICS.getModules().default.app) {
                        SYSTEM.LOG.error('Server configurations has not be initialized. Please verify.');
                        process.exit(CONFIG.get('errorExitCode'));
                    }
                    const httpPort = SYSTEM.getPort('default');
                    SYSTEM.LOG.info('Starting Server for module : default on PORT : ', httpPort);
                    NODICS.getModules().default.app.listen(httpPort);
                    resolve(true);
                } else {
                    let modules = NODICS.getModules();
                    if (UTILS.isBlank(NODICS.getModules())) {
                        SYSTEM.LOG.error('Please define valid active modules');
                        process.exit(CONFIG.get('errorExitCode'));
                    }
                    _.each(modules, function(value, moduleName) {
                        if (value.metaData && value.metaData.publish) {
                            if (!value.app) {
                                SYSTEM.LOG.error('Server configurations has not be initialized for module : ', moduleName);
                                process.exit(CONFIG.get('errorExitCode'));
                            }
                            const httpPort = SYSTEM.getPort(moduleName);
                            if (!httpPort) {
                                SYSTEM.LOG.error('Please define listening PORT for module: ', moduleName);
                                process.exit(CONFIG.get('errorExitCode'));
                            }
                            SYSTEM.LOG.info('Starting Server for module : ', moduleName, ' on PORT : ', httpPort);
                            value.app.listen(httpPort);
                        }
                        resolve(true);
                    });
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    createFile: function(filePath, data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, data, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    },

    removeDirectory: function(dirPath, removeSelf) {
        if (removeSelf === undefined)
            removeSelf = true;
        try {
            var files = fs.readdirSync(dirPath);
        } catch (e) {
            return;
        }
        if (files.length > 0)
            for (var i = 0; i < files.length; i++) {
                var filePath = dirPath + '/' + files[i];
                if (fs.statSync(filePath).isFile())
                    fs.unlinkSync(filePath);
                else
                    rmDir(filePath);
            }
        if (removeSelf)
            fs.rmdirSync(dirPath);
    }
};