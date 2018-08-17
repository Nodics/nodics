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
        try {
            return new Promise((resolve, reject) => {
                input.collection = NODICS.getModels('moduleName', input.tenant).modelName;
                let response = {
                    modelsGetInitializerPipeline: {
                        promise: {
                            resolve: resolve,
                            reject: reject
                        }
                    }
                };
                SERVICE.DefaultPipelineService.startPipeline('modelsGetInitializerPipeline', input, response);
            });
        } catch (error) {
            return Promise.reject(error);
        }
    },

    save: function (request) {
        let input = request.local || request;
        try {
            return new Promise((resolve, reject) => {
                input.collection = NODICS.getModels('moduleName', input.tenant).modelName;
                let response = {
                    modelsSaveInitializerPipeline: {
                        promise: {
                            resolve: resolve,
                            reject: reject
                        }
                    }
                };
                SERVICE.DefaultPipelineService.startPipeline('modelsSaveInitializerPipeline', input, response);
            });
        } catch (error) {
            return Promise.reject(error);
        }
    },

    remove: function (request) {
        let input = request.local || request;
        try {
            return new Promise((resolve, reject) => {
                let response = {
                    dataImportInitializerPipeline: {
                        promise: {
                            resolve: resolve,
                            reject: reject
                        }
                    }
                };
                SERVICE.DefaultPipelineService.startPipeline('modelsRemoveInitializerPipeline', input, response);
            });
        } catch (error) {
            return Promise.reject(error);
        }
    },

    update: function (input) {
        try {
            return new Promise((resolve, reject) => {
                let response = {
                    dataImportInitializerPipeline: {
                        promise: {
                            resolve: resolve,
                            reject: reject
                        }
                    }
                };
                SERVICE.DefaultPipelineService.startPipeline('modelsUpdateInitializerPipeline', input, response);
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }
};