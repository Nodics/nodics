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
        request.local.options = request.local.options || {};
        if (request.params.id) {
            request.local.options.recursive = request.get('recursive') || false;
            request.local.query = {
                _id: UTILS.isObjectId(request.params.id) ? request.params.id : ObjectId(request.params.id)
            };
        } else if (request.params.code) {
            request.local.options.recursive = request.get('recursive') || false;
            request.local.query = {
                code: request.params.code
            };
        } else if (!UTILS.isBlank(request.body)) {
            request.local = _.merge(request.local || {}, request.body);
            if (!request.local.options.recursive) {
                request.local.options.recursive = request.get('recursive') || false;
            }
        }
        FACADE.FacadeName.get(request, callback);
    },

    remove: function (request, callback) {
        request.local = _.merge(request.local || {}, request.body);
        FACADE.FacadeName.remove(request, callback);
    },

    removeById: function (request, callback) {
        request.local.ids = [];
        if (request.params.id) {
            request.local.ids.push(UTILS.isObjectId(request.params.id) ? request.params.id : ObjectId(request.params.id));
        } else if (UTILS.isArray(request.body) && request.body.length > 0) {
            request.body.forEach(element => {
                request.local.ids.push(UTILS.isObjectId(element) ? element : ObjectId(element));
            });
        }
        FACADE.FacadeName.removeById(request, callback);
    },
    removeByCode: function (request, callback) {
        request.local.codes = [];
        if (request.params.code) {
            request.local.codes.push(request.params.code);
        } else if (UTILS.isArray(request.body) && request.body.length > 0) {
            request.local.codes = request.body;
        }
        FACADE.FacadeName.removeByCode(request, callback);
    },

    save: function (request, callback) {
        request.local.models = request.body;
        FACADE.FacadeName.save(request, callback);
    },

    update: function (request, callback) {
        FACADE.FacadeName.update(request, callback);
    }
};