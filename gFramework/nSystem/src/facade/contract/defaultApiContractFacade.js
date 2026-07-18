/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module system/facade/DefaultApiContractFacade
 * @description Facade for system API contract operations. It keeps controller
 * routing separate from contract resolution so projects can override policy at
 * the facade layer.
 * @layer facade
 * @owner system
 * @override Project modules may override this facade to redact, enrich, or
 * route contract responses differently while preserving the service contract.
 *
 * @property {Object} SERVICE.DefaultApiContractService Service that resolves
 * generated contract artifacts.
 */
module.exports = {

    /**
     * Initializes the API contract facade during entity loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when facade initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the API contract facade after entity loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Returns the generated OpenAPI contract for the active server or node.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Promise resolving to a Nodics response envelope.
     */
    getOpenApiContract: function (request) {
        return SERVICE.DefaultApiContractService.getOpenApiContract(request);
    },

    /**
     * Returns the Swagger UI HTML page for the active OpenAPI contract.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Promise resolving to a textual Nodics response envelope.
     */
    getSwaggerUi: function (request) {
        return SERVICE.DefaultApiContractService.getSwaggerUi(request);
    },

    /**
     * Returns a governed Swagger UI static asset.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Promise resolving to a textual Nodics response envelope.
     */
    getSwaggerAsset: function (request) {
        return SERVICE.DefaultApiContractService.getSwaggerAsset(request);
    }
};
