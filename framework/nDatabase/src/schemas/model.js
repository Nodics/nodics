/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    default: {
        defineDefaultGet: function(model, rawSchema) {
            model.statics.get = function(input, callback) {
                let schema = rawSchema;
                let requestBody = input.options;
                let skip = (requestBody.pageSize || CONFIG.get('defaultPageSize')) * (requestBody.pageNumber || CONFIG.get('defaultPageNumber'));
                let query = this.find(requestBody.query || {})
                    .limit(requestBody.pageSize || CONFIG.get('defaultPageSize'))
                    .skip(skip)
                    .sort(requestBody.sort || {})
                    .select(requestBody.select || {});
                if (requestBody.recursive && schema.refSchema) {
                    _.each(schema.refSchema, function(modelName, property) {
                        query.populate(property);
                    });
                }
                return query.exec(callback);
            };
        },

        defineDefaultGetById: function(model, rawSchema) {
            model.statics.getById = function(input, callback) {
                let schema = rawSchema;
                if (!input.id) {
                    throw new Error("   ERROR: Id value can't be null to get Item");
                }
                let request = {
                    tenant: input.tenant,
                    options: {
                        pageSize: CONFIG.get('defaultPageSize'),
                        pageNumber: CONFIG.get('defaultPageNumber'),
                        query: { _id: input.id }
                    }
                };
                return this.get(request, callback);
            };
        },

        defineDefaultGetByCode: function(model, rawSchema) {
            model.statics.getByCode = function(input, callback) {
                let schema = rawSchema;
                if (!input.code) {
                    throw new Error("   ERROR: Code value can't be null to get Item");
                }
                let request = {
                    tenant: input.tenant,
                    options: {
                        pageSize: CONFIG.get('defaultPageSize'),
                        pageNumber: CONFIG.get('defaultPageNumber'),
                        query: { code: input.code }
                    }
                };
                return this.get(request, callback);
            };
        },

        defineDefaultRemoveById: function(model, rawSchema) {
            model.statics.removeById = function(input, callback) {
                let schema = rawSchema;
                if (!input.ids) {
                    throw new Error("   ERROR: Ids list can't be null to save Item");
                }
                return this.remove({ _id: { $in: input.ids } }, callback);
            };
        },

        defineDefaultRemoveByCode: function(model, rawSchema) {
            model.statics.removeByCode = function(input, callback) {
                let schema = rawSchema;
                if (!input.codes) {
                    throw new Error("   ERROR: Code list can't be null to save Item");
                }
                return this.remove({ code: { $in: input.codes } }, callback);
            };
        },

        defineDefaultSave: function(model, rawSchema) {
            model.statics.save = function(input, callback) {
                let schema = rawSchema;
                if (!input.models || !input.tenant) {
                    throw new Error("   ERROR: Model value can't be null to save Item");
                }
                if (!UTILS.isBlank(schema.refSchema)) {
                    let request = _.merge({
                        input: input,
                        callback: callback,
                        rawSchema: schema,
                        operation: DAO.NestedModelsHandlerDao.saveSubModel
                    }, input);
                    DAO.NestedModelsHandlerDao.performNestedSchema(request, (input, callback) => {
                        this.create(input.models, (error, models) => {
                            callback(error, models, input);
                        });
                    });
                } else {
                    return this.create(input.models, (error, models) => {
                        callback(error, models, input);
                    });
                }
            };
        },

        defineDefaultUpdate: function(model, rawSchema) {
            model.statics.update = function(input, callback) {
                let _self = this;
                let schema = rawSchema;
                if (!input.models || !input.tenant) {
                    throw new Error("   ERROR: Model can't be null to save Item");
                }
                if (!UTILS.isBlank(schema.refSchema)) {
                    let request = _.merge({
                        input: input,
                        callback: callback,
                        rawSchema: schema,
                        operation: DAO.NestedModelsHandlerDao.updateSubModel
                    }, input);
                    DAO.NestedModelsHandlerDao.performNestedSchema(request, (input, callback) => {
                        console.log('updating final models : ', input.models);
                        input._self = _self;
                        DAO.NestedModelsHandlerDao.createModels(input, callback, { new: true });
                    });
                } else {
                    input._self = _self;
                    DAO.NestedModelsHandlerDao.createModels(input, callback, { new: true });
                }
            };
        },

        defineDefaultSaveOrUpdate: function(model, rawSchema) {
            model.statics.saveOrUpdate = function(input, callback) {
                let schema = rawSchema;
                if (!input.models || !input.tenant) {
                    throw new Error("   ERROR: Model can't be null to save Item");
                }
                if (!UTILS.isBlank(schema.refSchema)) {
                    let request = _.merge({
                        input: input,
                        callback: callback,
                        rawSchema: schema,
                        operation: DAO.NestedModelsHandlerDao.updateSubModel
                    }, input);
                    input._self = _self;
                    DAO.NestedModelsHandlerDao.performNestedSchema(request, (input, callback) => {
                        DAO.NestedModelsHandlerDao.createModels(input, callback, { upsert: true, new: true });
                    });
                } else {
                    input._self = _self;
                    DAO.NestedModelsHandlerDao.createModels(input, callback, { upsert: true, new: true });
                }
            };
        },
    }
};