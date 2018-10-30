/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
    get: function (request, callback) {
        request.options = request.options || {};
        if (!request.options.recursive) {
            request.options.recursive = request.httpRequest.get('recursive') || false;
        }
        if (request.httpRequest.params.id) {
            request.options.recursive = request.httpRequest.get('recursive') || false;
            request.query = {
                _id: UTILS.isObjectId(request.httpRequest.params.id) ?
                    request.httpRequest.params.id :
                    ObjectId(request.httpRequest.params.id)
            };
        } else if (request.httpRequest.params.code) {
            request.options.recursive = request.httpRequest.get('recursive') || false;
            request.query = {
                code: request.httpRequest.params.code
            };
        } else if (!UTILS.isBlank(request.httpRequest.body)) {
            request = _.merge(request, request.httpRequest.body || {});
        }
        if (callback) {
            FACADE.FacadeName.get(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.FacadeName.get(request);
        }
    },

    remove: function (request, callback) {
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.FacadeName.remove(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.FacadeName.remove(request);
        }
    },

    removeById: function (request, callback) {
        request.ids = [];
        if (request.httpRequest.params.id) {
            request.ids.push(UTILS.isObjectId(request.httpRequest.params.id) ?
                request.httpRequest.params.id :
                ObjectId(request.httpRequest.params.id));
        } else if (UTILS.isArray(request.httpRequest.body) && request.httpRequest.body.length > 0) {
            request.httpRequest.body.forEach(element => {
                request.ids.push(UTILS.isObjectId(element) ? element : ObjectId(element));
            });
        }
        if (callback) {
            FACADE.FacadeName.removeById(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.FacadeName.removeById(request);
        }
    },

    removeByCode: function (request, callback) {
        request.codes = [];
        if (request.httpRequest.params.code) {
            request.codes.push(request.httpRequest.params.code);
        } else if (UTILS.isArray(request.httpRequest.body) && request.httpRequest.body.length > 0) {
            request.codes = request.httpRequest.body;
        }
        if (callback) {
            FACADE.FacadeName.removeByCode(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.FacadeName.removeByCode(request);
        }
    },

    save: function (request, callback) {
        request.models = request.httpRequest.body;
        if (callback) {
            FACADE.FacadeName.save(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.FacadeName.save(request);
        }
    },

    update: function (request, callback) {
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.FacadeName.update(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.FacadeName.update(request);
        }
    }
};