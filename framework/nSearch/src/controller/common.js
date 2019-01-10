/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    find: function (request, callback) {
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.dsdName.get(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.get(request);
        }
    },

    fullIndex: function (request, callback) {
        request = _.merge(request, request.httpRequest.body || {});
        request.reloadSearchSchema = request.reloadSearchSchema || CONFIG.get('search').reloadSearchSchema;
        if (callback) {
            FACADE.dsdName.fullIndex(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.fullIndex(request);
        }
    },

    incrementalIndex: function (request, callback) {
        request = _.merge(request, request.httpRequest.body || {});
        request.reloadSearchSchema = request.reloadSearchSchema || CONFIG.get('search').reloadSearchSchema;
        if (callback) {
            FACADE.dsdName.incrementalIndex(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.incrementalIndex(request);
        }
    }
};