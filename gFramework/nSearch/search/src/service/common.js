/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nSearch/search/src/service/common
 * @description Template service used by generated nSearch schema services.
 * During generation, placeholders are replaced with the owning search service,
 * schema, and index identifiers.
 * @layer template
 * @owner nSearch
 * @sourceTemplate /src/service/common.js
 * @override This file is consumed by build generators and is not loaded into
 * SERVICE directly. Project modules override generated `*Service.js` artifacts
 * or contribute same-name service files through `src/service/**`.
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

    /**

     * Retrieves search model information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    getSearchModel: function (request) {
        let moduleName = request.moduleName || 'mdulnm';
        request.schemaModel = NODICS.getModels(moduleName, request.tenant).mdlnm;
        request.moduleName = moduleName;
        request.indexName = request.indexName ? request.indexName : request.schemaModel.indexName;
        if (!request.tenant || !request.indexName) {
            throw new CLASSES.SearchError('ERR_SRCH_00003', 'Invalid request or search is not active for this type');
        } else {
            return NODICS.getSearchModel(moduleName, request.tenant, request.indexName);
        }
    },

    /**

     * Executes do refresh behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doRefresh: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doRefreshIndexInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },

    /**

     * Executes do check health behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doCheckHealth: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doHealthCheckClusterInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },

    /**

     * Executes do exists behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doExists: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doExistModelInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },

    /**

     * Executes do get behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doGet: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doGetModelsInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },

    /**

     * Executes do search behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doSearch: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doSearchModelInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },

    /**

     * Executes do save behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doSave: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doSaveModelsInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },


    /**


     * Executes do bulk behavior.


     *


     * @param {*} request Method input.


     * @returns {*} Method result.


     */


    doBulk: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doBulkModelInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },

    /**

     * Executes do remove behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doRemove: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doRemoveModelsInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },

    /**

     * Executes do remove by query behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doRemoveByQuery: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doRemoveModelsByQueryInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },

    /**

     * Executes do get schema behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doGetSchema: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doGetSchemaModelInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },

    /**

     * Executes do update schema behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doUpdateSchema: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doUpdateSchemaModelInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },

    /**

     * Executes do remove index behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doRemoveIndex: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doRemoveIndexInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },

    /**

     * Executes do indexing behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doIndexing: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultIndexerService.prepareIndexer(request);
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },
};
