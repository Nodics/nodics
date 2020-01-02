/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

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

    removeModelsForTenant: function (moduleName, tntCode) {
        return new Promise((resolve, reject) => {
            try {
                let moduleObject = NODICS.getModule(moduleName);
                if (moduleObject.models && moduleObject.models[tntCode]) {
                    this.LOG.debug('Deleting all models for tenant: ' + tntCode + ' from module: ' + moduleName);
                    delete moduleObject.models[tntCode];
                }
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    removeModelFromModule: function (moduleName, schemaName) {
        let moduleObject = NODICS.getModule(moduleName);
        let modelName = UTILS.createModelName(schemaName);
        NODICS.getActiveTenants().forEach(tntCode => {
            if (moduleObject.rawSchema[schemaName]) {
                delete moduleObject.rawSchema[schemaName];
            }
            if (moduleObject.models[tntCode] &&
                moduleObject.models[tntCode].master &&
                moduleObject.models[tntCode].master[modelName]) {
                delete moduleObject.models[tntCode].master[modelName];
            }
            if (moduleObject.models[tntCode] &&
                moduleObject.models[tntCode].test &&
                moduleObject.models[tntCode].test[modelName]) {
                delete moduleObject.models[tntCode].test[modelName];
            }
        });
    },

    buildModelsForTenant: function (tntCode = 'default') {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.buildModelsForModules(tntCode, NODICS.getActiveModules()).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
            });
        });
    },

    buildModelsForModules: function (tntCode, modules) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (modules.length > 0) {
                let moduleName = modules.shift();
                _self.buildModelsForModule(tntCode, moduleName).then(success => {
                    _self.buildModelsForModules(tntCode, modules).then(success => {
                        resolve(success);
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

    buildModelsForModule: function (tntCode, moduleName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let moduleObject = NODICS.getModule(moduleName);
            if (moduleObject && moduleObject.rawSchema) {
                if (!moduleObject.models) {
                    moduleObject.models = {};
                }
                if (!moduleObject.models[tntCode]) {
                    moduleObject.models[tntCode] = {};
                }
                _self.buildModels({
                    tntCode: tntCode,
                    moduleName: moduleName,
                    moduleObject: moduleObject,
                    dataBase: SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase(moduleName, tntCode),
                    schemas: Object.keys(moduleObject.rawSchema),
                }).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    buildModels: function (options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            options.schemaName = options.schemas.shift();
            _self.buildModel(options).then(success => {
                if (options.schemas.length > 0) {
                    _self.buildModels(options).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(success);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    buildModel: function (options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            options.modelName = UTILS.createModelName(options.schemaName);
            let schema = options.moduleObject.rawSchema[options.schemaName];
            if (options.dataBase.master) {
                if (schema.model === true && (!schema.tenants || schema.tenants.includes(options.tntCode))) {
                    conOptions = options.dataBase.master.getOptions();
                    SERVICE[conOptions.modelHandler].prepareDatabaseOptions(options).then(success => {
                        options.cache = _.merge({}, schema.cache || {});
                        options.channel = 'master';
                        SERVICE[conOptions.modelHandler].retrieveModel(options, options.dataBase.master).then(schemaModel => {
                            _self.registerModelMiddleWare(options, schemaModel);
                            if (!options.moduleObject.models[options.tntCode].master) {
                                options.moduleObject.models[options.tntCode].master = {};
                            }
                            options.moduleObject.models[options.tntCode].master[options.modelName] = schemaModel;
                            if (options.dataBase.test) {
                                options.channel = 'test';
                                SERVICE[conOptions.modelHandler].retrieveModel(options, options.dataBase.test).then(schemaModel => {
                                    _self.registerModelMiddleWare(options, schemaModel);
                                    if (!options.moduleObject.models[options.tntCode].test) {
                                        options.moduleObject.models[options.tntCode].test = {};
                                    }
                                    options.moduleObject.models[options.tntCode].test[options.modelName] = schemaModel;
                                    resolve(true);
                                }).catch(error => {
                                    reject(error);
                                });
                            } else {
                                resolve(true);
                            }
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    //_self.LOG.warn('Either model is disabled for schema: ' + options.schemaName + ', or not allowed for this tenant: ' + options.tntCode);
                    resolve(true);
                }
            } else {
                _self.LOG.warn('Invalid database configuration for module: ' + options.moduleName + ' and tenant: ' + options.tntCode + '. Hence defailt will be used');
                resolve(true);
            }
        });
    },

    registerModelMiddleWare: function (options, schemaModel) {
        let rawModels = NODICS.getRawModels();
        _.merge(schemaModel, rawModels.default);
        if (!UTILS.isBlank(rawModels[options.moduleName])) {
            _.merge(schemaModel, rawModels[options.moduleName].default);
            if (!UTILS.isBlank(rawModels[options.moduleName])) {
                _.merge(schemaModel, rawModels[options.moduleName][options.schemaName]);
            }
        }
    },

    updateValidator: function (model) {
        return new Promise((resolve, reject) => {
            if (model) {
                SERVICE[model.dataBase.getOptions().modelHandler].updateValidator(model).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } else {
                let response = {};
                response[model.schemaName + '_' + model.tenant + '_' + model.channel] = 'Invalid schema value to update validator';
                reject(response);
            }
        });
    },

    createIndexes: function (model, cleanOrphan) {
        return new Promise((resolve, reject) => {
            try {
                if (model) {
                    SERVICE[model.dataBase.getOptions().modelHandler].createIndexes(model, cleanOrphan).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    let response = {};
                    response[model.schemaName + '_' + model.tenant + '_' + model.channel] = 'Invalid schema value to update indexes';
                    reject(response);
                }
            } catch (error) {
                reject(error);
            }
        });
    },
};