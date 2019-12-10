/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    importInterceptors: {},
    exportInterceptors: {},

    importValidators: {},
    exportValidatos: {},

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
            //this.LOG.debug('Collecting database middlewares');
            //NODICS.setRawModels(SERVICE.DefaultFilesLoaderService.loadFiles('/src/schemas/model.js'));
            resolve(true);
        });
    },

    setImportInterceptors: function (interceptors) {
        this.importInterceptors = interceptors;
    },

    getImportInterceptors: function (entityName) {
        if (this.importInterceptors[entityName]) {
            return this.importInterceptors[entityName];
        } else {
            return null;
        }
    },

    getImportValidatorss: function (tenant, entityName) {
        if (this.importValidators[tenant] && this.importValidators[tenant][entityName]) {
            return this.importValidators[entityName];
        } else {
            return null;
        }
    },

    setExportInterceptors: function (interceptors) {
        this.exportInterceptors = interceptors;

    },

    getExportInterceptors: function (entityName) {
        if (this.exportInterceptors[entityName]) {
            return this.exportInterceptors[entityName];
        } else {
            return null;
        }
    },

    prepareImportInterceptors: function () {
        return new Promise((resolve, reject) => {
            let items = [];
            _.each(NODICS.getModules(), (moduleObject, moduleName) => {
                _.each(moduleObject.models, (tenantObject, tenantName) => {
                    _.each(tenantObject.master, (model, modelName) => {
                        items.push(model.schemaName);
                    });
                });
            });
            SERVICE.DefaultInterceptorConfigurationService.prepareInterceptors(
                items,
                ENUMS.InterceptorType.import.key
            ).then(importInterceptors => {
                this.importInterceptors = importInterceptors;
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },

    prepareExportInterceptors: function () {
        return new Promise((resolve, reject) => {
            let items = [];
            _.each(NODICS.getModules(), (moduleObject, moduleName) => {
                _.each(moduleObject.models, (tenantObject, tenantName) => {
                    _.each(tenantObject.master, (model, modelName) => {
                        items.push(model.schemaName);
                    });
                });
            });
            SERVICE.DefaultInterceptorConfigurationService.prepareInterceptors(
                items,
                ENUMS.InterceptorType.export.key
            ).then(exportInterceptors => {
                this.exportInterceptors = exportInterceptors;
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },

    buildImportValidators: function (modules, validators, tenants = NODICS.getActiveTenants()) {
        if (!validators) validators = {};
        return new Promise((resolve, reject) => {
            if (tenants && tenants.length > 0) {
                let tenant = tenants.shift();
                SERVICE.DefaultValidatorConfigurationService.prepareValidators(
                    tenant,
                    modules[tenant],
                    ENUMS.ValidatorType.import.key
                ).then(schemaValidators => {
                    validators[tenant] = schemaValidators;
                    this.buildImportValidators(modules, validators, tenants).then(validators => {
                        resolve(validators);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(validators);
            }
        });
    },

    prepareImportValidators: function () {
        return new Promise((resolve, reject) => {
            let items = {};
            _.each(NODICS.getModules(), (moduleObject, moduleName) => {
                _.each(moduleObject.models, (tenantObject, tenantName) => {
                    if (!items[tenantName]) items[tenantName] = [];
                    _.each(tenantObject.master, (model, modelName) => {
                        items[tenantName].push(model.schemaName);
                    });
                });
            });
            this.buildImportValidators(items).then(importValidators => {
                this.importValidators = importValidators;
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },

    buildExportValidators: function (modules, validators, tenants = NODICS.getActiveTenants()) {
        if (!validators) validators = {};
        return new Promise((resolve, reject) => {
            if (tenants && tenants.length > 0) {
                let tenant = tenants.shift();
                SERVICE.DefaultValidatorConfigurationService.prepareValidators(
                    tenant,
                    modules[tenant],
                    ENUMS.ValidatorType.export.key
                ).then(schemaValidators => {
                    validators[tenant] = schemaValidators;
                    this.buildExportValidators(modules, validators, tenants).then(validators => {
                        resolve(validators);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(validators);
            }
        });
    },

    prepareExportValidators: function () {
        return new Promise((resolve, reject) => {
            let items = {};
            _.each(NODICS.getModules(), (moduleObject, moduleName) => {
                _.each(moduleObject.models, (tenantObject, tenantName) => {
                    if (!items[tenantName]) items[tenantName] = [];
                    _.each(tenantObject.master, (model, modelName) => {
                        items[tenantName].push(model.schemaName);
                    });
                });
            });
            this.buildExportValidators(items).then(importValidators => {
                this.importValidators = importValidators;
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    }
};