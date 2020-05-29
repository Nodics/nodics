/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    rawSchema: {},
    dbs: {},
    interceptors: {},
    validators: {},

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

    getRawSchema: function () {
        return this.rawSchema;
    },

    setRawSchema: function (rawSchema) {
        this.rawSchema = rawSchema;
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
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getActiveTenants().includes(tenant)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Invalid tenant name: ' + tenant);
        } else {
            let defaultConfig = CONFIG.get('database', tenant);
            let dbConfig = _.merge(_.merge({}, defaultConfig.default), defaultConfig[moduleName] || {});
            let connConfig = dbConfig[dbConfig.options.databaseType];
            if (connConfig) {
                connConfig.options = _.merge(_.merge({}, dbConfig.options), connConfig.options);
                return connConfig;
            } else {
                throw new CLASSES.NodicsError('ERR_DBS_00003', 'Configuration is not valid for module: ' + moduleName + ', tenant: ' + tntCode);
            }
        }
    },

    addTenantDatabase: function (moduleName, tenant, database) {
        if (!moduleName && !NODICS.isModuleActive(moduleName)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getActiveTenants().includes(tenant)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Invalid tenant name: ' + tenant);
        } else {
            if (!this.dbs[moduleName]) {
                this.dbs[moduleName] = {};
            }
            this.dbs[moduleName][tenant] = database;
        }
    },

    getTenantDatabase: function (moduleName, tenant) {
        if (!moduleName && !NODICS.isModuleActive(moduleName)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getActiveTenants().includes(tenant)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Invalid tenant name: ' + tenant);
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
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getActiveTenants().includes(tenant)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Invalid tenant name: ' + tenant);
        } else if (this.dbs[moduleName] && this.dbs[moduleName][tenant]) {
            delete this.dbs[moduleName][tenant];
        }
        return true;
    },

    toObjectId: function (schemaModel, value) {
        let modelHandlerName = schemaModel.dataBase.getOptions().modelHandler;
        if (UTILS.isObject(value)) {
            return value;
        } else if (!UTILS.isObjectId(value) && SERVICE[modelHandlerName] && SERVICE[modelHandlerName].toObjectId) {
            return SERVICE[modelHandlerName].toObjectId(value);
        } else {
            return value;
        }
    },

    setSchemaInterceptors: function (interceptors) {
        this.interceptors = interceptors;
    },

    getSchemaInterceptors: function (schemaName) {
        if (!this.interceptors[schemaName]) {
            this.interceptors[schemaName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(schemaName, ENUMS.InterceptorType.schema.key);
        }
        return this.interceptors[schemaName];
    },

    refreshSchemaInterceptors: function (schemaNames) {
        if (this.interceptors && !UTILS.isBlank(this.interceptors) && schemaNames && schemaNames.length > 0) {
            schemaNames.forEach(schemaName => {
                if (!schemaName || schemaName === 'default') {
                    let tmpInterceptors = {};
                    Object.keys(this.interceptors).forEach(schemaName => {
                        tmpInterceptors[schemaName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(schemaName, ENUMS.InterceptorType.schema.key);
                    });
                    this.interceptors = tmpInterceptors;
                } else if (this.interceptors[schemaName]) {
                    this.interceptors[schemaName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(schemaName, ENUMS.InterceptorType.schema.key);
                }
            });
        }
    },

    handleSchemaInterceptorUpdated: function (request, callback) {
        try {
            this.refreshSchemaInterceptors(request.event.data);
            callback(null, { code: 'SUC_EVNT_00000' });
        } catch (error) {
            callback(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
        }
    },

    setSchemaValidators: function (validators) {
        this.validators = validators;
    },

    getSchemaValidators: function (tenant, schemaName) {
        if (!this.validators[tenant] || !this.validators[tenant][schemaName]) {
            if (!this.validators[tenant]) this.validators[tenant] = {};
            this.validators[tenant][schemaName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, schemaName, ENUMS.InterceptorType.schema.key);
        }
        return this.validators[tenant][schemaName];
    },

    refreshSchemaValidators: function (tenant, schemaNames) {
        if (this.validators[tenant] && !UTILS.isBlank(this.validators[tenant]) && schemaNames && schemaNames.length > 0) {
            schemaNames.forEach(schemaName => {
                if (!schemaName || schemaName === 'default') {
                    let tenantValidators = {};
                    Object.keys(this.validators[tenant]).forEach(schemaName => {
                        tenantValidators[schemaName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, schemaName, ENUMS.InterceptorType.schema.key);
                    });
                    this.validators[tenant] = tenantValidators;
                } else if (this.validators[tenant][schemaName]) {
                    this.validators[tenant][schemaName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, schemaName, ENUMS.InterceptorType.schema.key);
                }
            });
        }
    },

    handleSchemaValidatorUpdated: function (request, callback) {
        try {
            this.refreshSchemaValidators(request.tenant, request.event.data);
            callback(null, { code: 'SUC_EVNT_00000' });
        } catch (error) {
            callback(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
        }
    },
};