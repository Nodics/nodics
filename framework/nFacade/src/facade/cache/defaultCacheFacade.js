/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    changeApiCacheConfiguration: function (request) {
        return SERVICE.DefaultCacheService.changeApiCacheConfiguration(request);
    },

    changeItemCacheConfiguration: function (request) {
        return SERVICE.DefaultCacheService.changeItemCacheConfiguration(request);
    },

    /**
     * Facade layer function to flush API level cache
     * @param {*} request 
     */
    flushApiCache: function (request) {
        return SERVICE.DefaultCacheService.flushApiCache(request);
    },

    /**
     * Facade layer function to flush Item level cache
     * @param {*} request 
     */
    flushItemCache: function (request) {
        return SERVICE.DefaultCacheService.flushItemCache(request);
    }
};