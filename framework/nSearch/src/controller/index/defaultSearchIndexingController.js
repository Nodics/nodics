/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    fullIndex: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName;
        request.indexType = request.httpRequest.params.indexType;
        request = _.merge(request, request.httpRequest.body || {});
        request.reloadSearchSchema = request.reloadSearchSchema || CONFIG.get('search').reloadSearchSchema;
        if (callback) {
            FACADE.DefaultSearchIndexingFacade.fullIndex(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultSearchIndexingFacade.fullIndex(request);
        }
    },

    incrementalIndex: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName;
        request.indexType = request.httpRequest.params.indexType;
        request = _.merge(request, request.httpRequest.body || {});
        request.reloadSearchSchema = request.reloadSearchSchema || CONFIG.get('search').reloadSearchSchema;
        if (callback) {
            FACADE.DefaultSearchIndexingFacade.incrementalIndex(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultSearchIndexingFacade.incrementalIndex(request);
        }
    }
};