/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    getSearchModel: function (request) {
        request.schemaModel = NODICS.getModels('mdulnm', request.tenant).mdlnm;
        let indexName = request.indexName ? request.indexName : request.schemaModel.indexName;
        if (!request.moduleName || !request.tenant || !indexName) {
            throw new Error('Invalid request or search is not active for this type');
        } else {
            return NODICS.getSearchModel(request.moduleName, request.tenant, indexName);
        }
    },

    doRefresh: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doRefreshIndexInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject({
                success: false,
                code: 'ERR_SRCH_00000',
                error: error
            });
        }
    },

    doCheckHealth: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doHealthCheckClusterInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject({
                success: false,
                code: 'ERR_SRCH_00000',
                error: error
            });
        }
    },

    doExists: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doExistModelInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject({
                success: false,
                code: 'ERR_SRCH_00000',
                error: error
            });
        }
    },

    doGet: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doGetModelsInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject({
                success: false,
                code: 'ERR_SRCH_00000',
                error: error
            });
        }
    },

    doSearch: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doSearchModelInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject({
                success: false,
                code: 'ERR_SRCH_00000',
                error: error
            });
        }
    },

    doSave: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doSaveModelsInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject({
                success: false,
                code: 'ERR_SRCH_00000',
                error: error
            });
        }
    },


    doBulk: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doBulkModelInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject({
                success: false,
                code: 'ERR_SRCH_00000',
                error: error
            });
        }
    },

    doRemove: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doRemoveModelsInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject({
                success: false,
                code: 'ERR_SRCH_00000',
                error: error
            });
        }
    },

    doRemoveByQuery: function (request) {
        return this.doRemove(request);
    },

    doGetMapping: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doGetMappingModelInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject({
                success: false,
                code: 'ERR_SRCH_00000',
                error: error
            });
        }
    },

    doUpdateMapping: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doUpdateMappingModelInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject({
                success: false,
                code: 'ERR_SRCH_00000',
                error: error
            });
        }
    },

    doRemoveIndex: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doRemoveIndexInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject({
                success: false,
                code: 'ERR_SRCH_00000',
                error: error
            });
        }
    }
};