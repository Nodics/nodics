/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    doGet: function (request, callback) {
        if (request.httpRequest.params.id) {
            request.query = {
                match: {
                    id: request.httpRequest.params.id
                }
            };
        } else {
            request = _.merge(request, request.httpRequest.body || {});
        }
        if (callback) {
            FACADE.dsdName.doGet(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.doGet(request);
        }
    },

    doSave: function (request, callback) {
        request.models = request.httpRequest.body;
        request.models = models;
        if (callback) {
            FACADE.dsdName.doSave(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.doSave(request);
        }
    },

    doRemove: function (request, callback) {
        if (request.httpRequest.params.id) {
            request.query = {
                id: request.httpRequest.params.id
            };
        } else {
            request = _.merge(request, request.httpRequest.body || {});
        }
        if (callback) {
            FACADE.dsdName.doRemove(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.doRemove(request);
        }
    }
};