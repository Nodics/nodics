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
            FACADE.CacheFacade.changeApiCacheConfiguration(request, callback);
        } else {
            callback('Please verify your request, this not a valid one');
        }
    },

    changeItemCacheConfiguration: function (request, callback) {
        if (!UTILS.isBlank(request.body)) {
            request.local.config = request.body;
            FACADE.CacheFacade.changeItemCacheConfiguration(request, callback);
        } else {
            callback('Please verify your request, this not a valid one');
        }
    },

    flushApiCache: function (request, callback) {
        if (request.params.prefix) {
            request.local.prefix = request.params.prefix;
        } else if (request.body) {
            request.local.keys = request.body;
        }
        FACADE.CacheFacade.flushApiCache(request, callback);
    },

    flushItemCache: function (request, callback) {
        if (request.params.prefix) {
            request.local.prefix = request.params.prefix;
        } else if (request.body) {
            request.local.keys = request.body;
        }
        FACADE.CacheFacade.flushItemCache(request, callback);
    },

    flushApiCacheKeys: function (request, callback) {
        if (request.body) {
            request.local.keys = request.body;
        }
        FACADE.CacheFacade.flushApiCacheKeys(request, callback);
    },

    flushItemCacheKeys: function (request, callback) {
        if (request.body) {
            request.local.keys = request.body;
        }
        FACADE.CacheFacade.flushItemCacheKeys(request, callback);
    }
};