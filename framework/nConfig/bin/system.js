var _ = require('lodash');
const path = require('path');
const fs = require('fs');
const util = require('util');
let Config = require('./config');
let Nodics = require('./nodics');

/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    getActiveModules: function(options) {
        let modules = [];
        let moduleGroupsFilePath = NODICS.getServerHome() + '/config/modules.js';
        let serverProperty = require(NODICS.getServerHome() + '/config/common/properties.js');
        if (fs.existsSync(NODICS.getServerHome() + '/config/env-' + options.NODICS_ENV + '/properties.js')) {
            serverProperty = _.merge(serverProperty, require(NODICS.getServerHome() + '/config/env-' + options.NODICS_ENV + '/properties.js'));
        }
        if (!fs.existsSync(moduleGroupsFilePath) || serverProperty.activeModules.updateGroups) {
            var nodicsModulePath = [];
            this.collectModulesList(options.NODICS_HOME, nodicsModulePath);
            this.collectModulesList(options.SERVER_PATH, nodicsModulePath);
            let mergedFile = {};
            nodicsModulePath.forEach(function(modulePath) {
                if (fs.existsSync(modulePath + '/config/properties.js')) {
                    mergedFile = _.merge(mergedFile, require(modulePath + '/config/properties.js'));
                }
                if (fs.existsSync(modulePath + '/config/common/properties.js')) {
                    mergedFile = _.merge(mergedFile, require(modulePath + '/config/common/properties.js'));
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
        //pushing framework modules
        modules = moduleData.framework;
        serverProperty.activeModules.groups.forEach((groupName) => {
            if (!moduleData[groupName]) {
                console.log('   ERROR: Invalide module group : ', groupName);
                process.exit(1);
            }
            modules = modules.concat(moduleData[groupName]);
        });
        //pushing application modules
        modules = modules.concat(serverProperty.activeModules.modules);
        return modules;
    },
    prepareOptions: function(options) {
        if (!options) {
            console.warn('   WARNING: Please set NODICS_HOME into environment variable.');
            options = {};
            options.SERVER_PATH = process.env.SERVER_PATH || process.cwd();
            options.NODICS_HOME = process.env.NODICS_HOME || path.resolve(process.cwd(), '..');
            options.NODICS_ENV = process.env.NODICS_ENV || 'local';
            if (process.argv) {
                options.argv = process.argv;
            }
        } else {
            if (!options.SERVER_PATH) {
                options.SERVER_PATH = process.env.SERVER_PATH || process.cwd();
            }
            if (!options.NODICS_HOME) {
                options.NODICS_HOME = process.env.NODICS_HOME || path.resolve(process.cwd(), '..');
            }
            if (!options.NODICS_ENV) {
                options.NODICS_ENV = process.env.NODICS_ENV || 'local';
            }
            if (process.argv) {
                options.argv = process.argv;
            }
        }
        global.NODICS = new Nodics(options.NODICS_ENV, options.NODICS_HOME, options.SERVER_PATH, options.argv);
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
                data: {}
                //All the test cases, those needs to be executed in secific environment.
                //Best usecase could be testing all created pages
            },
            uTestPool: {
                data: {}
                // This pool for all test cases
            }
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
            if (subFolder !== NODICS.getServerHome()) {
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
        let config = CONFIG.getProperties();
        let modules = NODICS.getModules();
        let moduleIndex = [];
        let metaData = {};
        var nodicsModulePath = [],
            serverModulePath = [];
        //Get list of OOTB Active modules
        this.collectModulesList(NODICS.getNodicsHome(), nodicsModulePath);
        //Adding list of Custom Active modules
        this.collectModulesList(NODICS.getServerHome(), serverModulePath);

        nodicsModulePath = nodicsModulePath.concat(serverModulePath);
        var counter = 0;
        nodicsModulePath.forEach(function(modulePath) {
            var moduleFile = require(modulePath + '/package.json');
            if (NODICS.isModuleActive(moduleFile.name)) {
                metaData[moduleFile.name] = moduleFile;
                if (!moduleFile.index) {
                    console.error('   ERROR: Please update index property in package.json for module : ', moduleFile.name);
                    process.exit(1);
                }
                if (isNaN(moduleFile.index)) {
                    console.error('   ERROR: Property index contain invalid value in package.json for module : ', moduleFile.name);
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
                console.log('   INFO: Loading file from : ' + filePath);
                var commonPropertyFile = require(filePath);
                mergedFile = _.merge(mergedFile, commonPropertyFile);
            }
        });
        return mergedFile;
    },

    getAllMethods: function(envScripts) {
        return Object.getOwnPropertyNames(envScripts).filter(function(prop) {
            return typeof envScripts[prop] == 'function';
        });
    }
};