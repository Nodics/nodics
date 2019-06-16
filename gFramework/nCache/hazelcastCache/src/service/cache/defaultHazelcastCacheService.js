/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

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

    put: function (options) {
        return new Promise((resolve, reject) => {
            try {
                let key = channel.channelName + '_' + channel.engineOptions.options.prefix + '_' + options.key;
                // this will allow user to keep value for infinite time
                let ttl = 0;
                if (!options.ttl || options.ttl > 0) {
                    ttl = options.ttl || channel.chennalOptions.ttl || channel.engineOptions.ttl || channel.engineOptions.options.ttl;
                }
                this.LOG.debug('Putting value is local cache storage with key: ' + key + ' TTL: ' + ttl);
                options.client.set(key, options.value, ttl || 0);
                resolve({
                    success: true,
                    code: 'SUC_CACHE_00000',
                    result: value
                });
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_CACHE_00000',
                    error: error
                });
            }

        });
    },

    get: function (options) {
        return new Promise((resolve, reject) => {
            try {
                let key = channel.channelName + '_' + channel.engineOptions.options.prefix + '_' + options.key;
                this.LOG.debug('Getting value from local cache storage with key: ' + key);
                options.client.get(key, (error, value) => {
                    if (error) {
                        reject({
                            success: false,
                            code: 'ERR_CACHE_00000',
                            error: error
                        });
                    } else if (value) {
                        resolve({
                            success: true,
                            code: 'SUC_CACHE_00000',
                            result: value
                        });
                    } else {
                        reject({
                            success: false,
                            code: 'ERR_CACHE_00001'
                        });
                    }
                });
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_CACHE_00000',
                    error: error
                });
            }

        });
    }
};