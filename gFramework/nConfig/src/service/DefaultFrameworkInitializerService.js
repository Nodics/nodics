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
const enumService = require('./defaultEnumService');
const fileLoader = require('./defaultFilesLoaderService');
const classesLoader = require('./defaultClassesHandlerService');

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
            if (obj.name.length > 0 && obj.name.length <= 8) {
                this.LOG.info('    ' + obj.name + '\t\t\t : ' + key);
            } else if (obj.name.length > 8 && obj.name.length < 15) {
                this.LOG.info('    ' + obj.name + '\t\t : ' + key);
            } else {
                this.LOG.info('    ' + obj.name + '\t : ' + key);
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
            this.LOG = logger.createLogger('DefaultModuleInitializerService', prop.log);
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
    },

    initUtilities: function (options) {
        return new Promise((resolve, reject) => {
            try {
                if (!CONFIG || !NODICS) {
                    this.LOG.error("System initialization error: configuration initializer failure.");
                    process.exit(1);
                }
                enumService.LOG.info('Starting Enums loader process');
                enumService.loadEnums();
                classesLoader.LOG.info('Starting Classes loader process');
                classesLoader.loadClasses();
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    loadModules: function (modules = Array.from(NODICS.getIndexedModules().keys())) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (modules && modules.length > 0) {
                let moduleIndex = modules.shift();
                let moduleName = NODICS.getIndexedModules().get(moduleIndex).name;
                _self.loadModule(moduleName).then(success => {
                    _self.loadModules(modules).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });

            } else {
                resolve(true);
            }
        });
    },

    loadModule: function (moduleName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.debug('Staring process for module : ', moduleName);
            let moduleObject = NODICS.getRawModule(moduleName);
            let moduleFile = require(moduleObject.path + '/nodics.js');
            if (moduleFile.init) {
                moduleFile.LOG = logger.createLogger("Module-" + moduleName);
                moduleFile.init(moduleObject).then(success => {
                    _self.loadDao(moduleObject).then(() => {
                        return _self.loadServices(moduleObject);
                    }).then(() => {
                        return _self.loadPipelinesDefinition(moduleObject);
                    }).then(() => {
                        return _self.loadFacades(moduleObject);
                    }).then(() => {
                        return _self.loadControllers(moduleObject);
                    }).then(() => {
                        resolve(true);
                    }).catch((error) => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } else {
                _self.loadDao(moduleObject).then(() => {
                    return _self.loadServices(moduleObject);
                }).then(() => {
                    return _self.loadPipelinesDefinition(moduleObject);
                }).then(() => {
                    return _self.loadFacades(moduleObject);
                }).then(() => {
                    return _self.loadControllers(moduleObject);
                }).then(() => {
                    resolve(true);
                }).catch((error) => {
                    reject(error);
                });
            }
        });
    },

    loadDao: function (module) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.debug('  Loading all module DAO');
            let path = module.path + '/src/dao';
            try {
                fileLoader.processFiles(path, "Dao.js", (file) => {
                    let daoName = UTILS.getFileNameWithoutExtension(file);
                    if (DAO[daoName]) {
                        DAO[daoName] = _.merge(DAO[daoName], require(file));
                    } else {
                        DAO[daoName] = require(file);
                        DAO[daoName].LOG = logger.createLogger(daoName);
                    }
                });
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    loadServices: function (module) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.debug('  Loading all module services');
            let path = module.path + '/src/service';
            try {
                fileLoader.processFiles(path, "Service.js", (file) => {
                    let serviceName = UTILS.getFileNameWithoutExtension(file);
                    if (SERVICE[serviceName]) {
                        SERVICE[serviceName] = _.merge(SERVICE[serviceName], require(file));
                    } else {
                        SERVICE[serviceName] = require(file);
                        SERVICE[serviceName].LOG = logger.createLogger(serviceName);
                    }
                });
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    loadPipelinesDefinition: function (module) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.debug('  Loading all module process definitions');
            let path = module.path + '/src/pipelines';
            try {
                fileLoader.processFiles(path, "Definition.js", (file) => {
                    let processName = UTILS.getFileNameWithoutExtension(file);
                    if (PIPELINE[processName]) {
                        PIPELINE[processName] = _.merge(PIPELINE[processName], require(file));
                    } else {
                        PIPELINE[processName] = require(file);
                    }
                });
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    loadFacades: function (module) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.debug('  Loading all module facades');
            let path = module.path + '/src/facade';
            try {
                fileLoader.processFiles(path, "Facade.js", (file) => {
                    let facadeName = UTILS.getFileNameWithoutExtension(file);
                    if (FACADE[facadeName]) {
                        FACADE[facadeName] = _.merge(FACADE[facadeName], require(file));
                    } else {
                        FACADE[facadeName] = require(file);
                        FACADE[facadeName].LOG = logger.createLogger(facadeName);
                    }
                });
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    loadControllers: function (module) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.debug('  Loading all module controllers');
            let path = module.path + '/src/controller';
            try {
                fileLoader.processFiles(path, "Controller.js", (file) => {
                    let controllerName = UTILS.getFileNameWithoutExtension(file);
                    if (CONTROLLER[controllerName]) {
                        CONTROLLER[controllerName] = _.merge(CONTROLLER[controllerName], require(file));
                    } else {
                        CONTROLLER[controllerName] = require(file);
                        CONTROLLER[controllerName].LOG = logger.createLogger(controllerName);
                    }
                });
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    initEntities: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.debug('Initializing all entities');
            _self.initDaos().then(() => {
                return _self.initServices();
            }).then(() => {
                return _self.initFacades();
            }).then(() => {
                return _self.initControllers();
            }).then(() => {
                resolve(true);
            }).catch((error) => {
                reject(error);
            });
        });
    },

    initDaos: function () {
        return new Promise((resolve, reject) => {
            let allPromise = [];
            _.each(DAO, (daoClass, daoName) => {
                if (daoClass.init &&
                    typeof daoClass.init === 'function') {
                    allPromise.push(daoClass.init());
                }
            });
            if (allPromise.length > 0) {
                _self.LOG.debug('  Initializing all DAOs');
                Promise.all(allPromise).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    initServices: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            let allPromise = [];
            _.each(SERVICE, (serviceClass, serviceName) => {
                if (serviceClass.init &&
                    typeof serviceClass.init === 'function') {
                    allPromise.push(serviceClass.init());
                }
            });
            if (allPromise.length > 0) {
                _self.LOG.debug('  Initializing all Services');
                Promise.all(allPromise).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    initFacades: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            let allPromise = [];
            _.each(FACADE, (facadeClass, facadeName) => {
                if (facadeClass.init &&
                    typeof facadeClass.init === 'function') {
                    allPromise.push(facadeClass.init());
                }
            });
            if (allPromise.length > 0) {
                _self.LOG.debug('  Initializing all Facades');
                Promise.all(allPromise).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    initControllers: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            let allPromise = [];
            _.each(CONTROLLER, (controllerClass, controllerName) => {
                if (controllerClass.init &&
                    typeof controllerClass.init === 'function') {
                    allPromise.push(controllerClass.init());
                }
            });
            if (allPromise.length > 0) {
                _self.LOG.debug('  Initializing all Controllers');
                Promise.all(allPromise).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    finalizeEntities: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.debug('Finalizing all entities');
            _self.finalizeDaos().then(() => {
                return _self.finalizeServices();
            }).then(() => {
                return _self.finalizeFacades();
            }).then(() => {
                return _self.finalizeControllers();
            }).then(() => {
                resolve(true);
            }).catch((error) => {
                reject(error);
            });
        });
    },

    finalizeDaos: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            let allPromise = [];
            _.each(DAO, (daoClass, daoName) => {
                if (daoClass.postInit &&
                    typeof daoClass.postInit === 'function') {
                    allPromise.push(daoClass.postInit());
                }
            });
            if (allPromise.length > 0) {
                _self.LOG.debug('  Finalizing all DAOs');
                Promise.all(allPromise).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    finalizeServices: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            let allPromise = [];
            _.each(SERVICE, (serviceClass, serviceName) => {
                if (serviceClass.postInit &&
                    typeof serviceClass.postInit === 'function') {
                    allPromise.push(serviceClass.postInit());
                }
            });
            if (allPromise.length > 0) {
                _self.LOG.debug('  Finalizing all Services');
                Promise.all(allPromise).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    finalizeFacades: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            let allPromise = [];
            _.each(FACADE, (facadeClass, facadeName) => {
                if (facadeClass.postInit &&
                    typeof facadeClass.postInit === 'function') {
                    allPromise.push(facadeClass.postInit());
                }
            });
            if (allPromise.length > 0) {
                _self.LOG.debug('  Finalizing all Facades');
                Promise.all(allPromise).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    finalizeControllers: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            let allPromise = [];
            _.each(CONTROLLER, (controllerClass, controllerName) => {
                if (controllerClass.postInit &&
                    typeof controllerClass.postInit === 'function') {
                    allPromise.push(controllerClass.postInit());
                }
            });
            if (allPromise.length > 0) {
                _self.LOG.debug('  Finalizing all controllers');
                Promise.all(allPromise).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    finalizeModules: function (modules = Array.from(NODICS.getIndexedModules().keys())) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (modules && modules.length > 0) {
                let moduleIndex = modules.shift();
                let moduleName = NODICS.getIndexedModules().get(moduleIndex).name;
                _self.finalizeModule(moduleName).then(success => {
                    _self.finalizeModules(modules).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });

            } else {
                resolve(true);
            }
        });
    },

    finalizeModule: function (moduleName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.debug('Starting process to finalize module : ', moduleName);
            let moduleObject = NODICS.getRawModule(moduleName);
            let moduleFile = require(moduleObject.path + '/nodics.js');
            if (moduleFile.postInit && typeof moduleFile.postInit === 'function') {
                moduleFile.postInit(moduleObject).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    }
};