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
        if (callback) {
            NODICS.getModels('moduleName', request.tenant).modelName.get(request).then((models) => {
                callback(null, models, request);
            }).catch((error) => {
                callback(error, null, request);
            });
        } else {
            return NODICS.getModels('moduleName', request.tenant).modelName.get(request);
        }
    },

    getById: function(request, callback) {
        if (callback) {
            NODICS.getModels('moduleName', request.tenant).modelName.getById(request).then((models) => {
                callback(null, models, request);
            }).catch((error) => {
                callback(error, null, request);
            });
        } else {
            return NODICS.getModels('moduleName', request.tenant).modelName.getById(request);
        }
    },

    save: function(request, callback) {
        if (callback) {
            NODICS.getModels('moduleName', request.tenant).modelName.save(request).then((models) => {
                callback(null, models);
            }).catch((error) => {
                callback(error, null);
            });
        } else {
            return NODICS.getModels('moduleName', request.tenant).modelName.save(request);
        }
    },

    removeById: function(request, callback) {
        if (callback) {
            NODICS.getModels('moduleName', request.tenant).modelName.removeById(request).then((models) => {
                callback(null, models, request);
            }).catch((error) => {
                callback(error, null, request);
            });
        } else {
            return NODICS.getModels('moduleName', request.tenant).modelName.removeById(request);
        }
    },

    update: function(request, callback) {
        if (callback) {
            NODICS.getModels('moduleName', request.tenant).modelName.update(request).then((models) => {
                callback(null, models, request);
            }).catch((error) => {
                callback(error, null, request);
            });
        } else {
            return NODICS.getModels('moduleName', request.tenant).modelName.update(request);
        }
    },

    saveOrUpdate: function(request, callback) {
        if (callback) {
            NODICS.getModels('moduleName', request.tenant).modelName.saveOrUpdate(request).then((models) => {
                callback(null, models, request);
            }).catch((error) => {
                callback(error, null, request);
            });
        } else {
            return NODICS.getModels('moduleName', request.tenant).modelName.saveOrUpdate(request);
        }
    }
};