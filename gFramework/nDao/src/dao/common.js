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

    get: function (request) {
        request.collection = NODICS.getModels('mdulnm', request.tenant).mdlnm;
        request.moduleName = request.moduleName || request.collection.moduleName;
        return SERVICE.DefaultPipelineService.start('modelsGetInitializerPipeline', request, {});
    },

    getById: function (id, tenant) {
        return this.get({
            tenant: tenant,
            query: {
                _id: id
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
            ids: ids
        });
    },

    removeByCode: function (codes, tenant) {
        return this.remove({
            tenant: tenant,
            codes: codes
        });
    },

    update: function (request) {
        request.collection = NODICS.getModels('mdulnm', request.tenant).mdlnm;
        request.moduleName = request.moduleName || request.collection.moduleName;
        return SERVICE.DefaultPipelineService.start('modelsUpdateInitializerPipeline', request, {});
    }
};