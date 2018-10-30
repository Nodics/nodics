/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    changeApiCacheConfiguration: function (request, callback) {
        request.config = request.httpRequest.body || {};
        if (callback) {
            FACADE.DefaultCacheFacade.changeApiCacheConfiguration(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultCacheFacade.changeApiCacheConfiguration(request);
        }
    },

    changeItemCacheConfiguration: function (request, callback) {
        request.config = request.httpRequest.body || {};
        if (callback) {
            FACADE.DefaultCacheFacade.changeItemCacheConfiguration(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultCacheFacade.changeItemCacheConfiguration(request);
        }
    },

    /**
     * This function is used to flush API cache for all keys
     * If Get request, will flush specific key or all start with frefix
     * If POST request has list of keys in request body, will flush cache for only those keys
     * @param {*} request 
     * @param {*} callback 
     */
    flushApiCache: function (request, callback) {
        if (request.httpRequest.params.key) {
            request.keys = [request.httpRequest.params.key];
        } else if (request.httpRequest.params.prefix) {
            request.prefix = request.httpRequest.params.prefix;
        } else if (!UTILS.isBlank(request.httpRequest.body) && UTILS.isArray(request.httpRequest.body)) {
            request.keys = request.httpRequest.body;
        }
        if (callback) {
            FACADE.DefaultCacheFacade.flushApiCache(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultCacheFacade.flushApiCache(request);
        }
    },

    /**
     * This function is used to flush Item cache for all keys
     * If Get request, will flush specific key or all start with frefix
     * If POST request has list of keys in request body, will flush cache for only those keys
     * @param {*} request 
     * @param {*} callback 
     */
    flushItemCache: function (request, callback) {
        if (request.httpRequest.params.key) {
            request.keys = [request.httpRequest.params.key];
        } else if (request.httpRequest.params.prefix) {
            request.prefix = [request.httpRequest.params.prefix];
        } else if (!UTILS.isBlank(request.httpRequest.body) && UTILS.isArray(request.httpRequest.body)) {
            request.keys = request.body;
        }
        if (callback) {
            FACADE.DefaultCacheFacade.flushItemCache(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultCacheFacade.flushItemCache(request);
        }
    }
};