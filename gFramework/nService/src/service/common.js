/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module service/common/CommonGeneratedServiceTemplate
 * @description Template service used by generated schema services to delegate
 * common CRUD operations into the Nodics database pipelines. During generation,
 * placeholders are replaced with the owning module and model identifiers.
 * @layer template
 * @owner nService
 * @sourceTemplate /src/service/common.js
 * @override This file is consumed by build generators and is not loaded into
 * SERVICE directly. Project modules override generated `*Service.js` artifacts
 * or contribute same-name service files through `src/service/**`.
 *
 * @property {string} mdulnm Placeholder for generated module name.
 * @property {string} mdlnm Placeholder for generated model name.
 * @property {Object} SERVICE.DefaultPipelineService Executes generated CRUD pipelines.
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
     * Executes schema-driven get operation.
     *
     * @param {Object} request Generated service request.
     * @returns {Promise<Object>} Pipeline get response.
     */
    get: function (request) {
        let moduleName = request.moduleName || 'mdulnm';
        request.schemaModel = NODICS.getModels(moduleName, request.tenant).mdlnm;
        request.moduleName = moduleName;
        return SERVICE.DefaultPipelineService.start('modelsGetInitializerPipeline', request, {});
    },

    /**
     * Executes schema-driven get by id.
     *
     * @param {string} id Model id.
     * @param {string} tenant Tenant code.
     * @returns {Promise<Object>} Pipeline get response.
     */
    getById: function (id, tenant) {
        return this.get({
            tenant: tenant,
            query: {
                _id: id
            }
        });
    },

    /**
     * Executes schema-driven get by code.
     *
     * @param {string} code Model code.
     * @param {string} tenant Tenant code.
     * @returns {Promise<Object>} Pipeline get response.
     */
    getByCode: function (code, tenant) {
        return this.get({
            tenant: tenant,
            query: {
                code: code
            }
        });
    },

    /**
     * Executes schema-driven single save operation.
     *
     * @param {Object} request Generated service request.
     * @returns {Promise<Object>} Pipeline save response.
     */
    save: function (request) {
        let moduleName = request.moduleName || 'mdulnm';
        request.schemaModel = NODICS.getModels(moduleName, request.tenant).mdlnm;
        request.moduleName = moduleName;
        return SERVICE.DefaultPipelineService.start('modelSaveInitializerPipeline', request, {});
    },

    /**
     * Executes schema-driven bulk save operation.
     *
     * @param {Object} request Generated service request.
     * @returns {Promise<Object>} Pipeline bulk save response.
     */
    saveAll: function (request) {
        let moduleName = request.moduleName || 'mdulnm';
        request.schemaModel = NODICS.getModels(moduleName, request.tenant).mdlnm;
        request.moduleName = moduleName;
        return SERVICE.DefaultPipelineService.start('modelsSaveInitializerPipeline', request, {});
    },

    /**
     * Executes schema-driven remove operation.
     *
     * @param {Object} request Generated service request.
     * @returns {Promise<Object>} Pipeline remove response.
     */
    remove: function (request) {
        let moduleName = request.moduleName || 'mdulnm';
        request.schemaModel = NODICS.getModels(moduleName, request.tenant).mdlnm;
        request.moduleName = moduleName;
        return SERVICE.DefaultPipelineService.start('modelsRemoveInitializerPipeline', request, {});
    },

    /**
     * Executes schema-driven remove by ids.
     *
     * @param {string[]} ids Model ids.
     * @param {string} tenant Tenant code.
     * @returns {Promise<Object>} Pipeline remove response.
     */
    removeById: function (ids, tenant) {
        return this.remove({
            tenant: tenant,
            ids: ids
        });
    },

    /**
     * Executes schema-driven remove by codes.
     *
     * @param {string[]} codes Model codes.
     * @param {string} tenant Tenant code.
     * @returns {Promise<Object>} Pipeline remove response.
     */
    removeByCode: function (codes, tenant) {
        return this.remove({
            tenant: tenant,
            codes: codes
        });
    },

    /**
     * Executes schema-driven update operation.
     *
     * @param {Object} request Generated service request.
     * @returns {Promise<Object>} Pipeline update response.
     */
    update: function (request) {
        let moduleName = request.moduleName || 'mdulnm';
        request.schemaModel = NODICS.getModels(moduleName, request.tenant).mdlnm;
        request.moduleName = moduleName;
        return SERVICE.DefaultPipelineService.start('modelsUpdateInitializerPipeline', request, {});
    }
};
