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
    indexesList: [],

    /**
     * This function is used to setup your service just after service is loaded.
     */
    init: function () {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to setup your service just before routers are getting activated.
     */
    postInit: function () {
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
        let defaultSearchConfig = CONFIG.get('search', tenant);
        let searchConfig = _.merge(_.merge({}, defaultSearchConfig.default), defaultSearchConfig[moduleName] || {});
        let connConfig = searchConfig[searchConfig.options.engine];
        if (connConfig) {
            connConfig.options = _.merge(_.merge({}, searchConfig.options), connConfig.options);
            return connConfig;
        } else {
            throw new Error('Configuration is not valid for module: ' + moduleName + ', tenant: ' + tntCode);
        }
    },

    getIndexesList: function () {
        return this.indexesList;
    },

    addTenantSearchEngine: function (moduleName, tenant, searchEngine) {
        if (!NODICS.isModuleActive(moduleName)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!NODICS.getTenants().includes(tenant)) {
            throw new Error('Invalid tenant name: ' + tenant);
        } else if (!this.searchEngines[moduleName]) {
            this.searchEngines[moduleName] = {};
        }
        this.searchEngines[moduleName][tenant] = searchEngine;
    },

    removeTenantSearchEngine: function (moduleName, tenant) {
        if (!NODICS.isModuleActive(moduleName)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!NODICS.getTenants().includes(tenant)) {
            throw new Error('Invalid tenant name: ' + tenant);
        }
        if (this.searchEngines[moduleName] && this.searchEngines[moduleName][tenant]) {
            delete this.searchEngines[moduleName][tenant];
        }
        return true;
    },

    getTenantSearchEngine: function (moduleName, tenant) {
        if (!NODICS.isModuleActive(moduleName)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!NODICS.getTenants().includes(tenant)) {
            throw new Error('Invalid tenant name: ' + tenant);
        } else {
            let searchEngine = this.searchEngines[moduleName] || this.searchEngines.default;
            return searchEngine ? searchEngine[tenant] : null;
        }
    },

    addTenantRawSearchSchema: function (moduleName, tenant, definition) {
        if (!NODICS.isModuleActive(moduleName)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!NODICS.getTenants().includes(tenant)) {
            throw new Error('Invalid tenant name: ' + tenant);
        } else {
            if (!this.searchSchema[moduleName]) {
                this.searchSchema[moduleName] = {};
            }
            if (!this.searchSchema[moduleName][tenant]) {
                this.searchSchema[moduleName][tenant] = {};
            }
            if (!this.indexesList.includes(definition.indexName)) {
                this.indexesList.push(definition.indexName);
            }
            this.searchSchema[moduleName][tenant][definition.typeName] = definition;
        }
    },

    getRawSearchSchema: function (moduleName, tenant) {
        if (!NODICS.isModuleActive(moduleName)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!NODICS.getTenants().includes(tenant)) {
            throw new Error('Invalid tenant name: ' + tenant);
        } else if (this.searchSchema[moduleName] && this.searchSchema[moduleName][tenant]) {
            return this.searchSchema[moduleName][tenant];
        } else {
            return {};
        }
    },

    getTenantRawSearchSchema: function (moduleName, tenant, typeName) {
        if (!NODICS.isModuleActive(moduleName)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!NODICS.getTenants().includes(tenant)) {
            throw new Error('Invalid tenant name: ' + tenant);
        } else {
            if (this.searchSchema[moduleName] && this.searchSchema[moduleName][tenant]) {
                return this.searchSchema[moduleName][tenant][typeName];
            } else {
                return null;
            }
        }
    },

    removeTenantRawSearchSchema: function (moduleName, tenant) {
        if (!NODICS.isModuleActive(moduleName) || !this.searchSchema[moduleName]) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!NODICS.getTenants().includes(tenant) || !this.searchSchema[moduleName][tenant]) {
            throw new Error('Invalid tenant name: ' + tenant);
        } else {
            delete this.searchSchema[moduleName][tenant];
        }
        return true;
    }
};