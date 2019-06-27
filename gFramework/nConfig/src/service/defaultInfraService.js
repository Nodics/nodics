/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const path = require('path');

module.exports = {
    /**
        * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
        * defined it that with Promise way
        * @param {*} options 
        */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    cleanEntities: function (modules = Array.from(NODICS.getIndexedModules().keys())) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (modules && modules.length > 0) {
                let moduleIndex = modules.shift();
                let moduleName = NODICS.getIndexedModules().get(moduleIndex).name;
                _self.cleanEntitie(moduleName).then(success => {
                    _self.cleanEntities(modules).then(success => {
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

    cleanEntitie: function (moduleName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.debug('Starting process for module : ' + moduleName);
            let moduleObject = NODICS.getRawModule(moduleName);
            _self.cleanServices(moduleObject).then(() => {
                return _self.cleanFacades(moduleObject);
            }).then(() => {
                return _self.cleanControllers(moduleObject);
            }).then(() => {
                return _self.cleanDist(moduleObject);
            }).then(() => {
                resolve(true);
            }).catch((error) => {
                reject(error);
            });
        });
    },

    cleanServices: function (module) {
        return new Promise((resolve, reject) => {
            this.LOG.debug('Cleaning all SERVICE entities');
            try {
                UTILS.removeDir(path.join(module.path + '/src/service/gen'));
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    cleanFacades: function (module) {
        return new Promise((resolve, reject) => {
            this.LOG.debug('Cleaning all facade entities');
            try {
                UTILS.removeDir(path.join(module.path + '/src/facade/gen'));
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    cleanControllers: function (module) {
        return new Promise((resolve, reject) => {
            this.LOG.debug('Cleaning all controller entities');
            try {
                UTILS.removeDir(path.join(module.path + '/src/controller/gen'));
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    cleanDist: function (module) {
        return new Promise((resolve, reject) => {
            this.LOG.debug('Cleaning all dist entities');
            try {
                UTILS.removeDir(path.join(module.path + '/src/dist'));
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    cleanModules: function (modules = Array.from(NODICS.getIndexedModules().keys())) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (modules && modules.length > 0) {
                let moduleIndex = modules.shift();
                let moduleName = NODICS.getIndexedModules().get(moduleIndex).name;
                _self.cleanModule(moduleName).then(success => {
                    _self.cleanModules(modules).then(success => {
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

    cleanModule: function (moduleName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.debug('Starting process to finalize module : ' + moduleName);
            let moduleObject = NODICS.getRawModule(moduleName);
            let moduleFile = require(moduleObject.path + '/nodics.js');
            if (moduleFile.clean && typeof moduleFile.clean === 'function') {
                moduleFile.clean(moduleObject).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },


    buildEntities: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.buildServices().then(() => {
                return _self.buildFacades();
            }).then(() => {
                return _self.buildControllers();
            }).then(() => {
                resolve(true);
            }).catch((error) => {
                reject(error);
            });
        });
    },

    buildServices: function () {
        return new Promise((resolve, reject) => {
            let gVar = SERVICE.DefaultFilesLoaderService.getGlobalVariables('/src/service/common.js');
            let serviceCommon = SERVICE.DefaultFilesLoaderService.loadFiles('/src/service/common.js');
            let genDir = path.join(NODICS.getModule('nService').modulePath + '/src/service/gen');
            UTILS.schemaWalkThrough({
                commonDefinition: serviceCommon,
                type: 'service',
                currentDir: genDir,
                postFix: 'Service',
                gVar: gVar
            }).then(success => {
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },

    buildFacades: function () {
        return new Promise((resolve, reject) => {
            let gVar = SERVICE.DefaultFilesLoaderService.getGlobalVariables('/src/facade/common.js');
            let facadeCommon = SERVICE.DefaultFilesLoaderService.loadFiles('/src/facade/common.js');
            let genDir = path.join(NODICS.getModule('nFacade').modulePath + '/src/facade/gen');
            UTILS.schemaWalkThrough({
                commonDefinition: facadeCommon,
                type: 'service',
                currentDir: genDir,
                postFix: 'Facade',
                gVar: gVar
            }).then(success => {
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },

    buildControllers: function () {
        return new Promise((resolve, reject) => {
            let gVar = SERVICE.DefaultFilesLoaderService.getGlobalVariables('/src/controller/common.js');
            let controllerCommon = SERVICE.DefaultFilesLoaderService.loadFiles('/src/controller/common.js');
            let genDir = path.join(NODICS.getModule('nController').modulePath + '/src/controller/gen');
            UTILS.schemaWalkThrough({
                commonDefinition: controllerCommon,
                type: 'router',
                currentDir: genDir,
                postFix: 'Controller',
                gVar: gVar
            }).then(success => {
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },

    buildModules: function (modules = Array.from(NODICS.getIndexedModules().keys())) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (modules && modules.length > 0) {
                let moduleIndex = modules.shift();
                let moduleName = NODICS.getIndexedModules().get(moduleIndex).name;
                _self.buildModule(moduleName).then(success => {
                    _self.buildModules(modules).then(success => {
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

    buildModule: function (moduleName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.debug('Starting process to build module : ' + moduleName);
            let moduleObject = NODICS.getRawModule(moduleName);
            let moduleFile = require(moduleObject.path + '/nodics.js');
            if (moduleFile.build && typeof moduleFile.build === 'function') {
                moduleFile.build(moduleObject).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

};