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

module.exports = {
    /**
    * This function is used to initiate module loading process. If there is any functionalities, required to be executed on module loading. 
    * defined it that with Promise way
    * @param {*} options 
    */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize module loading process. If there is any functionalities, required to be executed after module loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    initUtilities: function (options) {
        return initService.initUtilities(options);
    },

    loadModules: function (options) {
        return initService.loadModules(options);
    },

    initEntities: function (options) {
        return initService.initEntities(options);
    },

    finalizeEntities: function (options) {
        return initService.finalizeEntities(options);
    },

    finalizeModules: function (options) {
        return initService.finalizeModules(options);
    },

    prepareStart: function (options) {
        return new Promise((resolve, reject) => {
            try {
                let startTime = new Date();
                global.NODICS = new Nodics();
                global.CONFIG = new Config();
                NODICS.init(options);
                NODICS.setStartTime(startTime);
                utils.collectModulesList(NODICS.getNodicsHome());
                NODICS.initEnvironment();
                fse.ensureDir(NODICS.getServerPath() + '/temp/logs').then(success => {
                    initService.prepareOptions();
                    initService.loadModuleIndex();
                    initService.printInfo();
                    initService.LOG.info('Starting Utils loader process');
                    initService.LOG.info('Loading modules meta data');
                    initService.loadModulesMetaData();
                    initService.LOG.info('Loading modules common configurations');
                    initService.loadConfigurations();
                    initService.loadExternalProperties();
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

    prepareClean: function (options) {
        return new Promise((resolve, reject) => {
            this.prepareStart(options).then(success => {
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },

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

    prepareBuild: function (options) {
        return new Promise((resolve, reject) => {
            this.prepareStart(options).then(success => {
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },

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