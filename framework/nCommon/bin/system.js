/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const fs = require('fs');
const Enum = require('./enum');

var https = require('https');
var http = require('http');

module.exports = {

    loadEnums: function () {
        let enums = global.ENUMS;
        let enumScript = {};
        SYSTEM.loadFiles('/src/utils/enums.js', enumScript);

        _.each(enumScript, function (value, key) {
            let _option = SYSTEM.createEnumOptions(key, value);
            if (_option) {
                enums[key] = new Enum(value.definition, _option);
            } else {
                enums[key] = new Enum(value.definition);
            }
        });
    },

    createEnumOptions: function (key, enumValue) {
        if (enumValue._options) {
            let _option = {
                name: enumValue._options.name || key,
                separator: enumValue._options.separator || '|',
                ignoreCase: enumValue._options.ignoreCase || false,
                freez: enumValue._options.freez || false
            };
            if (enumValue._options.endianness) {
                _option.endianness = enumValue._options.endianness;
            }
            return _option;
        }
    },

    loadClasses: function () {
        let classes = global.CLASSES;
        let moduleIndex = NODICS.getIndexedModules();
        Object.keys(moduleIndex).forEach(function (key) {
            var value = moduleIndex[key][0];
            SYSTEM.loadModuleClasses(value);
        });
        SYSTEM.generalizeClasses();
    },
    loadModuleClasses: function (module) {
        let path = module.path + '/src/lib';
        SYSTEM.processFiles(path, "*", (file) => {
            if (!file.endsWith('classes.js')) {
                let className = SYSTEM.getFileNameWithoutExtension(file);
                if (CLASSES[className]) {
                    CLASSES[className] = _.merge(CLASSES[className], require(file));
                } else {
                    CLASSES[className] = require(file);
                }
            }
        }, 'classes.js');
    },

    generalizeClasses: function () {
        let classesScripts = {};
        SYSTEM.LOG.debug('Generalizing defined classes');
        SYSTEM.loadFiles('/src/lib/classes.js', classesScripts);

        var methods = SYSTEM.getAllMethods(classesScripts);
        methods.forEach(function (instance) {
            classesScripts[instance]();
        });
    },

    loadModules: function () {
        let moduleIndex = NODICS.getIndexedModules();
        Object.keys(moduleIndex).forEach(function (key) {
            var value = moduleIndex[key][0];
            SYSTEM.loadModule(value.name);
        });
    },

    loadModule: function (moduleName) {
        SYSTEM.LOG.debug('Staring process for module : ', moduleName);
        let module = NODICS.getRawModule(moduleName);

        SYSTEM.loadDao(module);
        SYSTEM.loadServices(module);
        SYSTEM.loadProcessDefinition(module);
        SYSTEM.loadFacades(module);
        SYSTEM.loadControllers(module);
        SYSTEM.loadTest(module);
        let moduleFile = require(module.path + '/nodics.js');
        if (moduleFile.init) {
            moduleFile.init();
        }
    },

    cleanModules: function () {
        let moduleIndex = NODICS.getIndexedModules();
        Object.keys(moduleIndex).forEach(function (key) {
            var value = moduleIndex[key][0];
            SYSTEM.cleanModule(value.name);
        });
    },

    cleanModule: function (moduleName) {
        SYSTEM.LOG.debug('Cleaning module : ', moduleName);
        let module = NODICS.getRawModule(moduleName);
        SYSTEM.cleanDao(module);
        SYSTEM.cleanService(module);
        SYSTEM.cleanFacade(module);
        SYSTEM.cleanController(module);
        SYSTEM.cleanDist(module);
        let moduleFile = require(module.path + '/nodics.js');
        if (moduleFile.clean) {
            moduleFile.clean();
        }
    },

    loadDao: function (module) {
        SYSTEM.LOG.debug('Loading all module DAO');
        let path = module.path + '/src/dao';
        SYSTEM.processFiles(path, "Dao.js", (file) => {
            let daoName = SYSTEM.getFileNameWithoutExtension(file);
            if (DAO[daoName]) {
                DAO[daoName] = _.merge(DAO[daoName], require(file));
            } else {
                DAO[daoName] = require(file);
                DAO[daoName].LOG = SYSTEM.createLogger(daoName);
            }
        });
    },

    cleanDao: function (module) {
        SYSTEM.LOG.debug('Cleaning  all module DAO');
        UTILS.removeDir(path.join(module.path + '/src/dao/gen'));
    },

    cleanService: function (module) {
        SYSTEM.LOG.debug('Cleaning  all module Service');
        UTILS.removeDir(path.join(module.path + '/src/service/gen'));
    },

    cleanFacade: function (module) {
        SYSTEM.LOG.debug('Cleaning  all module Facade');
        UTILS.removeDir(path.join(module.path + '/src/facade/gen'));
    },

    cleanController: function (module) {
        SYSTEM.LOG.debug('Cleaning  all module controller');
        UTILS.removeDir(path.join(module.path + '/src/controller/gen'));
    },


    cleanDist: function (module) {
        SYSTEM.LOG.debug('Cleaning  all module Dist');
        UTILS.removeDir(path.join(module.path + '/dist'));
    },

    loadServices: function (module) {
        SYSTEM.LOG.debug('Loading all module services');
        let path = module.path + '/src/service';
        SYSTEM.processFiles(path, "Service.js", (file) => {
            let serviceName = SYSTEM.getFileNameWithoutExtension(file);
            if (SERVICE[serviceName]) {
                SERVICE[serviceName] = _.merge(SERVICE[serviceName], require(file));
            } else {
                SERVICE[serviceName] = require(file);
                SERVICE[serviceName].LOG = SYSTEM.createLogger(serviceName);
            }
        });
    },

    loadProcessDefinition: function (module) {
        SYSTEM.LOG.debug('Loading all module process definitions');
        let path = module.path + '/src/process';
        SYSTEM.processFiles(path, "Definition.js", (file) => {
            let processName = SYSTEM.getFileNameWithoutExtension(file);
            if (PROCESS[processName]) {
                PROCESS[processName] = _.merge(PROCESS[processName], require(file));
            } else {
                PROCESS[processName] = require(file);
            }
        });
    },

    loadFacades: function (module) {
        SYSTEM.LOG.debug('Loading all module facades');
        let path = module.path + '/src/facade';
        SYSTEM.processFiles(path, "Facade.js", (file) => {
            let facadeName = SYSTEM.getFileNameWithoutExtension(file);
            if (FACADE[facadeName]) {
                FACADE[facadeName] = _.merge(FACADE[facadeName], require(file));
            } else {
                FACADE[facadeName] = require(file);
                FACADE[facadeName].LOG = SYSTEM.createLogger(facadeName);
            }
        });
    },

    loadControllers: function (module) {
        SYSTEM.LOG.debug('Loading all module controllers');
        let path = module.path + '/src/controller';
        SYSTEM.processFiles(path, "Controller.js", (file) => {
            let controllerName = SYSTEM.getFileNameWithoutExtension(file);
            if (CONTROLLER[controllerName]) {
                CONTROLLER[controllerName] = _.merge(CONTROLLER[controllerName], require(file));
            } else {
                CONTROLLER[controllerName] = require(file);
                CONTROLLER[controllerName].LOG = SYSTEM.createLogger(controllerName);
            }
        });
    },

    loadTest: function (module) {
        if (CONFIG.get('test').uTest.enabled) {
            this.loadCommonTest(module);
        }
        if (CONFIG.get('test').nTest.enabled) {
            this.loadEnvTest(module);
        }
    },

    loadCommonTest: function (module) {
        SYSTEM.LOG.debug('Loading module test cases');
        let path = module.path + '/test/common';
        SYSTEM.processFiles(path, "Test.js", (file) => {
            let testFile = this.collectTest(require(file));
            _.each(testFile, (testSuite, suiteName) => {
                if (testSuite.options.type && testSuite.options.type.toLowerCase() === 'ntest') {
                    if (TEST.nTestPool.suites[suiteName]) {
                        TEST.nTestPool.suites[suiteName] = _.merge(TEST.nTestPool.suites[suiteName], testSuite);
                    } else {
                        TEST.nTestPool.suites[suiteName] = testSuite;
                    }
                } else {
                    if (TEST.uTestPool.suites[suiteName]) {
                        TEST.uTestPool.suites[suiteName] = _.merge(TEST.uTestPool.suites[suiteName], testSuite);
                    } else {
                        TEST.uTestPool.suites[suiteName] = testSuite;
                    }
                }
            });
        });
    },

    loadEnvTest: function (module) {
        SYSTEM.LOG.debug('Loading test cases for ENV : ', NODICS.getActiveEnvironment());
        let path = module.path + '/test/env/' + NODICS.getActiveEnvironment();
        SYSTEM.processFiles(path, "Test.js", (file) => {
            let testFile = this.collectTest(require(file));
            _.each(testFile, (testSuite, suiteName) => {
                if (testSuite.options.type && testSuite.options.type.toLowerCase() === 'ntest') {
                    if (TEST.nTestPool.suites[suiteName]) {
                        TEST.nTestPool.suites[suiteName] = _.merge(TEST.nTestPool.suites[suiteName], testSuite);
                    } else {
                        TEST.nTestPool.suites[suiteName] = testSuite;
                    }
                } else {
                    if (TEST.uTestPool.suites[suiteName]) {
                        TEST.uTestPool.suites[suiteName] = _.merge(TEST.uTestPool.suites[suiteName], testSuite);
                    } else {
                        TEST.uTestPool.suites[suiteName] = testSuite;
                    }
                }
            });
        });
    },

    collectTest: function (file) {
        _.each(file, (testSuite, suiteName) => {
            if (testSuite.data) {
                if (testSuite.options.type && testSuite.options.type.toLowerCase() === 'ntest') {
                    TEST.nTestPool.data = _.merge(TEST.nTestPool.data, testSuite.data);
                } else {
                    TEST.uTestPool.data = _.merge(TEST.uTestPool.data, testSuite.data);
                }
                delete testSuite.data;
            }
            _.each(testSuite, (testGroup, groupName) => {
                if (testGroup.data) {
                    if (testSuite.options.type && testSuite.options.type.toLowerCase() === 'ntest') {
                        TEST.nTestPool.data = _.merge(TEST.nTestPool.data, testGroup.data);
                    } else {
                        TEST.uTestPool.data = _.merge(TEST.uTestPool.data, testGroup.data);
                    }
                    delete testGroup.data;
                }
            });
        });
        return file;
    },

    getFileNameWithoutExtension: function (filePath) {
        let fileName = filePath.substring(filePath.lastIndexOf("/") + 1, filePath.lastIndexOf("."));
        return fileName.toUpperCaseFirstChar();
    },

    schemaWalkThrough: function (options) {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(options.currentDir)) {
                fs.mkdirSync(options.currentDir);
            }
            let allPromise = [];
            _.each(NODICS.getModules(), (moduleObject, moduleName) => {
                if (moduleObject.rawSchema) {
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
        });
    },

    createObject: function (options) {
        return new Promise((resolve, reject) => {
            options.modelName = options.schemaName.toUpperCaseEachWord();
            if (options.schemaObject.model) {
                let entityName = options.modelName + options.postFix;
                let fileName = options.currentDir + '/' + entityName + '.js';
                let data = '/*\n' +
                    '\tNodics - Enterprice Micro-Services Management Framework\n\n' +

                    '\tCopyright (c) 2017 Nodics All rights reserved.\n\n' +

                    '\tThis software is the confidential and proprietary information of Nodics ("Confidential Information")\n' +
                    '\tYou shall not disclose such Confidential Information and shall use it only in accordance with the\n' +
                    '\tterms of the license agreement you entered into with Nodics\n' +

                    '*/\n\n';
                if (!UTILS.isBlank(options.gVar)) {
                    _.each(options.gVar, (value, key) => {
                        data = data + value.value + '\n';
                    });
                    data = data + '\n';
                }
                data = data + 'module.exports = ' + SYSTEM.replacePlaceholders(options).replace(/\\n/gm, '\n').replaceAll("\"", "") + ';';
                data = data.replaceAll('= {', '= { \n\t').replaceAll('\',', '\',\n\t').replaceAll('},', '},\n\t').replaceAll('}}', '}\n}');
                fs.writeFile(fileName,
                    data,
                    'utf-8',
                    function (error, success) {
                        if (error) {
                            SYSTEM.LOG.error('While creating object for file : ', fileName.replace(NODICS.getNodicsHome(), '.'), ' : ', error);
                            reject(error);
                        } else {
                            SYSTEM.LOG.debug('Creating class object for : ', fileName.replace(NODICS.getNodicsHome(), '.'));
                            resolve(true);
                        }
                    });
            } else {
                resolve(true);
            }
        });
    },

    replacePlaceholders: function (options) {
        var commonDefinitionString = JSON.stringify(options.commonDefinition, function (key, value) {
            if (typeof value === 'function') {
                return value.toString();
            } else if (typeof value === 'string') {
                return '\'' + value + '\'';
            } else {
                return value;
            }
        });
        let contextRoot = CONFIG.get('server').options.contextRoot;
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

    startServers: function () {
        return new Promise((resolve, reject) => {
            try {
                if (CONFIG.get('server').options.runAsDefault) {
                    if (!NODICS.getModules().default || !NODICS.getModules().default.app) {
                        SYSTEM.LOG.error('Server configurations has not be initialized. Please verify.');
                        process.exit(CONFIG.get('errorExitCode'));
                    }
                    let moduleConfig = SYSTEM.getModuleServerConfig('default');
                    const httpPort = moduleConfig.getServer().getHttpPort();
                    const httpsPort = moduleConfig.getServer().getHttpsPort();
                    SYSTEM.registerListenEvents('default', httpPort, true, http.createServer(NODICS.getModules().default.app)).listen(httpPort);
                    SYSTEM.registerListenEvents('default', httpPort, true, https.createServer(NODICS.getModules().default.app)).listen(httpsPort);
                    moduleConfig.setIsServerRunning(true);
                    resolve(true);
                } else {
                    try {
                        _.each(NODICS.getModules(), function (value, moduleName) {
                            if (value.metaData && value.metaData.publish) {
                                let app = {};
                                let moduleConfig;
                                if (SYSTEM.getModulesPool().isAvailableModuleConfig(moduleName)) {
                                    moduleConfig = SYSTEM.getModuleServerConfig(moduleName);
                                    app = value.app;
                                } else {
                                    moduleConfig = SYSTEM.getModuleServerConfig('default');
                                    app = NODICS.getModules().default.app;
                                }
                                const httpPort = moduleConfig.getServer().getHttpPort();
                                const httpsPort = moduleConfig.getServer().getHttpsPort();
                                if (!httpPort) {
                                    SYSTEM.LOG.error('Please define listening PORT for module: ', moduleName);
                                    process.exit(CONFIG.get('errorExitCode'));
                                }
                                if (!moduleConfig.isServerRunning()) {
                                    SYSTEM.registerListenEvents(moduleName, httpPort, false, http.createServer(app)).listen(httpPort);
                                    SYSTEM.registerListenEvents(moduleName, httpsPort, true, https.createServer(app)).listen(httpsPort);
                                    moduleConfig.setIsServerRunning(true);
                                }
                            }
                        });
                        resolve(true);
                    } catch (err) {
                        reject(err);
                    }
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    registerListenEvents: function (moduleName, port, isSecure, server) {
        server.on('error', function (error) {
            isSecure ? SYSTEM.LOG.error('Failed to start HTTPS Server for module : ', moduleName, ' on PORT : ', port) : SYSTEM.LOG.error('Failed to start HTTP Server for module : ', moduleName, ' on PORT : ', port);
        });
        server.on('listening', function () {
            isSecure ? SYSTEM.LOG.info('Starting HTTPS Server for module : ', moduleName, ' on PORT : ', port) : SYSTEM.LOG.info('Starting HTTP Server for module : ', moduleName, ' on PORT : ', port);
        });
        return server;
    },

    createFile: function (filePath, data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, data, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }
};