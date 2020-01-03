/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const fs = require('fs');
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

    validateSchema: function (request, response, process) {
        this.LOG.debug('Validating request for schema : ' + request.runtimeSchema.code);
        process.nextSuccess(request, response);
    },

    buildRawSchema: function (request, response, process) {
        this.LOG.debug('Validating request for schema : ' + request.runtimeSchema.code);
        SERVICE.DefaultDatabaseSchemaHandlerService.buildRuntimeSchema(request.runtimeSchema).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    buildModels: function (request, response, process) {
        this.LOG.debug('Validating request for schema : ' + request.runtimeSchema.code);
        let runtimeSchema = request.runtimeSchema;
        if (runtimeSchema.moduleName !== 'default') {
            let allModels = [];
            NODICS.getActiveTenants().forEach(tntCode => {
                allModels.push(SERVICE.DefaultDatabaseModelHandlerService.buildModel({
                    tntCode: tntCode,
                    moduleName: runtimeSchema.moduleName,
                    schemaName: runtimeSchema.code,
                    moduleObject: NODICS.getModule(runtimeSchema.moduleName),
                    dataBase: SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase(runtimeSchema.moduleName, tntCode),
                    schemas: Object.keys(NODICS.getModule(runtimeSchema.moduleName).rawSchema),
                }));
            });
            if (allModels.length > 0) {
                Promise.all(allModels).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
            } else {
                process.nextSuccess(request, response);
            }
        } else {
            process.nextSuccess(request, response);
        }
    },

    buildServices: function (request, response, process) {
        this.LOG.debug('Validating request for schema : ' + request.runtimeSchema.code);
        let runtimeSchema = request.runtimeSchema;
        let postFix = 'Service';
        let serviceName = 'Default' + runtimeSchema.code.toUpperCaseFirstChar() + postFix;
        let genDir = path.join(NODICS.getModule('nService').modulePath + '/src/service/gen');
        let fileName = genDir + '/' + serviceName + '.js';
        let schemaObject = NODICS.getModule(runtimeSchema.moduleName).rawSchema[runtimeSchema.code];
        if (runtimeSchema.moduleName !== 'default' && schemaObject) {
            if (fs.existsSync(fileName)) {
                SERVICE[serviceName] = require(fileName);
                process.nextSuccess(request, response);
            } else {
                UTILS.createObject({
                    commonDefinition: SERVICE.DefaultFilesLoaderService.loadFiles('/src/service/common.js'),
                    type: 'service',
                    currentDir: genDir,
                    postFix: postFix,
                    gVar: SERVICE.DefaultFilesLoaderService.getGlobalVariables('/src/service/common.js'),
                    moduleName: runtimeSchema.moduleName,
                    moduleObject: NODICS.getModule(runtimeSchema.moduleName),
                    schemaName: runtimeSchema.code,
                    schemaObject: schemaObject
                }).then(success => {
                    SERVICE[serviceName] = require(fileName);
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
            }
        } else {
            process.nextSuccess(request, response);
        }
    },

    buildFacades: function (request, response, process) {
        this.LOG.debug('Validating request for schema : ' + request.runtimeSchema.code);
        let runtimeSchema = request.runtimeSchema;
        let postFix = 'Facade';
        let facadeName = 'Default' + runtimeSchema.code.toUpperCaseFirstChar() + postFix;
        let genDir = path.join(NODICS.getModule('nFacade').modulePath + '/src/facade/gen');
        let fileName = genDir + '/' + facadeName + '.js';
        let schemaObject = NODICS.getModule(runtimeSchema.moduleName).rawSchema[runtimeSchema.code];
        if (runtimeSchema.moduleName !== 'default' && schemaObject) {
            if (fs.existsSync(fileName)) {
                FACADE[facadeName] = require(fileName);
                process.nextSuccess(request, response);
            } else {
                UTILS.createObject({
                    commonDefinition: SERVICE.DefaultFilesLoaderService.loadFiles('/src/facade/common.js'),
                    type: 'facade',
                    currentDir: genDir,
                    postFix: postFix,
                    gVar: SERVICE.DefaultFilesLoaderService.getGlobalVariables('/src/facade/common.js'),
                    moduleName: runtimeSchema.moduleName,
                    moduleObject: NODICS.getModule(runtimeSchema.moduleName),
                    schemaName: runtimeSchema.code,
                    schemaObject: schemaObject
                }).then(success => {
                    FACADE[facadeName] = require(fileName);
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
            }
        } else {
            process.nextSuccess(request, response);
        }
    },

    buildController: function (request, response, process) {
        this.LOG.debug('Validating request for schema : ' + request.runtimeSchema.code);
        let runtimeSchema = request.runtimeSchema;
        let postFix = 'Controller';
        let controllerName = 'Default' + runtimeSchema.code.toUpperCaseFirstChar() + postFix;
        let genDir = path.join(NODICS.getModule('nController').modulePath + '/src/controller/gen');
        let fileName = genDir + '/' + controllerName + '.js';
        let schemaObject = NODICS.getModule(runtimeSchema.moduleName).rawSchema[runtimeSchema.code];
        if (runtimeSchema.moduleName !== 'default' && schemaObject) {
            if (fs.existsSync(fileName)) {
                CONTROLLER[controllerName] = require(fileName);
                process.nextSuccess(request, response);
            } else {
                UTILS.createObject({
                    commonDefinition: SERVICE.DefaultFilesLoaderService.loadFiles('/src/controller/common.js'),
                    type: 'controller',
                    currentDir: genDir,
                    postFix: postFix,
                    gVar: SERVICE.DefaultFilesLoaderService.getGlobalVariables('/src/controller/common.js'),
                    moduleName: runtimeSchema.moduleName,
                    moduleObject: NODICS.getModule(runtimeSchema.moduleName),
                    schemaName: runtimeSchema.code,
                    schemaObject: schemaObject
                }).then(success => {
                    CONTROLLER[controllerName] = require(fileName);
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
            }
        } else {
            process.nextSuccess(request, response);
        }
    },

    activateRouters: function (request, response, process) {
        this.LOG.debug('Validating request for schema : ' + request.runtimeSchema.code);
        let runtimeSchema = request.runtimeSchema;
        try {
            let moduleObject = NODICS.getModule(runtimeSchema.moduleName);
            let schemaObject = moduleObject.rawSchema[runtimeSchema.code];
            if (schemaObject.service && schemaObject.router && UTILS.isRouterEnabled(runtimeSchema.moduleName)) {
                SERVICE.DefaultRouterService.prepareDefaultRouter({
                    routers: SERVICE.DefaultRouterConfigurationService.getRawRouters(),
                    urlPrefix: moduleObject.metaData.prefix || runtimeSchema.moduleName,
                    schemaName: runtimeSchema.code,
                    moduleName: runtimeSchema.moduleName,
                    moduleRouter: moduleObject.moduleRouter || NODICS.getModule('default').moduleRouter
                });
            }
            process.nextSuccess(request, response);
        } catch (error) {
            process.error(request, response, error);
        }

    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        process.reject(response.error);
    }
};