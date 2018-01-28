/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

    options: {
        isNew: true
    },
    /*
        request.tenant
        request.models
        request.rawSchema
    */
    performNestedSchema: function(request, callback) {
        let options = {
            refSchema: _.merge({}, request.rawSchema.refSchema),
            request: request,
            callback: callback,

        };
        if (request.models instanceof Array) {
            options.model = request.models.shift();
            options.resoledModels = [];
            options.models = request.models;
            DAO.NestedModelsHandlerDao.performSubModel(options);
        } else {
            options.model = request.models;
            options.resoledModels = [];
            options.models = [];
            DAO.NestedModelsHandlerDao.performSubModel(options);
        }
    },

    performSubModel: function(options) {
        if (UTILS.isBlank(options.refSchema)) {
            options.request.input.models = options.resoledModels;
            options.callback(options.request.input);
        } else {
            options.refKey = Object.keys(options.refSchema)[0];
            options.refValue = options.refSchema[options.refKey];

            delete options.refSchema[options.refKey];
            let subModel = options.model[options.refKey];
            if (!UTILS.isBlank(subModel) && (UTILS.isObject(subModel) || UTILS.isArrayOfObject(subModel))) {
                options.request.operation(options, subModel);
            } else {
                DAO.NestedModelsHandlerDao.performNextSubModel(options);
            }
        }
    },

    performNextSubModel: function(options) {
        if (!UTILS.isBlank(options.refSchema)) {
            DAO.NestedModelsHandlerDao.performSubModel(options);
        } else if (options.models.length > 0) {
            options.resoledModels.push(options.model);
            options.model = options.models.shift();
            options.refSchema = _.merge({}, options.request.rawSchema.refSchema);
            DAO.NestedModelsHandlerDao.performSubModel(options);
        } else {
            options.resoledModels.push(options.model);
            DAO.NestedModelsHandlerDao.performSubModel(options);
        }
    },

    saveSubModel: function(options, subModel) {
        let input = {
            tenant: options.request.tenant,
            models: subModel
        };
        NODICS.getModels(options.request.rawSchema.moduleName, input.tenant)[options.refValue.modelName].save(input).then(result => {
            if (result instanceof Array) {
                options.model[options.refKey] = result.map(obj => obj._id);
            } else {
                options.model[options.refKey] = result._id;
            }
            DAO.NestedModelsHandlerDao.performNextSubModel(options);
        }).catch(error => {
            options.request.reject(error);
        });
    },

    updateSubModel: function(options, subModel) {
        let input = {
            tenant: options.request.tenant,
            models: subModel
        };
        NODICS.getModels(options.request.rawSchema.moduleName, input.tenant)[options.refValue.modelName].update(input).then(result => {
            if (result instanceof Array) {
                options.model[options.refKey] = result.map(obj => obj._id);
            } else {
                options.model[options.refKey] = result._id;
            }
            DAO.NestedModelsHandlerDao.performNextSubModel(options);
        }).catch(error => {
            options.request.reject(error);
        });
    },
    saveOrUpdateSubModel: function(options, subModel) {
        let input = {
            tenant: options.request.tenant,
            models: subModel
        };
        NODICS.getModels(options.request.rawSchema.moduleName, input.tenant)[options.refValue.modelName].saveOrUpdate(input).then(result => {
            if (result instanceof Array) {
                options.model[options.refKey] = result.map(obj => obj._id);
            } else {
                options.model[options.refKey] = result._id;
            }
            DAO.NestedModelsHandlerDao.performNextSubModel(options);
        }).catch(error => {
            options.request.reject(error);
        });
    },

    createModels: function(input, option) {
        let finalModels = [];
        if (input.models instanceof Array) {
            finalModels = input.models;
        } else {
            finalModels.push(input.models);
        }
        return Promise.all(
            finalModels.map((model) => {
                if (model._id) {
                    return input._self.findByIdAndUpdate(model._id, { $set: model }, option);
                } else {
                    return input._self.create(model);
                }
                /*if (model._id) {
                    return input._self.findByIdAndUpdate(model._id, { $set: model }, option);
                } else {
                    return input._self.findOneAndUpdate({ code: model.code }, { $set: model }, option);
                }*/
            })
        ).then(function(models) {
            input.resolve(models);
        }).catch((error) => {
            input.reject(error);
        });
    }
};