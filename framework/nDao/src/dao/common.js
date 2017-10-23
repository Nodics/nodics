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
        console.log('Got get');
        if (!request) {
            request = {};
        }
        let database = SYSTEM.getDatabase('databaseName');
        let skip = (request.pageSize || CONFIG.defaultPageSize) * (request.pageNumber || CONFIG.defaultPageNumber);
        return database.models.modelName.find(request.query || {})
            .limit(request.pageSize || CONFIG.defaultPageSize)
            .skip(skip)
            .sort(request.sort || {})
            .select(request.select || {})
            .exec(callback);
    },
    getById: function(id, callback) {
        console.log('Got getById');
        if (!id) {
            throw new Error("Id value can't be null to get Item");
        }
        let request = {
            pageSize: CONFIG.defaultPageSize,
            pageNumber: CONFIG.defaultPageNumber,
            query: { _id: id }
        };
        return this.get(request, callback);
    },
    getByCode: function(code, callback) {
        console.log('Got getByCode');
        if (!code) {
            throw new Error("Code value can't be null to get Item");
        }
        let request = {
            pageSize: CONFIG.defaultPageSize,
            pageNumber: CONFIG.defaultPageNumber,
            query: { code: code }
        };
        return this.get(request, callback);
    },
    save: function(model, callback) {
        console.log('Got save');
        if (!model) {
            throw new Error("Model value can't be null to save Item");
        }
        let database = SYSTEM.getDatabase('databaseName');
        return database.models.modelName.create(model, callback);

    },
    removeById: function(ids, callback) {
        console.log('Got removeById');
        if (!ids) {
            throw new Error("Ids list can't be null to save Item");
        }
        let database = SYSTEM.getDatabase('databaseName');
        return database.models.modelName.remove({ _id: { $in: ids } }, callback);
    },

    removeByCode: function(codes, callback) {
        console.log('Got removeByCode');
        if (!codes) {
            throw new Error("Code list can't be null to save Item");
        }
        let database = SYSTEM.getDatabase('databaseName');
        return database.models.modelName.remove({ code: { $in: codes } }, callback);
    },

    update: function(model, callback) {
        console.log('Got updateById');
        if (!model) {
            throw new Error("Model can't be null to save Item");
        }
        let database = SYSTEM.getDatabase('databaseName');
        if (model._id) {
            return database.models.modelName.findByIdAndUpdate(model._id, { $set: model }, { new: true }, callback);
        } else {
            return database.models.modelName.findOneAndUpdate({ code: model.code }, { $set: model }, { new: true }, callback);
        }
    },

    saveOrUpdate: function(model, callback) {
        console.log('Got saveOrUpdateById');
        if (!model) {
            throw new Error("Model can't be null to save Item");
        }
        if (model._id) {
            return database.models.modelName.findByIdAndUpdate(model._id, { $set: model }, { upsert: true, new: true }, callback);
        } else {
            return database.models.modelName.findOneAndUpdate({ code: model.code }, { $set: model }, { upsert: true, new: true }, callback);
        }
    }
};