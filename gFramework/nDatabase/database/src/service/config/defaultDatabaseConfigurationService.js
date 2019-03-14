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
        this.interceptors = interceptors;

    },

    getInterceptors: function (moduleName, schmeaName) {
        if (!this.interceptors[moduleName]) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!this.interceptors[moduleName][schmeaName]) {
            throw new Error('Invalid model name: ' + schmeaName);
        } else {
            return this.interceptors[moduleName][schmeaName];
        }
    },

    toObjectId: function (schemaModel, value) {
        let modelHandlerName = schemaModel.dataBase.getOptions().modelHandler;
        if (!UTILS.isObjectId(value) && SERVICE[modelHandlerName] && SERVICE[modelHandlerName].toObjectId) {
            return SERVICE[modelHandlerName].toObjectId(value);
        } else {
            return value;
        }
    }

};