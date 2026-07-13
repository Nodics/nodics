/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const path = require('path');

/**
 * @module config/service/DefaultInfraService
 * @description Clean/build infrastructure service for generated Nodics artifacts. It
 * removes generated services/facades/controllers/tests/dist folders and regenerates
 * schema-driven runtime files and generated tests from effective definitions.
 * @layer service
 * @owner nConfig
 * @override Project modules may provide module-level `clean` and `build` hooks from
 * their `nodics.js` files. Replacing this service should preserve generated artifact
 * cleanup and regeneration semantics.
 *
 * @property {Object} SERVICE.DefaultFilesLoaderService Loads layered common generator definitions.
 * @property {Object} SERVICE.DefaultSchemaTestGeneratorService Optional generated test builder/cleaner.
 * @property {Object} UTILS Provides directory removal and schema generation helpers.
 */
module.exports = {
    /**
     * Initializes the infrastructure service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the infrastructure service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Cleans generated artifacts for all indexed active modules.
     *
     * @param {string[]} [modules] Module index values to clean.
     * @returns {Promise<boolean>} Resolves after generated entity cleanup completes.
     */
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

    /**
     * Cleans generated artifacts for one module.
     *
     * @param {string} moduleName Active module name.
     * @returns {Promise<boolean>} Resolves after service, facade, controller, generated test, and dist cleanup.
     */
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
                return _self.cleanGeneratedTests(moduleObject);
            }).then(() => {
                return _self.cleanDist(moduleObject);
            }).then(() => {
                return _self.cleanGeneratedOpenApi(moduleObject);
            }).then(() => {
                resolve(true);
            }).catch((error) => {
                reject(error);
            });
        });
    },

    /**
     * Removes generated service files for a module.
     *
     * @param {Object} module Raw module metadata.
     * @returns {Promise<boolean>} Resolves after `src/service/gen` removal.
     */
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

    /**
     * Removes generated facade files for a module.
     *
     * @param {Object} module Raw module metadata.
     * @returns {Promise<boolean>} Resolves after `src/facade/gen` removal.
     */
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

    /**
     * Removes generated controller files for a module.
     *
     * @param {Object} module Raw module metadata.
     * @returns {Promise<boolean>} Resolves after `src/controller/gen` removal.
     */
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

    /**
     * Removes generated tests for a module.
     *
     * @param {Object} module Raw module metadata.
     * @returns {Promise<boolean>} Resolves after generated test cleanup.
     */
    cleanGeneratedTests: function (module) {
        return new Promise((resolve, reject) => {
            this.LOG.debug('Cleaning generated test entities');
            try {
                if (SERVICE.DefaultSchemaTestGeneratorService &&
                    typeof SERVICE.DefaultSchemaTestGeneratorService.cleanGeneratedTests === 'function') {
                    SERVICE.DefaultSchemaTestGeneratorService.cleanGeneratedTests(module).then(() => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    UTILS.removeDir(path.join(module.path + '/test/gen'));
                    resolve(true);
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Removes generated distribution files for a module.
     *
     * @param {Object} module Raw module metadata.
     * @returns {Promise<boolean>} Resolves after `src/dist` removal.
     */
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

    /**
     * Removes generated OpenAPI contracts owned by a module.
     *
     * @param {Object} module Raw module metadata.
     * @returns {Promise<boolean>} Resolves after `generated/openapi` removal.
     */
    cleanGeneratedOpenApi: function (module) {
        return new Promise((resolve, reject) => {
            this.LOG.debug('Cleaning generated OpenAPI contracts');
            try {
                UTILS.removeDir(path.join(module.path, 'generated', 'openapi'));
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Executes module-level clean hooks for all indexed active modules.
     *
     * @param {string[]} [modules] Module index values to clean.
     * @returns {Promise<boolean>} Resolves after all module clean hooks complete.
     */
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

    /**
     * Executes one module's `nodics.js` clean hook when present.
     *
     * @param {string} moduleName Active module name.
     * @returns {Promise<boolean>} Resolves after module clean completes or when no hook exists.
     */
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


    /**
     * Builds generated services, facades, controllers, and generated tests.
     *
     * @returns {Promise<boolean>} Resolves after generated entity build completes.
     */
    buildEntities: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.buildServices().then(() => {
                return _self.buildFacades();
            }).then(() => {
                return _self.buildControllers();
            }).then(() => {
                return _self.buildGeneratedTests();
            }).then(() => {
                resolve(true);
            }).catch((error) => {
                reject(error);
            });
        });
    },

    /**
     * Builds generated tests from effective schema definitions when nTest is available.
     *
     * @returns {Promise<boolean>} Resolves after generated tests are built or skipped.
     */
    buildGeneratedTests: function () {
        return new Promise((resolve, reject) => {
            if (SERVICE.DefaultSchemaTestGeneratorService &&
                typeof SERVICE.DefaultSchemaTestGeneratorService.buildGeneratedTests === 'function') {
                SERVICE.DefaultSchemaTestGeneratorService.buildGeneratedTests().then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    /**
     * Builds schema-driven generated services.
     *
     * @returns {Promise<boolean>} Resolves after generated services are written.
     */
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

    /**
     * Builds schema-driven generated facades.
     *
     * @returns {Promise<boolean>} Resolves after generated facades are written.
     */
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

    /**
     * Builds schema-driven generated controllers.
     *
     * @returns {Promise<boolean>} Resolves after generated controllers are written.
     */
    buildControllers: function () {
        return new Promise((resolve, reject) => {
            let gVar = SERVICE.DefaultFilesLoaderService.getGlobalVariables('/src/controller/common.js');
            let controllerCommon = SERVICE.DefaultFilesLoaderService.loadFiles('/src/controller/common.js');
            let genDir = path.join(NODICS.getModule('nController').modulePath + '/src/controller/gen');
            UTILS.schemaWalkThrough({
                commonDefinition: controllerCommon,
                type: 'service',
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

    /**
     * Executes module-level build hooks for all indexed active modules.
     *
     * @param {string[]} [modules] Module index values to build.
     * @returns {Promise<boolean>} Resolves after all module build hooks complete.
     */
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

    /**
     * Executes one module's `nodics.js` build hook when present.
     *
     * @param {string} moduleName Active module name.
     * @returns {Promise<boolean>} Resolves after module build completes or when no hook exists.
     */
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
