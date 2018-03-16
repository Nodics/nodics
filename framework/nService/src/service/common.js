/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    get: function(request, callback) {
        let input = request.local || request;
        if (callback) {
            NODICS.getModels('moduleName', input.tenant).modelName.get(input).then((models) => {
                callback(null, models);
            }).catch((error) => {
                callback(error);
            });
        } else {
            return NODICS.getModels('moduleName', input.tenant).modelName.get(input);
        }
    },

    getById: function(request, callback) {
        let input = request.local || request;
        input.query = {
            _id: input.id
        };
        if (callback) {
            NODICS.getModels('moduleName', input.tenant).modelName.get(input).then((models) => {
                callback(null, models);
            }).catch((error) => {
                callback(error);
            });
        } else {
            return NODICS.getModels('moduleName', input.tenant).modelName.get(input);
        }
    },

    save: function(request, callback) {
        let input = request.local || request;
        if (callback) {
            NODICS.getModels('moduleName', input.tenant).modelName.save(input).then((models) => {
                callback(null, models);
            }).catch((error) => {
                callback(error);
            });
        } else {
            return NODICS.getModels('moduleName', input.tenant).modelName.save(input);
        }
    },

    removeById: function(request, callback) {
        let input = request.local || request;
        if (callback) {
            NODICS.getModels('moduleName', input.tenant).modelName.removeById(input).then((models) => {
                callback(null, models, request);
            }).catch((error) => {
                callback(error, null, request);
            });
        } else {
            return NODICS.getModels('moduleName', input.tenant).modelName.removeById(input);
        }
    },

    update: function(request, callback) {
        let input = request.local || request;
        if (callback) {
            NODICS.getModels('moduleName', input.tenant).modelName.update(input).then((models) => {
                callback(null, models);
            }).catch((error) => {
                callback(error);
            });
        } else {
            return NODICS.getModels('moduleName', input.tenant).modelName.update(input);
        }
    },

    saveOrUpdate: function(request, callback) {
        let input = request.local || request;
        if (callback) {
            NODICS.getModels('moduleName', input.tenant).modelName.saveOrUpdate(input).then((models) => {
                callback(null, models);
            }).catch((error) => {
                callback(error);
            });
        } else {
            return NODICS.getModels('moduleName', input.tenant).modelName.saveOrUpdate(input);
        }
    }
};