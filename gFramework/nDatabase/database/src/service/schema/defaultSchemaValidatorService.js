/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module database/service/schema/DefaultSchemaValidatorService
 * @description Refreshes database validators for generated schema models across
 * active tenants and channels. This keeps database-level validation aligned with
 * the effective schema produced by layered module configuration.
 * @layer service
 * @owner nDatabase
 * @override Project modules may override validator refresh behavior to support
 * custom database engines, channel policies, or tenant filtering while preserving
 * module and schema scoped operations.
 *
 * @property {Object} SERVICE.DefaultDatabaseModelHandlerService Updates validators on concrete models.
 * @property {Object} NODICS.models Tenant and channel scoped generated model registry.
 */
module.exports = {
    /**
     * Updates database validators for one schema across active tenants and supported channels.
     *
     * @param {string} moduleName Owning module name.
     * @param {string} schemaName Schema code.
     * @returns {Promise<Object[]>} Resolves with validator update responses.
     * @throws {CLASSES.NodicsError|Object[]} Rejects when no model is found or validator update fails.
     */
    updateSchemaValidator: function (moduleName, schemaName) {
        return new Promise((resolve, reject) => {
            try {
                let allPromise = [];
                NODICS.getActiveTenants().forEach(tntName => {
                    ['master', 'test'].forEach(channel => {
                        let models = NODICS.getModels(moduleName, tntName, channel);
                        if (models) {
                            let model = models[UTILS.createModelName(schemaName)];
                            if (model) {
                                allPromise.push(SERVICE.DefaultDatabaseModelHandlerService.updateValidator(model));
                            }
                        }
                    });
                });
                if (allPromise.length > 0) {
                    Promise.all(allPromise).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    reject(new CLASSES.NodicsError('ERR_DBS_00000', 'No schema found on name: ' + schemaName));
                }
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'Facing issue while updating model validators'));
            }
        });
    },

    /**
     * Updates database validators for every generated model in one module.
     *
     * @param {string} moduleName Owning module name.
     * @returns {Promise<Object[]>} Resolves with validator update responses.
     * @throws {CLASSES.NodicsError|Object[]} Rejects when no models are found or validator update fails.
     */
    updateModuleSchemaValidators: function (moduleName) {
        return new Promise((resolve, reject) => {
            try {
                let allPromise = [];
                NODICS.getActiveTenants().forEach(tntName => {
                    ['master', 'test'].forEach(channel => {
                        let models = NODICS.getModels(moduleName, tntName, channel);
                        if (models) {
                            _.each(models, (model, modelName) => {
                                if (model) {
                                    allPromise.push(SERVICE.DefaultDatabaseModelHandlerService.updateValidator(model));
                                }
                            });
                        }
                    });
                });
                if (allPromise.length > 0) {
                    Promise.all(allPromise).then(success => {
                        let response = [];
                        success.forEach(element => {
                            response.push(element);
                        });
                        resolve(response);
                    }).catch(error => {
                        let response = [];
                        error.forEach(element => {
                            response.push(element);
                        });
                        reject(response);
                    });
                } else {
                    reject(new CLASSES.NodicsError('ERR_DBS_00000', 'No schema found on name: ' + moduleName));
                }
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'Facing issue while updating model validators'));
            }
        });
    },

    /**
     * Updates database validators for every generated model in every active module.
     *
     * @returns {Promise<Object[]>} Resolves with validator update responses.
     * @throws {CLASSES.NodicsError|Object[]} Rejects when no models are found or validator update fails.
     */
    updateModulesSchemaValidators: function () {
        return new Promise((resolve, reject) => {
            try {
                let allPromise = [];
                _.each(NODICS.getModules(), (moduleObject, moduleName) => {
                    NODICS.getActiveTenants().forEach(tntName => {
                        ['master', 'test'].forEach(channel => {
                            let models = NODICS.getModels(moduleName, tntName, channel);
                            if (models) {
                                _.each(models, (model, modelName) => {
                                    if (model) {
                                        allPromise.push(SERVICE.DefaultDatabaseModelHandlerService.updateValidator(model));
                                    }
                                });
                            }
                        });
                    });
                });
                if (allPromise.length > 0) {
                    Promise.all(allPromise).then(success => {
                        let response = [];
                        success.forEach(element => {
                            response.push(element);
                        });
                        resolve(response);
                    }).catch(error => {
                        let response = [];
                        error.forEach(element => {
                            response.push(element);
                        });
                        reject(response);
                    });
                } else {
                    reject(new CLASSES.NodicsError('ERR_DBS_00000', 'Please your request, invalid arguments'));
                }
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'Facing issue while updating model Indexes'));
            }
        });
    }
};
