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
        let input = request.local || request;
        input.collection = NODICS.getModels('moduleName', input.tenant).modelName;
        return SERVICE.DefaultPipelineService.start('modelsGetInitializerPipeline', input, {});
    },

    getById: function (request) {
        return this.get({
            tenant: request.tenant,
            query: {
                _id: ObjectId(request.id)
            }
        });
    },

    getByCode: function (request) {
        return this.get({
            tenant: request.tenant,
            query: {
                code: request.code
            }
        });
    },

    save: function (request) {
        let input = request.local || request;
        input.collection = NODICS.getModels('moduleName', input.tenant).modelName;
        return SERVICE.DefaultPipelineService.start('modelsSaveInitializerPipeline', input, {});
    },

    remove: function (request) {
        let input = request.local || request;
        input.collection = NODICS.getModels('moduleName', input.tenant).modelName;
        return SERVICE.DefaultPipelineService.start('modelsRemoveInitializerPipeline', input, {});
    },

    removeById: function (request) {
        let input = request.local || request;
        return this.remove({
            tenant: input.tenant,
            query: {
                _id: {
                    $in: input.ids
                }
            }
        });
    },

    removeByCode: function (request) {
        let input = request.local || request;
        return this.remove({
            tenant: input.tenant,
            query: {
                code: {
                    $in: input.codes
                }
            }
        });
    },

    update: function (request) {
        let input = request.local || request;
        input.collection = NODICS.getModels('moduleName', input.tenant).modelName;
        return SERVICE.DefaultPipelineService.start('modelsUpdateInitializerPipeline', input, {});
    }
};