/*
    Nodics - Enterprice Micro-Services Management Framework

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
            model.statics.findItem = function(input, rawQuery) {
                return new Promise((resolve, reject) => {
                    let schema = rawSchema;
                    SERVICE.ValidateRequestService.validateInputFilter(input).then(success => {
                        let skip = (input.pageSize || CONFIG.get('defaultPageSize')) * (input.pageNumber || CONFIG.get('defaultPageNumber'));
                        let query = this.find(input.query || {})
                            .sort(input.sort || {})
                            .select(input.select || {});
                        if (!input.noLimit) {
                            query.limit(input.pageSize || CONFIG.get('defaultPageSize'))
                                .skip(skip);
                        }
                        if (input.recursive && schema.refSchema) {
                            _.each(schema.refSchema, function(modelName, property) {
                                query.populate(property);
                            });
                        }
                        query.rawQuery = rawQuery;
                        resolve(query.lean().exec());
                    }).catch(error => {
                        reject(error);
                    });
                });
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
                            value.cache = 'item hit';
                            resolve(value);
                        }).catch(error => {
                            this.findItem(input, query).then(items => {
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