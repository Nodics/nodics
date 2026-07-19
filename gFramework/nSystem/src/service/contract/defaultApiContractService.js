/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const fs = require('fs');
const path = require('path');
const swaggerUiDist = require('swagger-ui-dist');

const SWAGGER_ASSET_CONTENT_TYPES = {
    'swagger-ui.css': 'text/css; charset=utf-8',
    'swagger-ui-bundle.js': 'application/javascript; charset=utf-8',
    'swagger-ui-standalone-preset.js': 'application/javascript; charset=utf-8',
    'favicon-16x16.png': 'image/png',
    'favicon-32x32.png': 'image/png'
};

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
                        if (error.code === 'ENOENT') {
                            try {
                                let runtimeContract = this.buildRuntimeOpenApiContract();
                                resolve({
                                    code: 'SUC_SYS_00001',
                                    data: runtimeContract,
                                    metadata: {
                                        contractType: 'openapi',
                                        contentType: 'application/json; charset=utf-8',
                                        rawResponse: true,
                                        moduleName: contractContext.moduleName,
                                        artifactPath: 'runtime-effective'
                                    }
                                });
                                return;
                            } catch (runtimeError) {
                                reject(this.enrichError(runtimeError, contractContext, 'Runtime OpenAPI contract could not be built'));
                                return;
                            }
                        }
                        reject(this.enrichError(error, contractContext, 'OpenAPI contract file could not be read'));
                        return;
                    }
                    try {
                        resolve({
                            code: 'SUC_SYS_00001',
                            data: JSON.parse(contents),
                            metadata: {
                                contractType: 'openapi',
                                contentType: 'application/json; charset=utf-8',
                                rawResponse: true,
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

    /** Builds the same governed OpenAPI document from already-loaded effective runtime schemas and routers when no generated file is present. */
    buildRuntimeOpenApiContract: function () {
        let generator = SERVICE.DefaultOpenapiContractGeneratorService;
        let routerConfiguration = SERVICE.DefaultRouterConfigurationService;
        let databaseConfiguration = SERVICE.DefaultDatabaseConfigurationService;
        if (!generator || !routerConfiguration || !databaseConfiguration || typeof generator.createDocument !== 'function') {
            throw new Error('Effective runtime OpenAPI services are unavailable');
        }
        return generator.createDocument({
            rawRouters: routerConfiguration.getRawRouters(),
            rawSchema: databaseConfiguration.getRawSchema(),
            options: { includeRuntimeSchemas: true },
            warnings: []
        });
    },

    /**
     * Returns a self-hosted Swagger UI page for the active runtime OpenAPI contract.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Promise resolving to a text response envelope.
     */
    getSwaggerUi: function (request) {
        return new Promise((resolve) => {
            resolve({
                code: 'SUC_SYS_00002',
                data: this.buildSwaggerUiHtml({
                    openApiUrl: 'openapi',
                    assetBaseUrl: 'swagger/asset'
                }),
                metadata: {
                    contentType: 'text/html; charset=utf-8',
                    contractType: 'swagger-ui'
                }
            });
        });
    },

    /**
     * Returns an allowed Swagger UI asset from the governed local package.
     *
     * @param {Object} request Nodics request context with `assetName` route parameter.
     * @returns {Promise<Object>} Promise resolving to a text or binary response envelope.
     */
    getSwaggerAsset: function (request) {
        return new Promise((resolve, reject) => {
            let assetName = this.getSwaggerAssetName(request);
            if (!this.isAllowedSwaggerAsset(assetName)) {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Swagger asset is not allowed'));
                return;
            }

            let assetPath = this.resolveSwaggerAssetPath(assetName);
            fs.readFile(assetPath, (error, contents) => {
                if (error) {
                    reject(this.enrichError(error, {
                        contractType: 'swagger-ui',
                        filePath: assetPath
                    }, 'Swagger UI asset could not be read'));
                    return;
                }
                resolve({
                    code: 'SUC_SYS_00003',
                    data: contents,
                    metadata: {
                        contentType: SWAGGER_ASSET_CONTENT_TYPES[assetName],
                        contractType: 'swagger-ui',
                        assetName: assetName
                    }
                });
            });
        });
    },

    /**
     * Builds the Swagger UI HTML shell.
     *
     * @param {Object} options Swagger UI rendering options.
     * @returns {string} HTML document.
     */
    buildSwaggerUiHtml: function (options) {
        return [
            '<!doctype html>',
            '<html lang="en">',
            '<head>',
            '  <meta charset="utf-8">',
            '  <title>Nodics API Documentation</title>',
            '  <meta name="viewport" content="width=device-width, initial-scale=1">',
            '  <link rel="icon" type="image/png" href="' + options.assetBaseUrl + '/favicon-32x32.png">',
            '  <link rel="stylesheet" href="' + options.assetBaseUrl + '/swagger-ui.css">',
            '  <style>',
            '    body { margin: 0; background: #ffffff; }',
            '    .topbar { display: none; }',
            '    .swagger-ui .info { margin: 32px 0 24px; }',
            '  </style>',
            '</head>',
            '<body>',
            '  <div id="swagger-ui"></div>',
            '  <script src="' + options.assetBaseUrl + '/swagger-ui-bundle.js"></script>',
            '  <script src="' + options.assetBaseUrl + '/swagger-ui-standalone-preset.js"></script>',
            '  <script>',
            '    window.onload = function () {',
            '      window.ui = SwaggerUIBundle({',
            '        url: "' + options.openApiUrl + '",',
            '        dom_id: "#swagger-ui",',
            '        deepLinking: true,',
            '        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],',
            '        plugins: [SwaggerUIBundle.plugins.DownloadUrl],',
            '        layout: "StandaloneLayout",',
            '        displayRequestDuration: true',
            '      });',
            '    };',
            '  </script>',
            '</body>',
            '</html>'
        ].join('\n');
    },

    /**
     * Extracts the requested Swagger asset name from the Nodics request.
     *
     * @param {Object} request Nodics request context.
     * @returns {string|undefined} Requested asset file name.
     */
    getSwaggerAssetName: function (request) {
        return request && request.httpRequest && request.httpRequest.params && request.httpRequest.params.assetName;
    },

    /**
     * Checks whether the requested Swagger asset is explicitly allowed.
     *
     * @param {string} assetName Requested asset file name.
     * @returns {boolean} True when the asset may be served.
     */
    isAllowedSwaggerAsset: function (assetName) {
        return Object.prototype.hasOwnProperty.call(SWAGGER_ASSET_CONTENT_TYPES, assetName);
    },

    /**
     * Resolves a Swagger asset to the installed package directory.
     *
     * @param {string} assetName Allowed Swagger asset file name.
     * @returns {string} Absolute asset path.
     * @throws {CLASSES.NodicsError} When the resolved asset escapes the package directory.
     */
    resolveSwaggerAssetPath: function (assetName) {
        let swaggerAssetRoot = path.resolve(swaggerUiDist.absolutePath());
        let assetPath = path.resolve(swaggerAssetRoot, assetName);
        if (assetPath.indexOf(swaggerAssetRoot + path.sep) !== 0) {
            throw new CLASSES.NodicsError('ERR_SYS_00001', 'Resolved Swagger asset path is outside the Swagger package');
        }
        return assetPath;
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
