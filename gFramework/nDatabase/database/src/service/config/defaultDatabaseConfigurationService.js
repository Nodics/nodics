/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    dbs: {},
    interceptors: {},

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
            this.LOG.debug('Collecting database middlewares');
            NODICS.setRawModels(SERVICE.DefaultFilesLoaderService.loadFiles('/src/schemas/model.js'));
            resolve(true);
        });
    },

    // getDatabases: function () {
    //     return this.dbs;
    // },

    getDatabaseActiveModules: function () {
        let modules = NODICS.getModules();
        let dbModules = [];
        _.each(modules, (value, moduleName) => {
            if (CONFIG.get('database')[moduleName]) {
                dbModules.push(moduleName);
            }
        });
        return dbModules;
    },

    getDatabaseConfiguration: function (moduleName, tenant) {
        if (!moduleName && !NODICS.isModuleActive(moduleName)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getTenants().includes(tenant)) {
            throw new Error('Invalid tenant name: ' + tenant);
        } else {
            let defaultConfig = CONFIG.get('database', tenant);
            let dbConfig = _.merge(_.merge({}, defaultConfig.default), defaultConfig[moduleName] || {});
            let connConfig = dbConfig[dbConfig.options.databaseType];
            if (connConfig) {
                connConfig.options = _.merge(_.merge({}, dbConfig.options), connConfig.options);
                return connConfig;
            } else {
                throw new Error('Configuration is not valid for module: ' + moduleName + ', tenant: ' + tntCode);
            }
        }
    },

    addTenantDatabase: function (moduleName, tenant, database) {
        if (!moduleName && !NODICS.isModuleActive(moduleName)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getTenants().includes(tenant)) {
            throw new Error('Invalid tenant name: ' + tenant);
        } else {
            if (!this.dbs[moduleName]) {
                this.dbs[moduleName] = {};
            }
            this.dbs[moduleName][tenant] = database;
        }
    },

    getTenantDatabase: function (moduleName, tenant) {
        if (!moduleName && !NODICS.isModuleActive(moduleName)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getTenants().includes(tenant)) {
            throw new Error('Invalid tenant name: ' + tenant);
        } else {
            let database = {};
            if (moduleName && this.dbs[moduleName]) {
                database = this.dbs[moduleName];
            } else {
                database = this.dbs.default;
            }
            return database[tenant];
        }
    },

    removeTenantDatabase: function (moduleName, tenant) {
        if (!moduleName && !NODICS.isModuleActive(moduleName)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getTenants().includes(tenant)) {
            throw new Error('Invalid tenant name: ' + tenant);
        } else if (this.dbs[moduleName] && this.dbs[moduleName][tenant]) {
            delete this.dbs[moduleName][tenant];
        }
        return true;
    },

    setInterceptors: function (interceptors) {
        try {
            let defaultInterceptors = _.merge({}, interceptors.default);
            _.each(NODICS.getModules(), (moduleObject, moduleName) => {
                if (!this.interceptors[moduleName]) {
                    this.interceptors[moduleName] = {};
                }
                let moduleInterceptors = _.merge({}, interceptors[moduleName]);
                let moduleDefault = _.merge(_.merge({}, defaultInterceptors), moduleInterceptors.default || {});
                _.each(moduleObject.models, (tenantObject, tenantName) => {
                    _.each(tenantObject.master, (model, modelName) => {
                        let modelInterceptors = _.merge({}, moduleInterceptors[model.schemaName]);
                        if (!this.interceptors[moduleName][modelName]) {
                            this.interceptors[moduleName][modelName] = {};
                        }
                        let interceptorPool = this.interceptors[moduleName][modelName];
                        _.each(moduleDefault, (interceptor, interceptorName) => {
                            if (!interceptorPool[interceptor.type]) {
                                interceptorPool[interceptor.type] = [];
                            }
                            interceptorPool[interceptor.type].push(interceptor);
                        });
                        _.each(modelInterceptors, (interceptor, interceptorName) => {
                            if (!interceptorPool[interceptor.type]) {
                                interceptorPool[interceptor.type] = [];
                            }
                            interceptorPool[interceptor.type].push(interceptor);
                        });
                    });
                });
            });
            _.each(this.interceptors, (moduleInterceptors, moduleName) => {
                _.each(moduleInterceptors, (modelInterceptors, modelName) => {
                    _.each(modelInterceptors, (typeInterceptors, typeName) => {
                        let indexedInterceptors = UTILS.sortObject(typeInterceptors, 'index');
                        let list = [];
                        if (indexedInterceptors) {
                            _.each(indexedInterceptors, (intList, index) => {
                                list = list.concat(intList);
                            });
                            modelInterceptors[typeName] = list;
                        }
                    });
                });
            });
        } catch (error) {
            this.LOG.error(error);
        }

    },

    getInterceptors: function (moduleName, modelName) {
        if (!this.interceptors[moduleName]) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!this.interceptors[moduleName][modelName]) {
            throw new Error('Invalid model name: ' + modelName);
        } else {
            return this.interceptors[moduleName][modelName];
        }
    }
};