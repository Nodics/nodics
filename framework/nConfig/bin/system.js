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
const Config = require('./config');
const Nodics = require('./nodics');
const winston = require('winston');
const Elasticsearch = require('winston-elasticsearch');
const props = require('../config/properties');

module.exports = {
    LOG: {},
    getActiveModules: function(options) {
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
            this.collectModulesList(NODICS.getNodicsHome(), nodicsModulePath);
            if (NODICS.getCustomHome() !== NODICS.getNodicsHome()) {
                this.collectModulesList(NODICS.getCustomHome(), nodicsModulePath);
            }
            nodicsModulePath.push(appHome);
            nodicsModulePath.push(envHome);
            this.collectModulesList(serverHome, nodicsModulePath);
            let mergedFile = {};
            nodicsModulePath.forEach(function(modulePath) {
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
        serverProperties.activeModules.groups.forEach((groupName) => {
            if (!moduleData[groupName]) {
                console.log('   ERROR: Invalide module group : ', groupName);
                process.exit(1);
            }
            modules = modules.concat(moduleData[groupName]);
        });
        modules = modules.concat(serverProperties.activeModules.modules);
        return modules;
    },
    prepareOptions: function(options) {
        if (!options.NODICS_HOME) {
            options.NODICS_HOME = process.env.NODICS_HOME || process.cwd();
        }
        if (!options.CUSTOM_HOME) {
            options.CUSTOM_HOME = process.env.CUSTOM_HOME || options.NODICS_HOME;
        }
        if (!options.NODICS_APP) {
            if (process.argv[2]) {
                options.NODICS_APP = process.argv[2];
            } else {
                console.log('   WARN: Could not found App Name, So starting with default "kickoff"');
                options.NODICS_APP = 'kickoff';
            }
        }
        if (!options.NODICS_ENV) {
            if (process.argv[3]) {
                options.NODICS_ENV = process.argv[3];
            } else {
                console.log('   WARN: Could not found Environment Name, So starting with default "local"');
                options.NODICS_ENV = 'local';
            }

        }
        if (!options.NODICS_SEVER) {
            if (process.argv[4]) {
                options.NODICS_SEVER = process.argv[4];
            } else {
                options.NODICS_SEVER = 'sampleServer';
                console.log('   WARN: Could not found Server Name, So starting with default "sampleServer"');
            }

        }
        if (process.argv) {
            options.argv = process.argv;
        }
        if (!options.NODICS_HOME) {
            console.error('   ERROR: Please pass valid NODICS_HOME. It can be pass as options or set to evn variable');
            process.exit(1);
        }
        if (!options.NODICS_APP) {
            console.error('   ERROR: Could not found valid application name to run');
            process.exit(1);
        }
        if (!options.NODICS_ENV) {
            console.error('   ERROR: Could not found valid environmnet name to run');
            process.exit(1);
        }
        if (!options.NODICS_SEVER) {
            console.error('   ERROR: Could not found valid server name to run');
            process.exit(1);
        }
        //global.NODICS = new Nodics(options.NODICS_ENV, options.NODICS_HOME, options.NODICS_SEVER, options.argv);
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
                data: {}, //All the test cases, those needs to be executed in secific environment.
                suites: {} //Best usecase could be testing all created pages     
            },
            uTestPool: {
                data: {},
                suites: {} // This pool for all test cases
            }
        };

        global.DATA = {
            init: {},
            core: {},
            sample: {}
        };
    },

    subFolders: function(folder) {
        return fs.readdirSync(folder)
            .filter(subFolder => fs.statSync(path.join(folder, subFolder)).isDirectory())
            .filter(subFolder => subFolder !== 'node_modules' && subFolder !== 'templates' && subFolder[0] !== '.')
            .map(subFolder => path.join(folder, subFolder));
    },

    collectModulesList: function(folder, modulePathList) {
        const hasPackageJson = fs.existsSync(path.join(folder, 'package.json'));
        if (hasPackageJson) {
            modulePathList.push(folder);
        }
        for (let subFolder of this.subFolders(folder)) {
            if (!subFolder.endsWith(NODICS.getActiveApplication())) {
                this.collectModulesList(subFolder, modulePathList);
            }
        }
    },
    sortModulesByIndex: function(moduleIndex) {
        moduleIndex = _.groupBy(moduleIndex, function(element) {
            return parseInt(element.index);
        });
        return moduleIndex;
    },

    getModulesMetaData: function() {
        let _self = this;
        let appHome = NODICS.getCustomHome() + '/' + NODICS.getActiveApplication();
        let envHome = appHome + '/' + NODICS.getActiveEnvironment();
        let config = CONFIG.getProperties();
        let modules = NODICS.getModules();
        let moduleIndex = [];
        let metaData = {};
        var nodicsModulePath = [],
            serverModulePath = [appHome, envHome];

        //Get list of OOTB Active modules
        this.collectModulesList(NODICS.getNodicsHome(), nodicsModulePath);
        if (NODICS.getCustomHome() !== NODICS.getNodicsHome()) {
            this.collectModulesList(NODICS.getCustomHome(), nodicsModulePath);
        }
        //Adding list of Custom Active modules
        this.collectModulesList(NODICS.getServerHome(), serverModulePath);

        nodicsModulePath = nodicsModulePath.concat(serverModulePath);
        var counter = 0;
        nodicsModulePath.forEach(function(modulePath) {
            var moduleFile = require(modulePath + '/package.json');
            if (NODICS.isModuleActive(moduleFile.name)) {
                metaData[moduleFile.name] = moduleFile;
                if (!moduleFile.index) {
                    this.LOG.error('   ERROR: Please update index property in package.json for module : ', moduleFile.name);
                    process.exit(1);
                }
                if (isNaN(moduleFile.index)) {
                    this.LOG.error('   ERROR: Property index contain invalid value in package.json for module : ', moduleFile.name);
                    process.exit(1);
                }
                let indexData = {};
                let moduleMetaData = {};

                moduleMetaData.metaData = moduleFile;
                moduleMetaData.modulePath = modulePath;
                NODICS.addModule(moduleMetaData);

                indexData.index = moduleFile.index;
                indexData.name = moduleFile.name;
                indexData.path = modulePath;
                moduleIndex.push(indexData);
            }
        });
        config.moduleIndex = this.sortModulesByIndex(moduleIndex);
        config.metaData = metaData;
    },

    loadFiles: function(fileName, frameworkFile) {
        let _self = this;
        let mergedFile = frameworkFile || {};
        Object.keys(CONFIG.get('moduleIndex')).forEach(function(key) {
            var value = CONFIG.get('moduleIndex')[key][0];
            var filePath = value.path + fileName;
            if (fs.existsSync(filePath)) {
                _self.LOG.info('   INFO: Loading file from : ' + filePath);
                var commonPropertyFile = require(filePath);
                mergedFile = _.merge(mergedFile, commonPropertyFile);
            }
        });
        return mergedFile;
    },

    processFiles: function(filePath, filePostFix, callback) {
        let _self = this;
        if (fs.existsSync(filePath)) {
            let files = fs.readdirSync(filePath);
            if (files) {
                files.map(function(file) {
                    return path.join(filePath, file);
                }).filter(function(file) {
                    if (fs.statSync(file).isDirectory()) {
                        _self.processFiles(file, filePostFix, callback);
                    } else {
                        return fs.statSync(file).isFile();
                    }
                }).filter(function(file) {
                    if (!filePostFix || filePostFix === '*') {
                        return true;
                    } else {
                        return file.endsWith(filePostFix);
                    }
                }).forEach(function(file) {
                    _self.LOG.info('   INFO: Loading file from : ', file);
                    callback(file);
                });
            }
        }
    },

    getAllMethods: function(envScripts) {
        return Object.getOwnPropertyNames(envScripts).filter(function(prop) {
            return typeof envScripts[prop] == 'function';
        });
    },

    changeLogLevel: function(entityName, logLevel) {

    },
    createLogger: function(entityName, logConfig) {
        logConfig = logConfig || CONFIG.get('log');
        let entityLevel = logConfig['logLevel' + entityName];
        let config = this.getLoggerConfiguration(entityName, entityLevel, logConfig);
        let logger = new winston.Logger(config);
        NODICS.addLogger(entityName, logger);
        return logger;
    },

    getLoggerConfiguration: function(entityName, level, logConfig) {
        return {
            level: level || logConfig.level || 'info',
            //format: SYSTEM.getLogFormat(logConfig),
            transports: this.getLogTransports(entityName, logConfig)
        };
    },

    getLogFormat: function(logConfig) {
        if (logConfig.format == 'json') {
            return winston.format.json();
        } else {
            return winston.format.simple();
        }
    },
    getLogTransports: function(entityName, logConfig) {
        let transports = [];
        if (logConfig.output.console) {
            transports.push(this.createConsoleTransport(entityName, logConfig));
        }
        if (logConfig.output.file) {
            transports.push(this.createFileTransport(entityName, logConfig));
        }
        if (logConfig.output.elastic) {
            transports.push(this.createFileTransport(entityName, logConfig));
        }
        return transports;
    },

    createConsoleTransport: function(entityName, logConfig) {
        let consoleConfig = _.merge({}, logConfig.consoleConfig);
        consoleConfig.label = entityName;
        return new winston.transports.Console(consoleConfig);
    },

    createFileTransport: function(entityName, logConfig) {
        let fileConfig = _.merge({}, logConfig.fileConfig);
        fileConfig.label = entityName;
        fileConfig.filename = NODICS.getServerHome() + '/logs/' + fileConfig.filename;
        return new winston.transports.File(fileConfig);
    },

    createElasticTransport: function(entityName, logConfig) {
        let elasticConfig = _.merge({}, logConfig.elasticConfig);
        elasticConfig.label = entityName;
        return new Elasticsearch(elasticConfig);
    }
};