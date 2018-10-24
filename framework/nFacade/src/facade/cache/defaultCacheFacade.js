/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    changeApiCacheConfiguration: function (request, callback) {
        callback('not implemented yet, comming soon');
    },

    changeItemCacheConfiguration: function (request, callback) {
        return SERVICE.DefaultCacheService.changeItemCacheConfiguration(request, callback)
    },

    /**
     * Facade layer function to flush API level cache
     * @param {*} request 
     * @param {*} callback 
     */
    flushApiCache: function (request, callback) {
        return SERVICE.DefaultCacheService.flushApiCache(request, callback);
    },

    /**
     * Facade layer function to flush Item level cache
     * @param {*} request 
     * @param {*} callback 
     */
    flushItemCache: function (request, callback) {
        return SERVICE.DefaultCacheService.flushItemCache(request, callback);
    }
};