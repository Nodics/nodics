/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nDynamo/src/service/pipeline/defaultSchemaDeActivatedPipelineService
 * @description Implements nDynamo default schema de activated pipeline service business behavior and extension logic.
 * @layer service
 * @owner nDynamo
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
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

     * Validates schema rules.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    validateSchema: function (request, response, process) {
        this.LOG.debug('Validating request for schema : ' + request.runtimeSchema.code);
        process.nextSuccess(request, response);
    },

    /**

     * Executes deactivate raw schema behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    deactivateRawSchema: function (request, response, process) {
        this.LOG.debug('Validating request for schema : ' + request.runtimeSchema.code);
        let runtimeSchema = request.runtimeSchema;
        let rawSchema = SERVICE.DefaultDatabaseConfigurationService.getRawSchema();
        if (rawSchema[runtimeSchema.moduleName] && rawSchema[runtimeSchema.moduleName][runtimeSchema.code]) {
            delete rawSchema[runtimeSchema.moduleName][runtimeSchema.code];
        }
        process.nextSuccess(request, response);
    },

    /**

     * Removes or clears models information.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    removeModels: function (request, response, process) {
        this.LOG.debug('Validating request for schema : ' + request.runtimeSchema.code);
        let runtimeSchema = request.runtimeSchema;
        SERVICE.DefaultDatabaseModelHandlerService.removeModelFromModule(runtimeSchema.moduleName, runtimeSchema.code);
        process.nextSuccess(request, response);
    },

    /**

     * Removes or clears search models information.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    removeSearchModels: function (request, response, process) {
        this.LOG.debug('Validating request for schema : ' + request.runtimeSchema.code);
        let runtimeSchema = request.runtimeSchema;
        let indexName = runtimeSchema.indexName || runtimeSchema.typeName || runtimeSchema.code;
        SERVICE.DefaultSearchModelHandlerService.removeSearchModelFromModule(runtimeSchema.moduleName, indexName);
        process.nextSuccess(request, response);
    }
};