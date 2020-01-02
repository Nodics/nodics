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

    schemaUpdateEventHandler: function (request) {
        let _self = this;
        let body = request.result;
        return new Promise((resolve, reject) => {
            try {
                if (!body.code) {
                    reject('Schema Name can not be null or empty');
                } else {
                    this.get({
                        tenant: 'default',
                        query: {
                            code: body.code
                        }
                    }).then(success => {
                        if (success.result && success.result.length > 0) {
                            let updatedSchema = success.result[0];
                            if (!updatedSchema.active) {
                                let rawSchema = SERVICE.DefaultDatabaseConfigurationService.getRawSchema();
                                if (rawSchema[updatedSchema.moduleName] && rawSchema[updatedSchema.moduleName][updatedSchema.code]) {
                                    delete rawSchema[updatedSchema.moduleName][updatedSchema.code];
                                }
                                SERVICE.DefaultDatabaseModelHandlerService.removeModelFromModule(updatedSchema.moduleName, updatedSchema.code);
                                resolve('Model successfully de-activated');
                            } else {
                                this.buildRuntimeSchema(updatedSchema).then(success => {
                                    resolve('Model successfully activated');
                                }).catch(error => {
                                    console.log(error);
                                    reject(error);
                                });
                            }
                        } else {
                            _self.LOG.error('Could not found any data for schema name ' + body.code);
                            reject('Could not found any data for schema name ' + body.code);
                        }
                    }).catch(error => {
                        reject(error);
                    });
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    buildRuntimeSchema: function (runtimeSchema) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultDatabaseSchemaHandlerService.buildRuntimeSchema(runtimeSchema).then(() => {
                return new Promise((resolve, reject) => {
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
                                resolve('Model generated successfully');
                            }).catch(error => {
                                reject(error);
                            });
                        } else {
                            resolve('Model generated successfully');
                        }
                    } else {
                        resolve('Model generated successfully');
                    }
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    remove: function (request) {
        return new Promise((resolve, reject) => {
            reject('This operation is not supported currently');
        });
    },
    removeById: function (ids, tenant) {
        return new Promise((resolve, reject) => {
            reject('This operation is not supported currently');
        });
    },
    removeByCode: function (codes, tenant) {
        return new Promise((resolve, reject) => {
            reject('This operation is not supported currently');
        });
    },
    update: function (request) {
        return new Promise((resolve, reject) => {
            reject('This operation is not supported currently');
        });
    },
};