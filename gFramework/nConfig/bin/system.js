/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const initService = require('../src/service/DefaultFrameworkInitializerService');
const logger = require('../src/service/DefaultLoggerService');
const enumService = require('../src/service/defaultEnumService');
const fileLoader = require('../src/service/defaultFilesLoaderService');
const classesLoader = require('../src/service/defaultClassesHandlerService');

module.exports = {
    initUtilities: function (options) {
        return new Promise((resolve, reject) => {
            try {
                if (!CONFIG || !NODICS) {
                    initService.LOG.error("System initialization error: configuration initializer failure.");
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
            initService.LOG.debug('Staring process for module : ', moduleName);
            let moduleObject = NODICS.getRawModule(moduleName);
            let moduleFile = require(moduleObject.path + '/nodics.js');
            if (moduleFile.init) {
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
            initService.LOG.debug('  Loading all module DAO');
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
            initService.LOG.debug('  Loading all module services');
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
            initService.LOG.debug('  Loading all module process definitions');
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
            initService.LOG.debug('  Loading all module facades');
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
            initService.LOG.debug('  Loading all module controllers');
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
            initService.LOG.debug('Initializing all entities');
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
                initService.LOG.debug('  Initializing all DAOs');
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
        return new Promise((resolve, reject) => {
            let allPromise = [];
            _.each(SERVICE, (serviceClass, serviceName) => {
                if (serviceClass.init &&
                    typeof serviceClass.init === 'function') {
                    allPromise.push(serviceClass.init());
                }
            });
            if (allPromise.length > 0) {
                initService.LOG.debug('  Initializing all Services');
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
        return new Promise((resolve, reject) => {
            let allPromise = [];
            _.each(FACADE, (facadeClass, facadeName) => {
                if (facadeClass.init &&
                    typeof facadeClass.init === 'function') {
                    allPromise.push(facadeClass.init());
                }
            });
            if (allPromise.length > 0) {
                initService.LOG.debug('  Initializing all Facades');
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
        return new Promise((resolve, reject) => {
            let allPromise = [];
            _.each(CONTROLLER, (controllerClass, controllerName) => {
                if (controllerClass.init &&
                    typeof controllerClass.init === 'function') {
                    allPromise.push(controllerClass.init());
                }
            });
            if (allPromise.length > 0) {
                initService.LOG.debug('  Initializing all Controllers');
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
            initService.LOG.debug('Finalizing all entities');
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
        return new Promise((resolve, reject) => {
            let allPromise = [];
            _.each(DAO, (daoClass, daoName) => {
                if (daoClass.postInit &&
                    typeof daoClass.postInit === 'function') {
                    allPromise.push(daoClass.postInit());
                }
            });
            if (allPromise.length > 0) {
                initService.LOG.debug('  Finalizing all DAOs');
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
        return new Promise((resolve, reject) => {
            let allPromise = [];
            _.each(SERVICE, (serviceClass, serviceName) => {
                if (serviceClass.postInit &&
                    typeof serviceClass.postInit === 'function') {
                    allPromise.push(serviceClass.postInit());
                }
            });
            if (allPromise.length > 0) {
                initService.LOG.debug('  Finalizing all Services');
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
        return new Promise((resolve, reject) => {
            let allPromise = [];
            _.each(FACADE, (facadeClass, facadeName) => {
                if (facadeClass.postInit &&
                    typeof facadeClass.postInit === 'function') {
                    allPromise.push(facadeClass.postInit());
                }
            });
            if (allPromise.length > 0) {
                initService.LOG.debug('  Finalizing all Facades');
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
        return new Promise((resolve, reject) => {
            let allPromise = [];
            _.each(CONTROLLER, (controllerClass, controllerName) => {
                if (controllerClass.postInit &&
                    typeof controllerClass.postInit === 'function') {
                    allPromise.push(controllerClass.postInit());
                }
            });
            if (allPromise.length > 0) {
                initService.LOG.debug('  Finalizing all controllers');
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
        return new Promise((resolve, reject) => {
            initService.LOG.debug('Starting process to finalize module : ', moduleName);
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