/**
 * @module nCache/cache/service/config/DefaultCacheConfigurationService
 * @description Builds layered cache engine/channel configuration and deterministic tenant- and principal-scoped cache keys.
 * @layer service
 * @owner nCache/cache
 * @override Project modules may extend channel mappings and cache-key material while preserving deterministic tenant and principal isolation.
 */
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    channels: {},
    engines: {},

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

    /** Returns the effective cache channels for one active module. */
    getCacheChannels: function (moduleName) {
        return this.channels[moduleName];
    },

    /** Returns the effective cache engines for one active module. */
    getCacheEngines: function (moduleName) {
        return this.engines[moduleName];
    },

    /** Returns one effective cache engine or null when it is not configured. */
    getCacheEngine: function (moduleName, engineName) {
        let moduleEngines = this.engines[moduleName];
        if (moduleEngines) {
            return moduleEngines[engineName];
        } else {
            return null;
        }
    },

    /** Composes default and module-owned cache configuration for all active modules. */
    loadCacheConfiguration: function () {
        return new Promise((resolve, reject) => {
            try {
                let defaultChannels = CONFIG.get('cache').default.channels;
                let defaultEngines = CONFIG.get('cache').default.engines;
                let modules = Object.keys(NODICS.getModules());
                for (var count = 0; count < modules.length; count++) {
                    let moduleName = modules[count];
                    let moduleChannels = {};
                    let moduleEngines = {};
                    if (CONFIG.get('cache')[moduleName] && CONFIG.get('cache')[moduleName].channels) {
                        moduleChannels = CONFIG.get('cache')[moduleName].channels;
                    }
                    if (CONFIG.get('cache')[moduleName] && CONFIG.get('cache')[moduleName].engines) {
                        moduleEngines = CONFIG.get('cache')[moduleName].engines;
                    }
                    this.channels[moduleName] = _.merge(_.merge({}, defaultChannels), moduleChannels || {});
                    this.engines[moduleName] = _.merge(_.merge({}, defaultEngines), moduleEngines || {});
                }
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    /** Preserves the cache model-update lifecycle hook for layered extensions. */
    updateModels: function () {
        return new Promise((resolve, reject) => {
            try {
                let modules = Object.keys(NODICS.getModules());
                for (var count = 0; count < modules.length; count++) {
                    let moduleName = modules[count];
                    let moduleObject = NODICS.getModule(moduleName);
                }
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    /** Builds a deterministic API-cache key scoped by request, tenant, enterprise, and governed principal context. */
    createApiKey: function (request) {
        const httpRequest = request.httpRequest || request;
        const authData = request.authData || {};
        const method = String(httpRequest.method || request.method || 'GET').toUpperCase();
        const principal = {
            id: authData.serviceId || authData.loginId || authData.userId || authData.uid || authData.code || authData.email || null,
            isSystem: authData.isSystem === true,
            userGroups: [].concat(authData.userGroups || []).sort(),
            permissions: [].concat(authData.permissions || []).sort()
        };
        return this.stableStringify({
            method: method,
            url: httpRequest.originalUrl || request.originalUrl,
            body: ['POST', 'PUT', 'PATCH'].includes(method) ? httpRequest.body || null : null,
            tenant: request.tenant || authData.tenant || CONFIG.get('defaultTenant') || 'default',
            enterprise: request.entCode || authData.entCode || null,
            principal: principal
        });
    },

    /** Deterministically serializes cache-key material without credential values. */
    stableStringify: function (value) {
        if (Array.isArray(value)) return '[' + value.map(item => this.stableStringify(item)).join(',') + ']';
        if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + this.stableStringify(value[key])).join(',') + '}';
        return JSON.stringify(value);
    },

    /** Builds a tenant-scoped item-cache key from schema query and read options. */
    createItemKey: function (request) {
        let options = _.merge({}, request.options);
        let hashString = '';
        if (request.options) {
            options.recursive = request.options.recursive || false;
        }
        hashString = JSON.stringify(options) + JSON.stringify(request.searchOptions || {}) + JSON.stringify(request.query || {});
        return request.schemaModel.schemaName + '_' +
            request.tenant + '_' +
            UTILS.generateHash(hashString);
    },

    /** Builds a tenant-scoped search-cache key from index query and search options. */
    createSearchKey: function (request) {
        let hashString = JSON.stringify(request.options) + JSON.stringify(request.searchOptions || {}) + JSON.stringify(request.query || {});
        return request.searchModel.indexName + '_' +
            request.tenant + '_' +
            UTILS.generateHash(JSON.stringify(hashString));
    },
};
