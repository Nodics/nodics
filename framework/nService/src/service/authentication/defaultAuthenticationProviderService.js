/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    addToken: function (moduleName, source, hash, value) {
        return new Promise((resolve, reject) => {
            try {
                let moduleObject = NODICS.getModule(moduleName);
                if (moduleObject.authCache) {
                    let input = {
                        cache: moduleObject.authCache,
                        hashKey: hash,
                        value: value,
                        options: {
                            ttl: CONFIG.get('cache').authTokenTTL
                        }
                    };
                    if (source) {
                        input.options.ttl = 0;
                    }
                    SERVICE.DefaultCacheService.put(input);
                    resolve(true);
                } else {
                    reject({
                        success: false,
                        code: 'ERR_CACHE_00002'
                    });
                }
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_AUTH_00000',
                    error: error
                });
            }
        });
    },

    findToken: function (moduleName, token) {
        return new Promise((resolve, reject) => {
            try {
                let moduleObject = NODICS.getModule(moduleName);
                if (moduleObject.authCache) {
                    SERVICE.DefaultCacheService.get({
                        cache: moduleObject.authCache,
                        hashKey: token
                    }).then(value => {
                        resolve(value);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    reject({
                        success: false,
                        code: 'ERR_CACHE_00001'
                    });
                }
            } catch (error) {
                reject(error);
            }
        });
    }
};