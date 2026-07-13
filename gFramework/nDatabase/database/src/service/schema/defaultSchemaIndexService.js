/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module database/service/schema/DefaultSchemaIndexService
 * @description Rebuilds database indexes for generated schema models across
 * active tenants and channels. This service supports admin-triggered schema
 * index maintenance after schema changes or deployment-time generation.
 * @layer service
 * @owner nDatabase
 * @override Project modules may override index refresh behavior to support
 * alternate channel lists, tenant filtering, or database-specific scheduling
 * while preserving module and schema scoped operations.
 *
 * @property {Object} SERVICE.DefaultDatabaseModelHandlerService Creates indexes on concrete models.
 * @property {Object} NODICS.models Tenant and channel scoped generated model registry.
 */
module.exports = {
    /**
     * Updates indexes for one schema across all active tenants and supported channels.
     *
     * @param {string} moduleName Owning module name.
     * @param {string} schemaName Schema code.
     * @returns {Promise<Object[]>} Resolves with database index creation responses.
     * @throws {CLASSES.NodicsError|Object[]} Rejects when no model is found or index creation fails.
     */
    updateSchemaIndexes: function (moduleName, schemaName) {
        return new Promise((resolve, reject) => {
            try {
                let allPromise = [];
                NODICS.getActiveTenants().forEach(tntName => {
                    ['master', 'test'].forEach(channel => {
                        let models = NODICS.getModels(moduleName, tntName, channel);
                        if (models) {
                            let model = models[UTILS.createModelName(schemaName)];
                            if (model) {
                                allPromise.push(SERVICE.DefaultDatabaseModelHandlerService.createIndexes(model));
                            }
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
                        if (error instanceof Array && error.length > 0) {
                            error.forEach(element => {
                                response.push(element);
                            });
                        } else {
                            response.push(error);
                        }
                        reject(response);
                    });
                } else {
                    reject(new CLASSES.NodicsError('ERR_DBS_00000', 'No schema found on name: ' + schemaName));
                }
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'Facing issue while updating model Indexes'));
            }
        });
    },

    /**
     * Updates indexes for every generated model in one module.
     *
     * @param {string} moduleName Owning module name.
     * @returns {Promise<Object[]>} Resolves with database index creation responses.
     * @throws {CLASSES.NodicsError|Object[]} Rejects when no models are found or index creation fails.
     */
    updateModuleIndexes: function (moduleName) {
        return new Promise((resolve, reject) => {
            try {
                let allPromise = [];
                NODICS.getActiveTenants().forEach(tntName => {
                    ['master', 'test'].forEach(channel => {
                        let models = NODICS.getModels(moduleName, tntName, channel);
                        if (models) {
                            _.each(models, (model, modelName) => {
                                if (model) {
                                    allPromise.push(SERVICE.DefaultDatabaseModelHandlerService.createIndexes(model));
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
                reject(new CLASSES.NodicsError(error, 'Facing issue while updating model Indexes'));
            }
        });
    },

    /**
     * Updates indexes for every generated model in every active module.
     *
     * @returns {Promise<Object[]>} Resolves with database index creation responses.
     * @throws {CLASSES.NodicsError|Object[]} Rejects when no models are found or index creation fails.
     */
    updateModulesIndexes: function () {
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
                                        allPromise.push(SERVICE.DefaultDatabaseModelHandlerService.createIndexes(model));
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
                    reject(new CLASSES.NodicsError('ERR_DBS_00003', 'Please your request, invalid arguments'));
                }
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'Facing issue while updating model Indexes'));
            }
        });
    }
};
