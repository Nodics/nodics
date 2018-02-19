/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/*
    {
        "pageSize": 10,
        "pageNumber": 0,
        "select": {
            "enterpriseCode": 1,
            "name": 1
        },
        "sort": { 
            "name": -1 
        }
    }

    options: { retainKeyOrder: false, limit: 10, skip: 0, sort: { name: -1 } },
    _conditions: { enterpriseCode: 'default' },
    _fields: { enterpriseCode: 1, name: 1 },
*/
module.exports = {
    default: {
        defineDefaultFind: function(model, rawSchema) {
            model.statics.findItem = function(input) {
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
                return query.lean().exec();
            };
        },

        defineDefaultGet: function(model, rawSchema) {
            model.statics.get = function(input) {
                let moduleObject = NODICS.getModules()[rawSchema.moduleName];
                if (moduleObject.itemCache && rawSchema.cache && rawSchema.cache.enabled) {
                    return new Promise((resolve, reject) => {
                        let query = SERVICE.CacheService.createItemKey(input);
                        SERVICE.CacheService.getItem(rawSchema, moduleObject.itemCache, query).then(value => {
                            console.log('      Fulfilled from Item cache');
                            resolve(value);
                        }).catch(error => {
                            this.findItem(input).then(items => {
                                resolve(items);
                            }).catch(error => {
                                reject(error);
                            });
                        });
                    });
                } else {
                    return this.findItem(input);
                }
            };
        },

        defineDefaultGetById: function(model, rawSchema) {
            model.statics.getById = function(input) {
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
                return this.get(request);
            };
        },

        defineDefaultRemoveById: function(model, rawSchema) {
            model.statics.removeById = function(input) {
                let schema = rawSchema;
                if (!input.ids) {
                    throw new Error("   ERROR: Ids list can't be null to save Item");
                }
                return this.remove({ _id: { $in: input.ids } });
            };
        },

        defineDefaultSave: function(model, rawSchema) {
            model.statics.save = function(input) {
                let schema = rawSchema;
                if (!input.models || !input.tenant) {
                    throw new Error("   ERROR: Model value can't be null to save Item");
                }
                return new Promise((resolve, reject) => {
                    if (!UTILS.isBlank(schema.refSchema)) {
                        let request = _.merge({
                            input: input,
                            rawSchema: schema,
                            resolve: resolve,
                            reject: reject,
                            operation: DAO.NestedModelsHandlerDao.saveSubModel
                        }, input);
                        DAO.NestedModelsHandlerDao.performNestedSchema(request, (input) => {
                            this.create(input.models, (error, models) => {
                                if (error) reject(error);
                                resolve(models);
                            });
                        });
                    } else {
                        this.create(input.models, (error, models) => {
                            if (error) {
                                reject(error);
                            }
                            resolve(models);
                        });
                    }
                });
            };
        },

        defineDefaultUpdate: function(model, rawSchema) {
            model.statics.update = function(input) {
                let _self = this;
                let schema = rawSchema;
                if (!input.models || !input.tenant) {
                    throw new Error("   ERROR: Model can't be null to save Item");
                }
                return new Promise((resolve, reject) => {
                    if (!UTILS.isBlank(schema.refSchema)) {
                        let request = _.merge({
                            input: input,
                            rawSchema: schema,
                            resolve: resolve,
                            reject: reject,
                            operation: DAO.NestedModelsHandlerDao.updateSubModel
                        }, input);
                        DAO.NestedModelsHandlerDao.performNestedSchema(request, (input) => {
                            input._self = _self;
                            input.resolve = resolve;
                            input.reject = reject;
                            DAO.NestedModelsHandlerDao.createModels(input, { new: true });
                        });
                    } else {
                        input._self = _self;
                        input.resolve = resolve;
                        input.reject = reject;
                        DAO.NestedModelsHandlerDao.createModels(input, { new: true });
                    }
                });
            };
        },

        defineDefaultSaveOrUpdate: function(model, rawSchema) {
            model.statics.saveOrUpdate = function(input) {
                let _self = this;
                let schema = rawSchema;
                if (!input.models || !input.tenant) {
                    throw new Error("   ERROR: Model can't be null to save Item");
                }
                return new Promise((resolve, reject) => {
                    if (!UTILS.isBlank(schema.refSchema)) {
                        let request = _.merge({
                            input: input,
                            rawSchema: schema,
                            resolve: resolve,
                            reject: reject,
                            operation: DAO.NestedModelsHandlerDao.saveOrUpdateSubModel
                        }, input);
                        DAO.NestedModelsHandlerDao.performNestedSchema(request, (input) => {
                            input._self = _self;
                            input.resolve = resolve;
                            input.reject = reject;
                            DAO.NestedModelsHandlerDao.createModels(input, { upsert: true, new: true });
                        });
                    } else {
                        input._self = _self;
                        input.resolve = resolve;
                        input.reject = reject;
                        DAO.NestedModelsHandlerDao.createModels(input, { upsert: true, new: true });
                    }
                });
            };
        },
    }
};