module.exports = {
    /*
        {
            pageSize:10,
            pageNumber:1,
            select:{},
            sort:{},
            options:{},
            query:{}
        }
    */
    get: function(request, callback) {
        if (!request) {
            request = {};
        }
        let moduleDef = NODICS.getModules(moduleName);
        let skip = (request.pageSize || CONFIG.get('defaultPageSize')) * (request.pageNumber || CONFIG.get('defaultPageNumber'));
        return moduleDef.models.modelName.find(request.query || {})
            .limit(request.pageSize || CONFIG.get('defaultPageSize'))
            .skip(skip)
            .sort(request.sort || {})
            .select(request.select || {})
            .exec(callback);
    },
    getById: function(id, callback) {
        if (!id) {
            throw new Error("   ERROR: Id value can't be null to get Item");
        }
        let request = {
            pageSize: CONFIG.get('defaultPageSize'),
            pageNumber: CONFIG.get('defaultPageNumber'),
            query: { _id: id }
        };
        return this.get(request, callback);
    },
    getByCode: function(code, callback) {
        if (!code) {
            throw new Error("   ERROR: Code value can't be null to get Item");
        }
        let request = {
            pageSize: CONFIG.get('defaultPageSize'),
            pageNumber: CONFIG.get('defaultPageNumber'),
            query: { code: code }
        };
        return this.get(request, callback);
    },
    save: function(model, callback) {
        if (!model) {
            throw new Error("   ERROR: Model value can't be null to save Item");
        }
        let moduleDef = NODICS.getModules(moduleName);
        return moduleDef.models.modelName.create(model, callback);

    },
    removeById: function(ids, callback) {
        if (!ids) {
            throw new Error("   ERROR: Ids list can't be null to save Item");
        }
        let moduleDef = NODICS.getModule(moduleName);
        return moduleDef.models.modelName.remove({ _id: { $in: ids } }, callback);
    },

    removeByCode: function(codes, callback) {
        if (!codes) {
            throw new Error("   ERROR: Code list can't be null to save Item");
        }
        let moduleDef = NODICS.getModule(moduleName);
        return moduleDef.models.modelName.remove({ code: { $in: codes } }, callback);
    },

    update: function(model, callback) {
        if (!model) {
            throw new Error("   ERROR: Model can't be null to save Item");
        }
        let moduleDef = NODICS.getModule(moduleName);
        if (model._id) {
            return moduleDef.models.modelName.findByIdAndUpdate(model._id, { $set: model }, { new: true }, callback);
        } else {
            return moduleDef.models.modelName.findOneAndUpdate({ code: model.code }, { $set: model }, { new: true }, callback);
        }
    },

    saveOrUpdate: function(model, callback) {
        if (!model) {
            throw new Error("   ERROR: Model can't be null to save Item");
        }
        let moduleDef = NODICS.getModule(moduleName);
        if (model._id) {
            return moduleDef.models.modelName.findByIdAndUpdate(model._id, { $set: model }, { upsert: true, new: true }, callback);
        } else {
            return moduleDef.models.modelName.findOneAndUpdate({ code: model.code }, { $set: model }, { upsert: true, new: true }, callback);
        }
    }
};