/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    /*{
        pageSize:10,
        pageNumber:1,
        select:{},
        sort:{},
        options:{},
        query:{}
    }*/
    get: function(request, callback) {
        if (!request) {
            request = {};
        }
        let skip = (request.pageSize || CONFIG.get('defaultPageSize')) * (request.pageNumber || CONFIG.get('defaultPageNumber'));
        return NODICS.getModels('moduleName').modelName.find(request.query || {})
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
        return NODICS.getModels('moduleName').modelName.create(model, callback);

    },
    removeById: function(ids, callback) {
        if (!ids) {
            throw new Error("   ERROR: Ids list can't be null to save Item");
        }
        return NODICS.getModels('moduleName').modelName.remove({ _id: { $in: ids } }, callback);
    },

    removeByCode: function(codes, callback) {
        if (!codes) {
            throw new Error("   ERROR: Code list can't be null to save Item");
        }
        return NODICS.getModels('moduleName').modelName.remove({ code: { $in: codes } }, callback);
    },

    update: function(model, callback) {
        if (!model) {
            throw new Error("   ERROR: Model can't be null to save Item");
        }
        if (model._id) {
            return NODICS.getModels('moduleName').modelName.findByIdAndUpdate(model._id, { $set: model }, { new: true }, callback);
        } else {
            return NODICS.getModels('moduleName').modelName.findOneAndUpdate({ code: model.code }, { $set: model }, { new: true }, callback);
        }
    },

    saveOrUpdate: function(model, callback) {
        if (!model) {
            throw new Error("   ERROR: Model can't be null to save Item");
        }
        if (model._id) {
            return NODICS.getModels('moduleName').modelName.findByIdAndUpdate(model._id, { $set: model }, { upsert: true, new: true }, callback);
        } else {
            return NODICS.getModels('moduleName').modelName.findOneAndUpdate({ code: model.code }, { $set: model }, { upsert: true, new: true }, callback);
        }
    }
};