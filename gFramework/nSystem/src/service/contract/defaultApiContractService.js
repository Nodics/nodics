/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const fs = require('fs');
const path = require('path');

/**
 * @module system/service/DefaultApiContractService
 * @description Resolves generated API contract artifacts from the active server module while preserving node-specific contract identity.
 * @layer service
 * @owner system
 * @override Project modules may override this service to change contract
 * artifact location, filtering, versioning, or response metadata while
 * preserving the controller and facade contract.
 *
 * @property {Object} NODICS Runtime module hierarchy accessor used to resolve
 * active server and node paths.
 * @property {Object} CLASSES.NodicsError Standard Nodics error type used for
 * failure context.
 */
module.exports = {

    /**
     * Initializes the API contract service during entity loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when service initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the API contract service after entity loading.
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
     * Returns the generated OpenAPI contract for the active server or node target.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Promise resolving to the Nodics response envelope.
     * @throws {CLASSES.NodicsError} When runtime context, contract file, or JSON
     * parsing fails.
     */
    getOpenApiContract: function (request) {
        return new Promise((resolve, reject) => {
            let contractContext;
            try {
                contractContext = this.resolveOpenApiContractContext();
                fs.readFile(contractContext.filePath, 'utf8', (error, contents) => {
                    if (error) {
                        reject(this.enrichError(error, contractContext, 'OpenAPI contract file could not be read'));
                        return;
                    }
                    try {
                        resolve({
                            code: 'SUC_SYS_00001',
                            data: JSON.parse(contents),
                            metadata: {
                                contractType: 'openapi',
                                moduleName: contractContext.moduleName,
                                artifactPath: this.getPublicArtifactPath(contractContext)
                            }
                        });
                    } catch (parseError) {
                        reject(this.enrichError(parseError, contractContext, 'OpenAPI contract file contains invalid JSON'));
                    }
                });
            } catch (error) {
                reject(this.enrichError(error, contractContext, 'OpenAPI contract resolution failed'));
            }
        });
    },

    /**
     * Resolves the active OpenAPI contract location from the server-owned generated directory.
     *
     * @returns {Object} Contract resolution context.
     * @throws {CLASSES.NodicsError} When active runtime context is missing or unsafe.
     */
    resolveOpenApiContractContext: function () {
        let moduleName = this.getActiveModuleName();
        let modulePath = this.getServerModulePath();
        if (!moduleName || !modulePath) {
            throw new CLASSES.NodicsError('ERR_SYS_00001', 'Active server context is required to resolve OpenAPI contract');
        }

        let resolvedModulePath = path.resolve(modulePath);
        let filePath = path.resolve(resolvedModulePath, 'generated', 'openapi', moduleName + '.openapi.json');
        if (filePath.indexOf(resolvedModulePath + path.sep) !== 0) {
            throw new CLASSES.NodicsError('ERR_SYS_00001', 'Resolved OpenAPI contract path is outside active module');
        }

        return {
            contractType: 'openapi',
            moduleName: moduleName,
            modulePath: resolvedModulePath,
            filePath: filePath
        };
    },

    /**
     * Returns the active node name when present, otherwise the active server name.
     *
     * @returns {string|undefined} Active contract owner module name.
     */
    getActiveModuleName: function () {
        return (NODICS.getNodeName && NODICS.getNodeName()) ||
            (NODICS.getServerName && NODICS.getServerName());
    },

    /**
     * Returns the server path that owns generated runtime reports.
     *
     * @returns {string|undefined} Active contract owner module path.
     */
    getServerModulePath: function () {
        return NODICS.getServerPath && NODICS.getServerPath();
    },

    /**
     * Returns a safe, module-owned artifact path for API responses.
     *
     * @param {Object} contractContext Contract resolution context.
     * @returns {string} Relative generated artifact path.
     */
    getPublicArtifactPath: function (contractContext) {
        if (!contractContext || !contractContext.filePath) {
            return undefined;
        }
        if (NODICS.getNodicsHome && NODICS.getNodicsHome()) {
            return path.relative(NODICS.getNodicsHome(), contractContext.filePath);
        }
        return path.join(contractContext.moduleName, 'generated', 'openapi', contractContext.moduleName + '.openapi.json');
    },

    /**
     * Enriches errors with API contract resolution context.
     *
     * @param {Error|Object|string} error Error to normalize.
     * @param {Object} contractContext Contract resolution context.
     * @param {string} message Additional failure message.
     * @returns {CLASSES.NodicsError} Enriched Nodics error.
     */
    enrichError: function (error, contractContext, message) {
        let normalizedError = error;
        if (error instanceof Error && (!error.code || String(error.code).indexOf('ERR_') !== 0)) {
            normalizedError = new CLASSES.NodicsError(error.message, null, 'ERR_SYS_00000');
            normalizedError.addCause(error);
        }
        return CLASSES.NodicsError.enrich(normalizedError, {
            layer: 'service',
            service: 'DefaultApiContractService',
            operation: 'getOpenApiContract',
            contractType: contractContext && contractContext.contractType,
            moduleName: contractContext && contractContext.moduleName,
            modulePath: contractContext && contractContext.modulePath,
            filePath: contractContext && contractContext.filePath
        }, 'ERR_SYS_00000', message);
    }
};
