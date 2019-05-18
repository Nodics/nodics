/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
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

    addToken: function (moduleName, isExpirable, hash, value) {
        return new Promise((resolve, reject) => {
            try {
                let options = {
                    moduleName: moduleName,
                    channelName: 'auth',
                    key: hash,
                    value: value
                };
                if (!isExpirable) {
                    options.ttl = 0;
                }
                SERVICE.DefaultCacheService.put(options).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
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
                SERVICE.DefaultCacheService.get({
                    moduleName: moduleName,
                    channelName: 'auth',
                    key: token
                }).then(value => {
                    resolve(value);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }
};