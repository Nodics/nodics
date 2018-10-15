/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    changeApiCacheConfiguration: function (request, callback) {
        if (!UTILS.isBlank(request.body)) {
            request.local.config = request.body;
            FACADE.DefaultCacheFacade.changeApiCacheConfiguration(request, callback);
        } else {
            callback('Please verify your request, this not a valid one');
        }
    },

    changeItemCacheConfiguration: function (request, callback) {
        if (!UTILS.isBlank(request.body)) {
            request.local.config = request.body;
            FACADE.DefaultCacheFacade.changeItemCacheConfiguration(request, callback);
        } else {
            callback('Please verify your request, this not a valid one');
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
        if (request.params.key) {
            request.local.keys = [request.params.key];
        } else if (request.params.prefix) {
            request.local.prefix = request.params.prefix;
        } else if (!UTILS.isBlank(request.body) && UTILS.isArray(request.body)) {
            request.local.keys = request.body;
        }
        FACADE.DefaultCacheFacade.flushApiCache(request, callback);
    },

    /**
     * This function is used to flush Item cache for all keys
     * If Get request, will flush specific key or all start with frefix
     * If POST request has list of keys in request body, will flush cache for only those keys
     * @param {*} request 
     * @param {*} callback 
     */
    flushItemCache: function (request, callback) {
        if (request.params.key) {
            request.local.keys = [request.params.key];
        } else if (request.params.prefix) {
            request.local.prefix = [request.params.prefix];
        } else if (!UTILS.isBlank(request.body) && UTILS.isArray(request.body)) {
            request.local.keys = request.body;
        }
        FACADE.DefaultCacheFacade.flushItemCache(request, callback);
    }
};