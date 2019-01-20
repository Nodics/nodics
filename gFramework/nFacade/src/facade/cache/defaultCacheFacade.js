/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    /**
     * This function is used to setup your service just after service is loaded.
     */
    init: function () {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to setup your service just before routers are getting activated.
     */
    postInit: function () {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    updateApiCacheConfiguration: function (request) {
        return SERVICE.DefaultCacheService.updateApiCacheConfiguration(request);
    },

    updateItemCacheConfiguration: function (request) {
        return SERVICE.DefaultCacheService.updateItemCacheConfiguration(request);
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