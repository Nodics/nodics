/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    get: function (request) {
        let input = request.local || request;
        input.collection = NODICS.getModels('moduleName', input.tenant).modelName;
        return SERVICE.DefaultPipelineService.start('modelsGetInitializerPipeline', input, {});
    },

    save: function (request) {
        let input = request.local || request;
        input.collection = NODICS.getModels('moduleName', input.tenant).modelName;
        return SERVICE.DefaultPipelineService.start('modelsSaveInitializerPipeline', input, {});
    },

    remove: function (request) {
        let input = request.local || request;
        SERVICE.DefaultPipelineService.start('modelsRemoveInitializerPipeline', input, {});
    },

    update: function (input) {
        return SERVICE.DefaultPipelineService.start('modelsUpdateInitializerPipeline', input, {});
    }
};