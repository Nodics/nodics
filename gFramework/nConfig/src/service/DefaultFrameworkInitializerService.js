/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const fs = require('fs');
const util = require('util');
const props = require('../../config/properties');
const logger = require('./DefaultLoggerService');

module.exports = {

    sortModules: function (rawData) {
        indexedData = rawData.map(a => a.split('.').map(n => +n + 100000).join('.')).sort()
            .map(a => a.split('.').map(n => +n - 100000).join('.'));
        return indexedData;
    },

    printInfo: function () {
        if (!NODICS) {
            this.LOG.error("System initialization error: options cann't be null or empty");
            process.exit(1);
        }
        this.LOG.info('###   Initializing Nodics, Node based enterprise application solution   ###');
        this.LOG.info('---------------------------------------------------------------------------');
        this.LOG.info('NODICS_HOME       : ', NODICS.getNodicsHome());
        this.LOG.info('NODICS_APP        : ', NODICS.getApplicationPath());
        this.LOG.info('NODICS_ENV        : ', NODICS.getEnvironmentPath());
        this.LOG.info('SERVER_PATH       : ', NODICS.getServerPath());
        this.LOG.info('---------------------------------------------------------------------------\n');
        this.LOG.info('###   Sequence in which modules has been loaded (Top to Bottom)   ###');
        let activeModules = [];
        NODICS.getIndexedModules().forEach((obj, key) => {
            if (obj.name.length < 7) {
                this.LOG.info('    ' + obj.name + '\t\t\t\t : ' + key);
            } else if (obj.name.length > 17) {
                this.LOG.info('    ' + obj.name + '\t\t : ' + key);
            } else {
                this.LOG.info('    ' + obj.name + '\t\t\t : ' + key);
            }
            activeModules.push(obj.name);
        });
        console.log();
        NODICS.setActiveModules(activeModules);
    },

    prepareOptions: function () {
        NODICS.setActiveModules(this.getActiveModules());
        CONFIG.setProperties({});
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

    getActiveModules: function () {
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
            this.LOG = logger.createLogger('Framework', prop.log);
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

        let indexedValue = _self.sortModules(indexValue);
        let moduleList = new Map();
        indexedValue.forEach((key) => {
            moduleList.set(key, moduleIndex[key]);
        });
        NODICS.setIndexedModules(moduleList);
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
        if (files && files.length > 0) {
            files.forEach(function (filePath) {
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
    }
};