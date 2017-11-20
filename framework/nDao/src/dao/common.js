/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    /*
    let input = {
        tenant: tenantName,
        options: {
            pageSize:10,
            pageNumber:1,
            select:{},
            sort:{},
            options:{},
            query:{}
        }
    }
    */
    get: function(input, callback) {
        let requestBody = input.options;
        let skip = (requestBody.pageSize || CONFIG.get('defaultPageSize')) * (requestBody.pageNumber || CONFIG.get('defaultPageNumber'));
        return NODICS.getModels('moduleName', input.tenant).modelName.find(requestBody.query || {})
            .limit(requestBody.pageSize || CONFIG.get('defaultPageSize'))
            .skip(skip)
            .sort(requestBody.sort || {})
            .select(requestBody.select || {})
            .exec(callback);
    },

    getById: function(input, callback) {
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
    },

    getByCode: function(input, callback) {
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
    },

    save: function(input, callback) {
        if (!input.model) {
            throw new Error("   ERROR: Model value can't be null to save Item");
        }
        return NODICS.getModels('moduleName', input.tenant).modelName.create(input.model, callback);
    },

    removeById: function(input, callback) {
        if (!input.ids) {
            throw new Error("   ERROR: Ids list can't be null to save Item");
        }
        return NODICS.getModels('moduleName', input.tenant).modelName.remove({ _id: { $in: input.ids } }, callback);
    },

    removeByCode: function(input, callback) {
        if (!input.codes) {
            throw new Error("   ERROR: Code list can't be null to save Item");
        }
        return NODICS.getModels('moduleName', input.tenant).modelName.remove({ code: { $in: input.codes } }, callback);
    },

    update: function(input, callback) {
        if (!input.models) {
            throw new Error("   ERROR: Model can't be null to save Item");
        }
        console.log('    222224444444     --------------- : ', input);
        return input.models.map((model) => {
            if (model._id) {
                return NODICS.getModels('moduleName', input.tenant).modelName.findByIdAndUpdate(model._id, { $set: model }, { new: true }, callback);
            } else {
                return NODICS.getModels('moduleName', input.tenant).modelName.findOneAndUpdate({ code: model.code }, { $set: model }, { new: true }, callback);
            }
        });
    },

    saveOrUpdate: function(model, callback) {
        if (!input.models) {
            throw new Error("   ERROR: Model can't be null to save Item");
        }
        return input.models.map((model) => {
            if (model._id) {
                return NODICS.getModels('moduleName', input.tenant).modelName.findByIdAndUpdate(model._id, { $set: model }, { upsert: true, new: true }, callback);
            } else {
                return NODICS.getModels('moduleName', input.tenant).modelName.findOneAndUpdate({ code: model.code }, { $set: model }, { upsert: true, new: true }, callback);
            }
        });
    }
};