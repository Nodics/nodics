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
        let moduleName = request.moduleName || 'mdulnm';
        request.schemaModel = NODICS.getModels(moduleName, request.tenant).mdlnm;
        request.indexName = request.indexName ? request.indexName : request.schemaModel.indexName;
        if (!request.tenant || !request.indexName) {
            throw new CLASSES.NodicsError('ERR_SRCH_00000', 'Invalid request or search is not active for this type');
        } else {
            return NODICS.getSearchModel(moduleName, request.tenant, request.indexName);
        }
    },

    doRefresh: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doRefreshIndexInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.NodicsError(error, null, 'ERR_SRCH_00000'));
        }
    },

    doCheckHealth: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doHealthCheckClusterInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.NodicsError(error, null, 'ERR_SRCH_00000'));
        }
    },

    doExists: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doExistModelInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.NodicsError(error, null, 'ERR_SRCH_00000'));
        }
    },

    doGet: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doGetModelsInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.NodicsError(error, null, 'ERR_SRCH_00000'));
        }
    },

    doSearch: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doSearchModelInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.NodicsError(error, null, 'ERR_SRCH_00000'));
        }
    },

    doSave: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doSaveModelsInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.NodicsError(error, null, 'ERR_SRCH_00000'));
        }
    },


    doBulk: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doBulkModelInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.NodicsError(error, null, 'ERR_SRCH_00000'));
        }
    },

    doRemove: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doRemoveModelsInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.NodicsError(error, null, 'ERR_SRCH_00000'));
        }
    },

    doRemoveByQuery: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doRemoveModelsByQueryInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.NodicsError(error, null, 'ERR_SRCH_00000'));
        }
    },

    doGetSchema: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doGetSchemaModelInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.NodicsError(error, null, 'ERR_SRCH_00000'));
        }
    },

    doUpdateSchema: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doUpdateSchemaModelInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.NodicsError(error, null, 'ERR_SRCH_00000'));
        }
    },

    doRemoveIndex: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doRemoveIndexInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.NodicsError(error, null, 'ERR_SRCH_00000'));
        }
    },

    doIndexing: function (request) {
        return new Promise((resolve, reject) => {
            try {
                request.searchModel = this.getSearchModel(request);
                SERVICE.DefaultIndexerService.prepareIndexer(request).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_SRCH_00000'));
            }
        });
    },
};