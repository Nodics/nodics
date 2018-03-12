/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    flushApiCache: function(requestContext, callback) {
        if (requestContext.httpRequest.params.prefix) {
            requestContext.prefix = requestContext.httpRequest.params.prefix;
        } else if (requestContext.httpRequest.body) {
            requestContext.keys = requestContext.httpRequest.body;
        }
        FACADE.CacheFacade.flushApiCache(requestContext, callback);
    },

    flushItemCache: function(requestContext, callback) {
        if (requestContext.httpRequest.params.prefix) {
            requestContext.prefix = requestContext.httpRequest.params.prefix;
        } else if (requestContext.httpRequest.body) {
            requestContext.keys = requestContext.httpRequest.body;
        }
        FACADE.CacheFacade.flushItemCache(requestContext, callback);
    },

    flushApiCacheKeys: function(requestContext, callback) {
        if (requestContext.httpRequest.body) {
            requestContext.keys = requestContext.httpRequest.body;
        }
        FACADE.CacheFacade.flushApiCacheKeys(requestContext, callback);
    },

    flushItemCacheKeys: function(requestContext, callback) {
        if (requestContext.httpRequest.body) {
            requestContext.keys = requestContext.httpRequest.body;
        }
        FACADE.CacheFacade.flushItemCacheKeys(requestContext, callback);
    }
};