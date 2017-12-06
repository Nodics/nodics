module.exports = {

    default: {
        defineDefaultGet: function(model, rawSchema) {
            model.statics.get = function(input, callback) {
                let requestBody = input.options;
                let skip = (requestBody.pageSize || CONFIG.get('defaultPageSize')) * (requestBody.pageNumber || CONFIG.get('defaultPageNumber'));
                return this.find(requestBody.query || {})
                    .limit(requestBody.pageSize || CONFIG.get('defaultPageSize'))
                    .skip(skip)
                    .sort(requestBody.sort || {})
                    .select(requestBody.select || {})
                    .exec(callback);
            };
        },

        defineDefaultGetById: function(model, rawSchema) {
            model.statics.getById = function(input, callback) {
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
                if (!input.model) {
                    throw new Error("   ERROR: Model value can't be null to save Item");
                }
                return this.create(input.model, callback);
            };
        },

        defineDefaultRemoveById: function(model, rawSchema) {
            model.statics.removeById = function(input, callback) {
                if (!input.ids) {
                    throw new Error("   ERROR: Ids list can't be null to save Item");
                }
                return this.remove({ _id: { $in: input.ids } }, callback);
            };
        },

        defineDefaultRemoveByCode: function(model, rawSchema) {
            model.statics.removeByCode = function(input, callback) {
                if (!input.codes) {
                    throw new Error("   ERROR: Code list can't be null to save Item");
                }
                return this.remove({ code: { $in: input.codes } }, callback);
            };
        },

        defineDefaultUpdate: function(model, rawSchema) {
            model.statics.update = function(input, callback) {
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
        }
    }
};