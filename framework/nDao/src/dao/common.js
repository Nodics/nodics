/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const ObjectId = require('mongodb').ObjectId;

module.exports = {

    get: function (request) {
        request.collection = NODICS.getModels('mdulnm', request.tenant).mdlnm;
        request.moduleName = request.moduleName || request.collection.moduleName;
        return SERVICE.DefaultPipelineService.start('modelsGetInitializerPipeline', request, {});
    },

    getById: function (id, tenant) {
        return this.get({
            tenant: tenant,
            query: {
                _id: ObjectId(id)
            }
        });
    },

    getByCode: function (code, tenant) {
        return this.get({
            tenant: tenant,
            query: {
                code: code
            }
        });
    },

    save: function (request) {
        request.collection = NODICS.getModels('mdulnm', request.tenant).mdlnm;
        request.moduleName = request.moduleName || request.collection.moduleName;
        return SERVICE.DefaultPipelineService.start('modelsSaveInitializerPipeline', request, {});
    },

    remove: function (request) {
        request.collection = NODICS.getModels('mdulnm', request.tenant).mdlnm;
        request.moduleName = request.moduleName || request.collection.moduleName;
        return SERVICE.DefaultPipelineService.start('modelsRemoveInitializerPipeline', request, {});
    },

    removeById: function (ids, tenant) {
        return this.remove({
            tenant: tenant,
            query: {
                _id: {
                    $in: ids
                }
            }
        });
    },

    removeByCode: function (codes, tenant) {
        return this.remove({
            tenant: tenant,
            query: {
                code: {
                    $in: codes
                }
            }
        });
    },

    update: function (request) {
        request.collection = NODICS.getModels('mdulnm', request.tenant).mdlnm;
        request.moduleName = request.moduleName || request.collection.moduleName;
        return SERVICE.DefaultPipelineService.start('modelsUpdateInitializerPipeline', request, {});
    }
};