/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    get: function (request, callback) {
        if (request.params.id) {
            request.local.id = request.params.id;
            request.local.recursive = request.get('recursive') || false;
            FACADE.FacadeName.getById(request, callback);
        } else if (!UTILS.isBlank(request.body)) {
            request.local = _.merge(request.local || {}, request.body);
            if (!request.local.recursive) {
                request.local.recursive = request.get('recursive') || false;
            }
        }
        FACADE.FacadeName.get(request, callback);
    },

    save: function (request, callback) {
        request.local.models = request.body;
        FACADE.FacadeName.save(request, callback);
    },

    remove: function (request, callback) {
        request.local.ids = [];
        if (request.params.id) {
            request.local.ids.push(request.params.id);
        } else {
            request.local.ids = request.body;
        }
        FACADE.FacadeName.removeById(request, callback);
    }
};