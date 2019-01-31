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
const winston = require('winston');
require('winston-daily-rotate-file');
const Elasticsearch = require('winston-elasticsearch');
const UTILS = require('../src/utils/utils');
const Nodics = require('./nodics');
const Config = require('./config');
const props = require('../config/properties');

module.exports = {

    loadAllModules: function () {
        this.collectModulesList(NODICS.getNodicsHome());
    },

    subFolders: function (folder) {
        return fs.readdirSync(folder)
            .filter(subFolder => fs.statSync(path.join(folder, subFolder)).isDirectory())
            .filter(subFolder => subFolder !== 'node_modules' && subFolder !== 'templates' && subFolder[0] !== '.')
            .map(subFolder => path.join(folder, subFolder));
    },

    collectModulesList: function (folder, parent) {
        let metaDataPath = path.join(folder, 'package.json');
        if (fs.existsSync(metaDataPath)) {
            let metaData = require(metaDataPath);
            NODICS.addRawModule(metaData, folder, parent);
            parent = metaData.name;
        }
        for (let subFolder of this.subFolders(folder)) {
            this.collectModulesList(subFolder, parent);
        }
    },

    prepareOptions: function () {
        NODICS.setActiveModules(this.getActiveModules());
        global.CONFIG = new Config();
        CONFIG.setProperties({});

        global.SYSTEM = {};
        global.CLASSES = {};
        global.ENUMS = {};
        global.UTILS = {};

        global.DAO = {};
        global.SERVICE = {};
        global.PIPELINE = {};
        global.FACADE = {};
        global.CONTROLLER = {};

        global.TEST = {
            nTestPool: {
                data: {
                    //All the test cases, those needs to be executed in secific environment.
                },
                suites: {
                    //Best usecase could be testing all created pages     
                }
            },
            uTestPool: {
                data: {
                    // This pool for all test cases
                },
                suites: {
                    // This pool for all test cases
                }
            }
        };
    },

    getActiveModules: function (options) {
        try {
            let modules = [];
            let appHome = NODICS.getApplicationPath();
            let envHome = NODICS.getEnvironmentPath();
            let serverHome = NODICS.getServerPath();

            let moduleGroupsFilePath = serverHome + '/config/modules.js';
            let serverProperties = {};
            serverProperties = _.merge(serverProperties, require(appHome + '/config/properties.js'));
            serverProperties = _.merge(serverProperties, require(envHome + '/config/properties.js'));
            serverProperties = _.merge(serverProperties, require(serverHome + '/config/properties.js'));
            let prop = _.merge(props, serverProperties);
            this.LOG = this.createLogger('SYSTEM', prop.log);
            if (!fs.existsSync(moduleGroupsFilePath) || serverProperties.activeModules.updateGroups) {
                let mergedFile = {};
                _.each(NODICS.getRawModules(), (moduleObject, moduleName) => {
                    if (fs.existsSync(moduleObject.path + '/config/properties.js')) {
                        mergedFile = _.merge(mergedFile, require(moduleObject.path + '/config/properties.js'));
                    }
                });
                if (!_.isEmpty(mergedFile.moduleGroups)) {
                    if (fs.existsSync(moduleGroupsFilePath)) {
                        fs.unlinkSync(moduleGroupsFilePath);
                    }
                    fs.writeFileSync(moduleGroupsFilePath, 'module.exports = ' + util.inspect(mergedFile.moduleGroups) + ';', 'utf8');
                }
            }
            let moduleData = require(moduleGroupsFilePath);
            modules = moduleData.framework;
            if (serverProperties.activeModules.groups) {
                serverProperties.activeModules.groups.forEach((groupName) => {
                    if (!moduleData[groupName]) {
                        console.error('Invalid module group : ', groupName);
                        process.exit(1);
                    }
                    modules = modules.concat(moduleData[groupName]);
                });
            }
            modules = modules.concat(serverProperties.activeModules.modules);
            return modules;
        } catch (error) {
            console.error('While preparing active module list : ', error);
        }
    },

    loadModuleIndex: function () {
        let _self = this;
        let moduleIndex = {};
        let indexValue = [];
        _.each(NODICS.getRawModules(), (moduleObject, moduleName) => {
            if (NODICS.isModuleActive(moduleObject.metaData.name)) {
                indexValue.push(moduleObject.index);
                if (!moduleIndex[moduleObject.index]) {
                    moduleIndex[moduleObject.index] = {
                        index: moduleObject.index,
                        name: moduleName,
                        path: moduleObject.path,
                    };
                } else {
                    throw new Error('Module with index: ' + moduleObject.index + ' already exist ' + moduleIndex[moduleObject.index].name);
                }
            }
        });

        let indexedValue = UTILS.sortModules(indexValue);
        let moduleList = new Map();
        indexedValue.forEach((key) => {
            moduleList.set(key, moduleIndex[key]);
        });
        NODICS.setIndexedModules(moduleList);
        _self.printModuleSequence();
        //console.log(NODICS.getIndexedModules().get('1.0'));
        //Array.from(NODICS.getIndexedModules().keys())
        process.exit(1);
    },

    printModuleSequence: function () {
        let modulesStr = '';
        let activeModules = [];
        NODICS.getIndexedModules().forEach((obj, key) => {
            console.log(key, ' ------ ' + obj.name);
            modulesStr = modulesStr + obj.name + ',';
            activeModules.push(obj.name);
        });
        NODICS.setActiveModules(activeModules);
        console.log('Modules: ', modulesStr);
    },

    loadModulesMetaData: function () {
        let _self = this;
        NODICS.getIndexedModules().forEach(function (moduleObject, index) {
            _self.loadModuleMetaData(moduleObject.name);
        });
    },

    /*
     * This function is used to load module meta data if that module is active
     */
    loadModuleMetaData: function (moduleName) {
        let module = NODICS.getRawModule(moduleName);
        if (module) {
            NODICS.addModule({
                metaData: module.metaData,
                modulePath: module.path
            });
        }
    },

    /*
     * This function is used to loop through all module (Nodics and Server), and based on thier priority and active state,
     * will load properties from $MODULE/common/properties.js
     */

    loadConfigurations: function (fileName) {
        let _self = this;
        fileName = fileName || '/config/properties.js';
        NODICS.getIndexedModules().forEach(function (moduleObject, index) {
            _self.loadModuleConfiguration(moduleObject.name, fileName);
        });
    },

    /*
     * This function used to load configuration file for given moduleName
     */
    loadModuleConfiguration: function (moduleName, fileName) {
        let module = NODICS.getRawModule(moduleName);
        if (module) {
            this.loadConfiguration(module.path + fileName);
        }
    },

    /*
     * This function used to load configuration file
     */
    loadConfiguration: function (filePath) {
        let config = CONFIG.getProperties();
        if (fs.existsSync(filePath)) {
            this.LOG.debug('Loading configration file from : ' + filePath.replace(NODICS.getNodicsHome(), '.'));
            var propertyFile = require(filePath);
            config = _.merge(config, propertyFile);
        }
    },

    /*
     * This function is used to loop through all module (Nodics and Server), and based on thier priority and active state,
     * will load properties from $APP_MODULE/config/env-{NODICS_ENV}/properties.js
     */
    loadExternalProperties: function (externalFiles, tntCode) {
        let _self = this;
        let files = externalFiles || CONFIG.get('externalPropertyFile');
        if (externalFiles && externalFiles.length > 0) {
            externalFiles.forEach(function (filePath) {
                if (fs.existsSync(filePath)) {
                    _self.LOG.debug('Loading configration file from : ' + filePath.replace(NODICS.getNodicsHome(), '.'));
                    let props = CONFIG.getProperties();
                    if (tntCode) {
                        props = CONFIG.getProperties(tntCode);
                    }
                    _.merge(props, require(filePath));
                } else {
                    _self.LOG.warn('System cant find configuration at : ' + filePath.replace(NODICS.getNodicsHome(), '.'));
                }
            });
        }
    },

    getAllMethods: function (envScripts) {
        return Object.getOwnPropertyNames(envScripts).filter(function (prop) {
            return typeof envScripts[prop] == 'function';
        });
    },

    changeLogLevel: function (input) {
        let logger = NODICS.getLogger(input.entityName);
        if (logger) {
            logger.level = input.logLevel;
            return true;
        }
        return false;
    },
    createLogger: function (entityName, logConfig) {
        logConfig = logConfig || CONFIG.get('log');
        let entityLevel = logConfig['logLevel' + entityName];
        let config = this.getLoggerConfiguration(entityName, entityLevel, logConfig);
        let logger = new winston.Logger(config);
        NODICS.addLogger(entityName, logger);
        return logger;
    },

    getLoggerConfiguration: function (entityName, level, logConfig) {
        return {
            level: level || logConfig.level || 'info',
            //format: //SYSTEM.getLogFormat(logConfig),
            transports: this.getLogTransports(entityName, logConfig)
        };
    },

    getLogFormat: function (logConfig) {
        if (logConfig.format == 'json') {
            return winston.format.json();
        } else {
            return winston.format.simple();
        }
    },
    getLogTransports: function (entityName, logConfig) {
        let transports = [];
        transports.push(this.createConsoleTransport(entityName, logConfig));
        if (logConfig.output.file) {
            transports.push(this.createFileTransport(entityName, logConfig));
        }
        if (logConfig.output.elastic) {
            transports.push(this.createFileTransport(entityName, logConfig));
        }
        return transports;
    },

    createConsoleTransport: function (entityName, logConfig) {
        let consoleConfig = _.merge({}, logConfig.consoleConfig);
        consoleConfig.label = entityName;
        return new winston.transports.Console(consoleConfig);
    },

    createFileTransport: function (entityName, logConfig) {
        let transport = {};
        let fileConfig = _.merge({}, logConfig.fileConfig);
        fileConfig.label = entityName;
        if (fileConfig.dirname.startsWith('.')) {
            console.log('-------------------------------:', NODICS.getServerPath());
            fileConfig.dirname = NODICS.getServerPath() + '/logs';
        }
        if (!fs.existsSync(fileConfig.dirname)) {
            fs.mkdirSync(fileConfig.dirname);
        }
        try {
            transport = new winston.transports.DailyRotateFile(fileConfig);
        } catch (error) {
            console.error(error);
        }
        return transport;
    },

    createElasticTransport: function (entityName, logConfig) {
        let elasticConfig = _.merge({}, logConfig.elasticConfig);
        elasticConfig.label = entityName;
        return new Elasticsearch(elasticConfig);
    },

    getGlobalVariables: function (fileName) {
        let _self = this;
        let gVar = {};
        NODICS.getIndexedModules().forEach(function (value, key) {
            var filePath = value.path + fileName;
            if (fs.existsSync(filePath)) {
                _self.LOG.debug('Loading file from : ' + filePath.replace(NODICS.getNodicsHome(), '.'));
                fs.readFileSync(filePath).toString().split('\n').forEach((line) => {
                    if (line.startsWith('const') || line.startsWith('let') || line.startsWith('var')) {
                        let value = line.trim().split(' ');
                        if (!gVar[value[1]]) {
                            gVar[value[1]] = {
                                value: line.trim()
                            };
                        }
                    }
                });
            }
        });
        return gVar;
    },

    processFiles: function (filePath, filePostFix, callback) {
        let _self = this;
        if (fs.existsSync(filePath)) {
            let files = fs.readdirSync(filePath);
            if (files) {
                files.map(function (file) {
                    return path.join(filePath, file);
                }).filter(function (file) {
                    if (fs.statSync(file).isDirectory()) {
                        _self.processFiles(file, filePostFix, callback);
                    } else {
                        return fs.statSync(file).isFile();
                    }
                }).filter(function (file) {
                    if (!filePostFix || filePostFix === '*') {
                        return true;
                    } else {
                        return file.endsWith(filePostFix);
                    }
                }).forEach(function (file) {
                    _self.LOG.debug('   Loading file from : ', file.replace(NODICS.getNodicsHome(), '.'));
                    callback(file);
                });
            }
        }
    },

    loadFiles: function (fileName, frameworkFile) {
        let _self = this;
        let mergedFile = frameworkFile || {};
        NODICS.getIndexedModules().forEach(function (value, key) {
            var filePath = value.path + fileName;
            if (fs.existsSync(filePath)) {
                _self.LOG.debug('Loading file from : ' + filePath.replace(NODICS.getNodicsHome(), '.'));
                var commonPropertyFile = require(filePath);
                mergedFile = _.merge(mergedFile, commonPropertyFile);
            }
        });
        return mergedFile;
    },

    loadPreScript: function () {
        SYSTEM.LOG.info('Starting Pre Scripts loader process');
        NODICS.setPreScripts(this.loadFiles('/config/prescripts.js'));
    },

    executePreScripts: function () {
        SYSTEM.LOG.info("Starting pre-script execution process");
        var preScripts = NODICS.getPreScripts();
        var methods = SYSTEM.getAllMethods(preScripts);
        methods.forEach(function (instance) {
            preScripts[instance]();
        });
        SYSTEM.LOG.info("Pre-Script executed successfully");
    },

    loadPostScript: function () {
        SYSTEM.LOG.info('Starting Post Scripts loader process');
        NODICS.setPostScripts(this.loadFiles('/config/postscripts.js'));
    },

    executePostScripts: function () {
        SYSTEM.LOG.info("Starting post-script execution process");
        var postScripts = NODICS.getPostScripts();
        var methods = SYSTEM.getAllMethods(postScripts);
        methods.forEach(function (instance) {
            postScripts[instance]();
        });
        SYSTEM.LOG.info("Post-Script executed successfully");
    },

    performAsync: function (callback) {
        callback();
    }

};