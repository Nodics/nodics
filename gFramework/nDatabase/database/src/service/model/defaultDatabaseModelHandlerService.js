/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const util = require('util');

/**
 * @module database/service/model/DefaultDatabaseModelHandlerService
 * @description Builds and maintains tenant/channel scoped generated database
 * models from effective Nodics schemas. This service connects schema merging to
 * runtime model registries and delegates database-specific model creation to the
 * configured model handler.
 * @layer service
 * @owner nDatabase
 * @override Project modules may override this service to customize model
 * generation, channel handling, middleware registration, or database adapter
 * delegation while preserving module, tenant, schema, and channel isolation.
 *
 * @property {Object} NODICS.modules Active module registry containing `rawSchema` and generated `models`.
 * @property {Object} SERVICE.DefaultDatabaseConfigurationService Resolves tenant database handles.
 * @property {Object} SERVICE[modelHandler] Database-specific model adapter.
 * @property {Object} NODICS.rawModels Raw model middleware definitions loaded from module hierarchy.
 */
module.exports = {
    /**
     * Initializes the database model handler.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the database model handler.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Removes all generated models for one module and tenant.
     *
     * @param {string} moduleName Active module name.
     * @param {string} tntCode Tenant code.
     * @returns {Promise<boolean>} Resolves after model registry cleanup.
     * @sideEffects Deletes `moduleObject.models[tntCode]`.
     */
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
                reject(new CLASSES.NodicsError(error, 'While removing models for tenant' + tntCode, 'ERR_DBS_00000'));
            }
        });
    },

    /**
     * Removes one schema and its generated models from every active tenant.
     *
     * @param {string} moduleName Active module name.
     * @param {string} schemaName Schema code.
     * @returns {undefined}
     * @sideEffects Deletes raw schema and master/test generated model entries.
     */
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

    /**
     * Builds generated models for every active module for one tenant.
     *
     * @param {string} [tntCode=default] Tenant code.
     * @returns {Promise<boolean>} Resolves after all active module models are built.
     */
    buildModelsForTenant: function (tntCode = 'default') {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                _self.buildModelsForModules(tntCode, NODICS.getActiveModules()).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'while building models for tenant: ' + tntCode, 'ERR_DBS_00000'));
            }
        });
    },

    /**
     * Builds generated models for a supplied module list sequentially.
     *
     * @param {string} tntCode Tenant code.
     * @param {string[]} modules Mutable module list to process.
     * @returns {Promise<boolean>} Resolves after all modules are processed.
     * @sideEffects Consumes the `modules` array with `shift`.
     */
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

    /**
     * Builds generated models for one module and tenant.
     *
     * @param {string} tntCode Tenant code.
     * @param {string} moduleName Active module name.
     * @returns {Promise<boolean>} Resolves when module models are built or skipped.
     * @sideEffects Initializes `moduleObject.models[tntCode]`.
     */
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

    /**
     * Builds generated models for a module schema list.
     *
     * @param {Object} options Model build context.
     * @param {string[]} options.schemas Mutable schema code list to process.
     * @param {Object} options.moduleObject Active module object.
     * @param {Object} options.dataBase Tenant database handle map.
     * @returns {Promise<boolean>} Resolves after all schemas are processed.
     * @sideEffects Consumes `options.schemas` with `shift`.
     */
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

    /**
     * Builds one generated model for master and optional test channels.
     *
     * @param {Object} options Model build context.
     * @param {string} options.tntCode Tenant code.
     * @param {string} options.moduleName Active module name.
     * @param {Object} options.moduleObject Active module object with `rawSchema`.
     * @param {Object} options.dataBase Tenant database handle map.
     * @param {string} options.schemaName Schema code being built.
     * @returns {Promise<boolean>} Resolves when the model is registered or skipped.
     * @sideEffects Writes generated model entries into `moduleObject.models`.
     */
    buildModel: function (options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            options.modelName = UTILS.createModelName(options.schemaName);
            let schema = options.moduleObject.rawSchema[options.schemaName];
            if (options.dataBase.master) {
                if (schema.model === true && (!schema.tenants || schema.tenants.includes(options.tntCode))) {
                    let conOptions = options.dataBase.master.getOptions();
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

    /**
     * Applies raw model middleware definitions to a generated model.
     *
     * @param {Object} options Model build context.
     * @param {string} options.moduleName Active module name.
     * @param {string} options.schemaName Schema code.
     * @param {Object} schemaModel Generated database model wrapper.
     * @returns {undefined}
     * @sideEffects Merges default, module-default, and schema-specific raw model definitions.
     */
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

    /**
     * Delegates database validator refresh for one generated model.
     *
     * @param {Object} model Generated schema model wrapper.
     * @returns {Promise<Object>} Database-specific validator update response.
     */
    updateValidator: function (model) {
        return new Promise((resolve, reject) => {
            SERVICE[model.dataBase.getOptions().modelHandler].updateValidator(model).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Delegates database index creation for one generated model.
     *
     * @param {Object} model Generated schema model wrapper.
     * @param {boolean} cleanOrphan Whether the adapter should remove orphan indexes.
     * @returns {Promise<Object>} Database-specific index creation response.
     */
    createIndexes: function (model, cleanOrphan) {
        return new Promise((resolve, reject) => {
            SERVICE[model.dataBase.getOptions().modelHandler].createIndexes(model, cleanOrphan).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
            });
        });
    },
};
