/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    get: function(request, callback) {
        NODICS.getModels('moduleName', request.tenant).modelName.get(request).then((models) => {
            callback(null, models, request);
        }).catch((error) => {
            callback(error, null, request);
        });
    },

    getById: function(request, callback) {
        NODICS.getModels('moduleName', request.tenant).modelName.getById(request).then((models) => {
            callback(null, models, request);
        }).catch((error) => {
            callback(error, null, request);
        });
    },

    save: function(request, callback) {
        NODICS.getModels('moduleName', request.tenant).modelName.save(request).then((models) => {
            callback(null, models);
        }).catch((error) => {
            callback(error, null);
        });
    },

    removeById: function(request, callback) {
        NODICS.getModels('moduleName', request.tenant).modelName.removeById(request).then((models) => {
            callback(null, models, request);
        }).catch((error) => {
            callback(error, null, request);
        });
    },

    update: function(request, callback) {
        NODICS.getModels('moduleName', request.tenant).modelName.update(request).then((models) => {
            callback(null, models, request);
        }).catch((error) => {
            callback(error, null, request);
        });
    },

    saveOrUpdate: function(request, callback) {
        NODICS.getModels('moduleName', request.tenant).modelName.saveOrUpdate(request).then((models) => {
            callback(null, models, request);
        }).catch((error) => {
            callback(error, null, request);
        });
    }
};