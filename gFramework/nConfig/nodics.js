/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');
const fse = require('fs-extra');
const Nodics = require('./bin/nodics');
const Config = require('./bin/config');
const utils = require('./src/utils/utils');
const initService = require('./src/service/DefaultFrameworkInitializerService');
const logger = require('./src/service/DefaultLoggerService');
const scriptHandler = require('./src/service/DefaultScriptsHandlerService');
const enumService = require('./src/service/defaultEnumService');
const moduleService = require('./src/service/defaultModuleInitializerService');
const fileLoader = require('./src/service/defaultFilesLoaderService');
const classesLoader = require('./src/service/defaultClassesHandlerService');
const infra = require('./src/service/defaultInfraService');

/**
 * @module config/nodics
 * @description nConfig module lifecycle bridge used by the root Nodics launcher. It prepares process-wide registries, resolves the active environment/server/node hierarchy, loads layered configuration and pre/post scripts, and delegates runtime, clean, and build phases to overrideable nConfig services.
 * @layer module
 * @owner nConfig
 * @override Project modules should customize startup through metadata, configuration, scripts, and later-loaded services. Replacing this bridge requires preserving global registry initialization, hierarchy validation, lifecycle ordering, and generated artifact contracts.
 * @property {Object} NODICS Process-wide runtime registry created during `prepareStart`.
 * @property {Object} CONFIG Tenant-aware configuration registry created during `prepareStart`.
 * @property {Object} UTILS Layered utility registry populated from active modules.
 */
module.exports = {
    /**
     * Provides the standard nConfig module initialization hook.
     *
     * @param {Object} options Nodics lifecycle options.
     * @returns {Promise<boolean>} Resolves when the hook completes.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Provides the standard nConfig post-initialization hook.
     *
     * @param {Object} options Nodics lifecycle options.
     * @returns {Promise<boolean>} Resolves when the hook completes.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Delegates layered utility loading to the framework initializer service.
     *
     * @param {Object} options Nodics lifecycle options.
     * @returns {Promise|*} Initializer-service result.
     */
    initUtilities: function (options) {
        return initService.initUtilities(options);
    },

    /**
     * Delegates active-module loading and module lifecycle initialization.
     *
     * @param {Object} options Nodics lifecycle options.
     * @returns {Promise|*} Initializer-service result.
     */
    loadModules: function (options) {
        return initService.loadModules(options);
    },

    /**
     * Delegates service, pipeline, facade, controller, and class initialization.
     *
     * @param {Object} options Nodics lifecycle options.
     * @returns {Promise|*} Initializer-service result.
     */
    initEntities: function (options) {
        return initService.initEntities(options);
    },

    /**
     * Delegates entity post-initialization in active-module order.
     *
     * @param {Object} options Nodics lifecycle options.
     * @returns {Promise|*} Initializer-service result.
     */
    finalizeEntities: function (options) {
        return initService.finalizeEntities(options);
    },

    /**
     * Delegates final module post-initialization hooks.
     *
     * @param {Object} options Nodics lifecycle options.
     * @returns {Promise|*} Initializer-service result.
     */
    finalizeModules: function (options) {
        return initService.finalizeModules(options);
    },

    /**
     * Prepares the shared startup state used by start, clean, and build operations.
     *
     * @param {Object} options Launcher options including optional home and default server values.
     * @returns {Promise<boolean>} Resolves after hierarchy discovery, configuration validation, logger setup, utility loading, and pre-scripts complete.
     * @sideEffects Creates global registries, ensures the server log directory, loads active modules and configuration, and installs layered utilities.
     * @throws Rejects when topology, configuration, file loading, or a pre-script fails.
     */
    prepareStart: function (options) {
        return new Promise((resolve, reject) => {
            try {
                let startTime = new Date();
                global.NODICS = new Nodics();
                global.CONFIG = new Config();
                NODICS.init(options);
                NODICS.setStartTime(startTime);
                utils.loadRawModuleList(NODICS.getNodicsHome());
                NODICS.initEnvironment(options);
                fse.ensureDir(NODICS.getServerPath() + '/temp/logs').then(success => {
                    initService.prepareOptions();
                    initService.printConfigurationLoadOrder();
                    initService.loadModuleIndex();
                    initService.printInfo();
                    initService.LOG.info('Starting Utils loader process');
                    initService.LOG.info('Loading modules meta data');
                    initService.loadModulesMetaData();
                    initService.LOG.info('Loading modules common configurations');
                    initService.loadConfigurations();
                    initService.loadExternalProperties();
                    initService.validateResolvedConfiguration();
                    NODICS.LOG = logger.createLogger('NODICS');
                    CONFIG.LOG = logger.createLogger('CONFIG');
                    scriptHandler.LOG = logger.createLogger('DefaultScriptHandlerService');
                    enumService.LOG = logger.createLogger('DefaultEnumService');
                    moduleService.LOG = logger.createLogger('DefaultModuleInitializerService');
                    fileLoader.LOG = logger.createLogger('DefaultFilesLoaderService');
                    classesLoader.LOG = logger.createLogger('DefaultClassesHandlerService');
                    infra.LOG = logger.createLogger('DefaultInfraService');
                    fileLoader.loadFiles('/src/utils/utils.js', global.UTILS);
                    UTILS.LOG = logger.createLogger('UTILS');
                    scriptHandler.loadPreScript();
                    scriptHandler.executePreScripts().then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Prepares runtime startup and loads layered post-scripts.
     *
     * @param {Object} options Launcher options.
     * @returns {Promise<boolean>} Resolves when startup preparation and post-script discovery complete.
     * @sideEffects Populates the runtime post-script registry; execution occurs in the later lifecycle phase.
     */
    start: function (options) {
        return new Promise((resolve, reject) => {
            this.prepareStart(options).then(success => {
                initService.LOG.info('Starting Post Scripts loader process');
                scriptHandler.loadPostScript();
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Reuses standard startup preparation before cleaning generated artifacts.
     *
     * @param {Object} options Launcher options.
     * @returns {Promise<boolean>} Resolves when clean prerequisites are initialized.
     */
    prepareClean: function (options) {
        return new Promise((resolve, reject) => {
            this.prepareStart(options).then(success => {
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Removes generated entity and module artifacts through the infrastructure service.
     *
     * @returns {Promise<boolean>} Resolves when entity and module cleanup completes.
     * @sideEffects Deletes generated source, test, distribution, and module build outputs owned by the clean contract.
     */
    cleanModules: function () {
        return new Promise((resolve, reject) => {
            infra.cleanEntities().then(success => {
                infra.cleanModules().then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Reuses standard startup preparation before generating build artifacts.
     *
     * @param {Object} options Launcher options.
     * @returns {Promise<boolean>} Resolves when build prerequisites are initialized.
     */
    prepareBuild: function (options) {
        return new Promise((resolve, reject) => {
            this.prepareStart(options).then(success => {
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Generates schema-driven entity and module artifacts through the infrastructure service.
     *
     * @returns {Promise<boolean>} Resolves when entity and module generation completes.
     * @sideEffects Recreates services, facades, controllers, tests, and other generated module outputs from effective definitions.
     */
    buildModules: function () {
        return new Promise((resolve, reject) => {
            infra.buildEntities().then(success => {
                infra.buildModules().then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },
};
