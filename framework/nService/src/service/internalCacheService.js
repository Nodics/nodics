/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    options: {
        isNew: true
    },

    invalidateAPICache: function(request, callback) {
        try {
            let moduleObject = NODICS.getModules()[request.moduleName];
            if (moduleObject.apiCache) {
                moduleObject.apiCache.flushAll();
                callback(null, 'api cache for module : ' + request.moduleName + ', flushed successfully');
            }
        } catch (error) {
            callback(error);
        }
    },

    generateCacheKey: function(request) {
        let key = request.originalUrl;
        const method = request.method;
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
        let hash = method + '-' + SYSTEM.generateHash(key);
        return hash;
    },

    get: function(nodeCache, request, response) {
        return new Promise((resolve, reject) => {
            let hash = this.generateCacheKey(request);
            nodeCache.get(hash, (error, success) => {
                if (error) {
                    reject(error);
                } else if (success) {
                    resolve(success);
                } else {
                    reject('key not found');
                }
            });
        });
    },

    put: function(router, request, value) {
        return new Promise((resolve, reject) => {
            try {
                let nodeCache = router.moduleObject.apiCache;
                let hash = this.generateCacheKey(request);
                if (router.ttl) {
                    nodeCache.set(hash, value, router.ttl);
                } else {
                    nodeCache.set(hash, value);
                }
                resolve(true);
            } catch (error) {
                reject('Not able to save in cache');
            }
        });
    }
};