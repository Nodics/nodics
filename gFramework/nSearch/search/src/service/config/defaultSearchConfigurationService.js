/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

    searchEngines: {},
    searchSchema: {},
    rawSearchModel: {},
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
            resolve(true);
        });
    },

    getSearchActiveModules: function () {
        let modules = NODICS.getModules();
        let dbModules = [];
        _.each(modules, (value, moduleName) => {
            if (CONFIG.get('search')[moduleName]) {
                dbModules.push(moduleName);
            }
        });
        return dbModules;
    },

    getRawSearchModelDefinition: function (engine) {
        return this.rawSearchModel[engine];
    },

    addRawSearchModelDefinition: function (engine, definition) {
        this.rawSearchModel[engine] = definition;
    },

    /**
     * This function is used to get module specific search configuration, if not enabled, it will return undefined
     * @param {*} moduleName 
     * @param {*} tntCode 
     */
    getSearchConfiguration: function (moduleName, tenant) {
        if (!moduleName && !NODICS.isModuleActive(moduleName)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getActiveTenants().includes(tenant)) {
            throw new Error('Invalid tenant name: ' + tenant);
        } else {
            let defaultSearchConfig = CONFIG.get('search', tenant);
            let searchConfig = _.merge(_.merge({}, defaultSearchConfig.default), defaultSearchConfig[moduleName] || {});
            let connConfig = searchConfig[searchConfig.options.engine];
            if (connConfig) {
                connConfig.options = _.merge(_.merge({}, searchConfig.options), connConfig.options);
                return connConfig;
            } else {
                throw new Error('Configuration is not valid for module: ' + moduleName + ', tenant: ' + tntCode);
            }
        }
    },

    getSearchEngines: function () {
        return this.searchEngines;
    },

    addTenantSearchEngine: function (moduleName, tenant, searchEngine) {
        if (!moduleName && !NODICS.isModuleActive(moduleName)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getActiveTenants().includes(tenant)) {
            throw new Error('Invalid tenant name: ' + tenant);
        } else if (!this.searchEngines[moduleName]) {
            this.searchEngines[moduleName] = {};
        }
        this.searchEngines[moduleName][tenant] = searchEngine;
    },

    removeTenantSearchEngine: function (moduleName, tenant) {
        if (this.searchEngines[moduleName] && this.searchEngines[moduleName][tenant]) {
            delete this.searchEngines[moduleName][tenant];
        }
        return true;
    },

    getTenantSearchEngine: function (moduleName, tenant) {
        if (!moduleName && !NODICS.isModuleActive(moduleName)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getActiveTenants().includes(tenant)) {
            throw new Error('Invalid tenant name: ' + tenant);
        } else {
            let searchEngine = this.searchEngines[moduleName] || this.searchEngines.default;
            return searchEngine ? searchEngine[tenant] : null;
        }
    },

    addTenantRawSearchSchema: function (moduleName, tenant, definition) {
        if (!moduleName && !NODICS.isModuleActive(moduleName)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getActiveTenants().includes(tenant)) {
            throw new Error('Invalid tenant name: ' + tenant);
        } else {
            if (!this.searchSchema[moduleName]) {
                this.searchSchema[moduleName] = {};
            }
            if (!this.searchSchema[moduleName][tenant]) {
                this.searchSchema[moduleName][tenant] = {};
            }
            this.searchSchema[moduleName][tenant][definition.typeName] = definition;
        }
    },

    getAllRawSearchSchema: function (moduleName, tenant) {
        return this.searchSchema;
    },

    getRawSearchSchema: function (moduleName, tenant) {
        if (!moduleName && !NODICS.isModuleActive(moduleName)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getActiveTenants().includes(tenant)) {
            throw new Error('Invalid tenant name: ' + tenant);
        } else if (this.searchSchema[moduleName] && this.searchSchema[moduleName][tenant]) {
            return this.searchSchema[moduleName][tenant];
        } else {
            return {};
        }
    },

    getTenantRawSearchSchema: function (moduleName, tenant, typeName) {
        if (!moduleName && !NODICS.isModuleActive(moduleName)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getActiveTenants().includes(tenant)) {
            throw new Error('Invalid tenant name: ' + tenant);
        } else if (this.searchSchema[moduleName] && this.searchSchema[moduleName][tenant]) {
            return this.searchSchema[moduleName][tenant][typeName];
        } else {
            return null;
        }
    },

    removeTenantRawSearchSchema: function (moduleName, tenant) {
        if (this.searchSchema[moduleName] && this.searchSchema[moduleName][tenant]) {
            delete this.searchSchema[moduleName][tenant];
        }
        return true;
    },

    getSearchInterceptors: function (indexName) {
        if (this.interceptors && !UTILS.isBlank(this.interceptors)) {
            return this.interceptors[indexName];
        } else {
            return null;
        }
    },

    prepareSearchInterceptors: function () {
        return new Promise((resolve, reject) => {
            let items = [];
            _.each(NODICS.getModules(), (moduleObject, moduleName) => {
                _.each(moduleObject.searchModels, (tenantObject, tenantName) => {
                    _.each(tenantObject.master, (model, modelName) => {
                        items.push(model.schemaName);
                    });
                });
            });
            SERVICE.DefaultInterceptorConfigurationService.prepareInterceptors(
                items,
                ENUMS.InterceptorType.search.key
            ).then(searchInterceptors => {
                this.interceptors = searchInterceptors;
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },

    getSearchValidator: function (tenant, indexName) {
        if (this.validators && !UTILS.isBlank(this.validators[tenant]) && !UTILS.isBlank(this.validators[tenant][indexName])) {
            return this.validators[tenant][indexName];
        } else {
            return null;
        }
    },

    buildValidators: function (modules, validators, tenants = NODICS.getActiveTenants()) {
        if (!validators) validators = {};
        return new Promise((resolve, reject) => {
            if (tenants && tenants.length > 0) {
                let tenant = tenants.shift();
                SERVICE.DefaultValidatorConfigurationService.prepareValidators(
                    tenant,
                    modules[tenant],
                    ENUMS.ValidatorType.search.key
                ).then(searchValidators => {
                    validators[tenant] = searchValidators;
                    this.buildValidators(modules, validators, tenants).then(validators => {
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

    prepareSearchValidators: function () {
        return new Promise((resolve, reject) => {
            let items = {};
            _.each(NODICS.getModules(), (moduleObject, moduleName) => {
                _.each(moduleObject.searchModels, (tenantObject, tenantName) => {
                    if (!items[tenantName]) items[tenantName] = [];
                    _.each(tenantObject.master, (model, modelName) => {
                        items[tenantName].push(model.schemaName);
                    });
                });
            });
            this.buildValidators(items).then(searchValidators => {
                this.validators = searchValidators;
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    }
};