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
    schemaLevelCache: {},
    routerLevelCache: {},

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

    getSchemaCacheOptions: function (schemaName) {
        return this.schemaLevelCache[schemaName];
    },

    getRouterCacheOptions: function (schemaName, routerName) {
        let schemaOptions = this.routerLevelCache[schemaName];
        if (schemaOptions) {
            return schemaOptions[routerName];
        } else {
            return null;
        }
    },

    getCacheChannels: function (moduleName) {
        return this.channels[moduleName];
    },

    getCacheEngines: function (moduleName) {
        return this.engines[moduleName];
    },

    getCacheEngine: function (moduleName, engineName) {
        let moduleEngines = this.engines[moduleName];
        if (moduleEngines) {
            return moduleEngines[engineName];
        } else {
            return null;
        }
    },

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
                this.schemaLevelCache = CONFIG.get('cache').schemaLevelCache;
                this.routerLevelCache = CONFIG.get('cache').routerLevelCache;
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    createApiKey: function (request) {
        let key = request.originalUrl;
        let method = request.method;
        if (method === 'POST' || method === 'post') {
            if (request.body) {
                key += '-' + JSON.stringify(request.body);
            }
        }
        if (request.get('authToken')) {
            key += '-' + request.get('authToken');
        }
        if (request.get('enterpriseCode')) {
            key += '-' + request.get('enterpriseCode');
        }
        return method + '-' + key;
    },

    createItemKey: function (request) {
        let options = _.merge({}, request.options);
        if (request.options) {
            options.recursive = request.options.recursive || false;
        }
        options.query = request.query;
        return request.collection.schemaName + '_' +
            request.tenant + '_' +
            UTILS.generateHash(JSON.stringify(options));
    },
};