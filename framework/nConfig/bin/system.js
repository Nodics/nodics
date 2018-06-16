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

    getActiveModules: function (options) {
        try {
            let modules = [];
            let customPath = NODICS.getCustomHome();
            let appHome = customPath + '/' + NODICS.getActiveApplication();
            let envHome = appHome + '/' + NODICS.getActiveEnvironment();
            let serverHome = envHome + '/' + NODICS.getServerName();

            NODICS.setServerHome(serverHome);
            let moduleGroupsFilePath = serverHome + '/config/modules.js';
            let serverProperties = {};
            serverProperties = _.merge(serverProperties, require(appHome + '/config/properties.js'));
            serverProperties = _.merge(serverProperties, require(envHome + '/config/properties.js'));
            serverProperties = _.merge(serverProperties, require(serverHome + '/config/properties.js'));
            //Starting Log for System and Nodics
            let prop = _.merge(props, serverProperties);
            this.LOG = this.createLogger('SYSTEM', prop.log);
            if (!fs.existsSync(moduleGroupsFilePath) || serverProperties.activeModules.updateGroups) {
                var nodicsModulePath = [];
                UTILS.collectModulesList(NODICS.getNodicsHome(), nodicsModulePath);
                if (NODICS.getCustomHome() !== NODICS.getNodicsHome()) {
                    UTILS.collectModulesList(NODICS.getCustomHome(), nodicsModulePath);
                }
                nodicsModulePath.push(appHome);
                nodicsModulePath.push(envHome);
                UTILS.collectModulesList(serverHome, nodicsModulePath);
                let mergedFile = {};
                nodicsModulePath.forEach(function (modulePath) {
                    if (fs.existsSync(modulePath + '/config/properties.js')) {
                        mergedFile = _.merge(mergedFile, require(modulePath + '/config/properties.js'));
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

    prepareOptions: function (options) {
        if (!options.NODICS_HOME) {
            options.NODICS_HOME = process.env.NODICS_HOME || process.cwd();
        }
        if (!options.CUSTOM_HOME) {
            options.CUSTOM_HOME = process.env.CUSTOM_HOME || options.NODICS_HOME;
        }
        let appName = 'kickoff';
        let envName = 'local';
        let serverName = 'sampleServer';
        console.log(process.argv);
        process.argv.forEach(element => {
            if (element.startsWith('--A')) {
                appName = element.replace('--A', '');
            } else if (element.startsWith('--APP')) {
                appName = element.replace('--APP', '');
            } else if (element.startsWith('--E')) {
                envName = element.replace('--E', '');
            } else if (element.startsWith('--ENV')) {
                envName = element.replace('--ENV', '');
            } else if (element.startsWith('--S')) {
                serverName = element.replace('--S', '');
            } else if (element.startsWith('--SERVER')) {
                serverName = element.replace('--SERVER', '');
            }
        });
        if (!options.NODICS_APP) {
            options.NODICS_APP = appName;
        }
        if (!options.NODICS_ENV) {
            options.NODICS_ENV = envName;
        }
        if (!options.NODICS_SEVER) {
            options.NODICS_SEVER = serverName;
        }
        if (process.argv) {
            options.argv = process.argv;
        }
        global.NODICS = new Nodics(options.NODICS_HOME, options.CUSTOM_HOME, options.NODICS_APP, options.NODICS_ENV, options.NODICS_SEVER, options.argv);
        NODICS.setActiveModules(this.getActiveModules(options));
        global.CONFIG = new Config();
        CONFIG.setProperties({});

        global.SYSTEM = {};
        global.CLASSES = {};
        global.ENUMS = {};
        global.UTILS = {};

        global.DAO = {};
        global.SERVICE = {};
        global.PROCESS = {};
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

    addModuleInActiveList: function (moduleName) {
        NODICS.getActiveModules().push(moduleName);
    },

    getAllModules: function (appHome, envHome) {
        var nodicsModulePath = [];
        UTILS.collectModulesList(NODICS.getNodicsHome(), nodicsModulePath);
        if (NODICS.getCustomHome() !== NODICS.getNodicsHome()) {
            UTILS.collectModulesList(NODICS.getCustomHome(), nodicsModulePath);
        }
        return nodicsModulePath;
    },

    loadModuleIndex: function () {
        let _self = this;
        let config = CONFIG.getProperties();
        let appHome = NODICS.getCustomHome() + '/' + NODICS.getActiveApplication();
        let envHome = appHome + '/' + NODICS.getActiveEnvironment();
        let moduleIndex = [];
        let nodicsModulePath = _self.getAllModules(appHome, envHome);
        nodicsModulePath.forEach(function (modulePath) {
            let indexData = _self.addModuleIndex(modulePath);
            if (indexData) {
                moduleIndex.push(indexData);
            }
        });
        config.rawModuleIndex = moduleIndex;
        _self.finalizeModuleIndex();
    },

    finalizeModuleIndex: function () {
        let config = CONFIG.getProperties();
        config.moduleIndex = UTILS.sortModulesByIndex(config.rawModuleIndex);
        let modules = {};
        config.rawModuleIndex.forEach(module => {
            modules[module.name] = module;
        });
        config.moduleList = modules;
        let modulesStr = '';
        _.each(CONFIG.get('moduleIndex'), (obj, key) => {
            modulesStr = modulesStr + obj[0].name + ',';
        });
        this.LOG.info('Modules:');
        console.log(modulesStr);
    },

    addModuleIndex: function (modulePath) {
        let metaDataFile = modulePath + '/package.json';
        if (fs.existsSync(metaDataFile)) {
            let moduleFile = require(metaDataFile);
            if (NODICS.isModuleActive(moduleFile.name)) {
                if (!moduleFile.index) {
                    this.LOG.error('Please update index property in package.json for module : ', moduleFile.name);
                    process.exit(1);
                }
                if (isNaN(moduleFile.index)) {
                    this.LOG.error('Property index contain invalid value in package.json for module : ', moduleFile.name);
                    process.exit(1);
                }
                return {
                    index: moduleFile.index,
                    name: moduleFile.name,
                    path: modulePath,
                };
            }
        }
    },

    loadModulesMetaData: function () {
        let _self = this;
        let config = CONFIG.getProperties();
        let moduleIndex = CONFIG.get('moduleIndex');
        Object.keys(moduleIndex).forEach(function (index) {
            let group = moduleIndex[index];
            group.forEach(module => {
                _self.loadModuleMetaData(module.name);
            });
        });
    },

    /*
     * This function is used to load module meta data if that module is active
     */
    loadModuleMetaData: function (moduleName) {
        let config = CONFIG.getProperties();
        let module = config.moduleList[moduleName];
        if (module) {
            let filePath = module.path + '/package.json';
            if (fs.existsSync(filePath)) {
                this.LOG.debug('Loading metaData for ' + moduleName + ' from : ', filePath.replace(NODICS.getNodicsHome(), '.'));
                let moduleFile = require(filePath);
                NODICS.addModule({
                    metaData: moduleFile,
                    modulePath: module.path
                });
            }
        }
    },

    /*
     * This function is used to loop through all module (Nodics and Server), and based on thier priority and active state,
     * will load properties from $MODULE/common/properties.js
     */

    loadConfigurations: function (fileName) {
        let _self = this;
        fileName = fileName || '/config/properties.js';
        let config = CONFIG.getProperties();
        let moduleIndex = config.moduleIndex;
        Object.keys(moduleIndex).forEach(function (index) {
            let group = moduleIndex[index];
            group.forEach(module => {
                _self.loadModuleConfiguration(module.name, fileName);
            });
        });
    },

    /*
     * This function used to load configuration file for given moduleName
     */
    loadModuleConfiguration: function (moduleName, fileName) {
        let config = CONFIG.getProperties();
        let module = config.moduleList[moduleName];
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
    loadExternalProperties: function (externalFiles, tntName) {
        let _self = this;
        let files = externalFiles || CONFIG.get('externalPropertyFile');
        if (externalFiles && externalFiles.length > 0) {
            externalFiles.forEach(function (filePath) {
                if (fs.existsSync(filePath)) {
                    _self.LOG.debug('Loading configration file from : ' + filePath.replace(NODICS.getNodicsHome(), '.'));
                    let props = CONFIG.getProperties();
                    if (tntName) {
                        props = CONFIG.getProperties(tntName);
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
            fileConfig.dirname = NODICS.getServerHome() + '/logs';
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
        Object.keys(CONFIG.get('moduleIndex')).forEach(function (key) {
            var value = CONFIG.get('moduleIndex')[key][0];
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
                    _self.LOG.debug(' Loading file from : ', file.replace(NODICS.getNodicsHome(), '.'));
                    callback(file);
                });
            }
        }
    },

    loadFiles: function (fileName, frameworkFile) {
        let _self = this;
        let mergedFile = frameworkFile || {};
        Object.keys(CONFIG.get('moduleIndex')).forEach(function (key) {
            var value = CONFIG.get('moduleIndex')[key][0];
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