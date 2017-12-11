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
                if (schema.refSchema) {
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

        defineDefaultSave: function(model, rawSchema) {
            model.statics.save = function(input, callback) {
                let schema = rawSchema;
                if (!input.models) {
                    throw new Error("   ERROR: Model value can't be null to save Item");
                }
                /*if (!UTILS.isBlank(schema.refSchema)) {
                    let request = _.merge({}, input);
                    request.rawSchema = schema;
                    DAO.NestedModelsHandlerDao.saveNestedSchema(request, (input, callback) => {
                        console.log("final models : ", input.models);
                        return this.create(input.models, callback);
                    });
                } else {
                    return this.create(input.models, callback);
                }*/
                return this.create(input.models, callback);
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

        defineDefaultUpdate: function(model, rawSchema) {
            model.statics.update = function(input, callback) {
                let schema = rawSchema;
                if (!input.models) {
                    throw new Error("   ERROR: Model can't be null to save Item");
                }
                return input.models.map((model) => {
                    if (model._id) {
                        return this.findByIdAndUpdate(model._id, { $set: model }, { new: true }, callback);
                    } else {
                        return this.findOneAndUpdate({ code: model.code }, { $set: model }, { new: true }, callback);
                    }
                });
            };
        },

        defineDefaultSaveOrUpdate: function(model, rawSchema) {
            model.statics.saveOrUpdate = function(input, callback) {
                let schema = rawSchema;
                if (!input.models) {
                    throw new Error("   ERROR: Model can't be null to save Item");
                }
                return input.models.map((model) => {
                    if (model._id) {
                        return this.findByIdAndUpdate(model._id, { $set: model }, { upsert: true, new: true }, callback);
                    } else {
                        return this.findOneAndUpdate({ code: model.code }, { $set: model }, { upsert: true, new: true }, callback);
                    }
                });
            };
        },
    }
};