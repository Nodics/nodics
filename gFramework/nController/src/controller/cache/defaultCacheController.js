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

    /**
     * This function is used to flush API cache for all keys
     * If Get request, will flush specific key or all start with frefix
     * If POST request has list of keys in request body, will flush cache for only those keys
     * @param {*} request 
     * @param {*} callback 
     */
    flushCache: function (request, callback) {
        if (request.httpRequest.params.channelName) {
            request.channelName = request.httpRequest.params.channelName;
        }
        if (request.httpRequest.params.key) {
            request.keys = [request.httpRequest.params.key];
        } else if (request.httpRequest.params.prefix) {
            request.prefix = request.httpRequest.params.prefix;
        } else if (!UTILS.isBlank(request.httpRequest.body) && UTILS.isArray(request.httpRequest.body)) {
            request.keys = request.httpRequest.body;
        }
        if (callback) {
            FACADE.DefaultCacheFacade.flushCache(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultCacheFacade.flushCache(request);
        }
    },


    /**
     * This function is used to change router level cache configuration
     * @param {*} request 
     * @param {*} callback 
     */
    updateRouterCacheConfiguration: function (request, callback) {
        request.config = request.httpRequest.body || {};
        if (callback) {
            FACADE.DefaultCacheFacade.updateRouterCacheConfiguration(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultCacheFacade.updateRouterCacheConfiguration(request);
        }
    },

    /**
     * This function is used to change model level cache configuration
     * @param {*} request 
     * @param {*} callback 
     */
    updateSchemaCacheConfiguration: function (request, callback) {
        request.config = request.httpRequest.body || {};
        if (callback) {
            FACADE.DefaultCacheFacade.updateSchemaCacheConfiguration(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultCacheFacade.updateSchemaCacheConfiguration(request);
        }
    }
};