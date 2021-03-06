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
     * This function is used to update indexes for given Schema name. I will update for all active tenants schema
     * @param {*} modelName
     * @param {*} schemaName 
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
     * This functions is used to update schema indexes for given module
     * @param {*} moduleName 
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
     * This functions is used to update schema indexes for all module
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