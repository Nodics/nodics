/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gFramework/nSearch/search/src/service/procs/indexer/defaultIndexerInitializerService
 * @description Implements nSearch default indexer initializer service business behavior and extension logic.
 * @layer service
 * @owner nSearch
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

     * Validates request rules.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating indexer request');
        if (request.indexerConfig.state === ENUMS.IndexerState.RUNNING.key) {
            process.error(request, response, new CLASSES.SearchError('ERR_SRCH_00003', 'Currently indexer: ' + request.indexerConfig.code + ' is on RUNNING state'));
        } else if (!request.moduleName) {
            process.error(request, response, new CLASSES.SearchError('ERR_SRCH_00003', 'Invalid module name'));
        } else if (!request.indexerConfig) {
            process.error(request, response, new CLASSES.SearchError('ERR_SRCH_00003', 'Invalid indexer configuration found'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**

     * Executes change indexer state behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    changeIndexerState: function (request, response, process) {
        this.LOG.debug('Changing state of current indexer: ' + request.indexerConfig.code);
        let indexerConfig = request.indexerConfig;
        indexerConfig.lastSuccessTime = indexerConfig.lastSuccessTime;
        indexerConfig.state = ENUMS.IndexerState.RUNNING.key;
        indexerConfig.startTime = new Date();
        SERVICE.DefaultIndexerService.save({
            tenant: request.tenant,
            model: indexerConfig
        }).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, new CLASSES.SearchError(error, null, 'ERR_SRCH_00014'));
        });
    },

    /**

     * Builds options data.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    buildOptions: function (request, response, process) {
        this.LOG.debug('Building options for indexer');
        let error = null;
        try {
            let indexerConfig = request.indexerConfig;
            if (indexerConfig.schema && !UTILS.isBlank(indexerConfig.schema)) {
                request.source = {
                    schemaName: indexerConfig.schema.name,
                    moduleName: indexerConfig.schema.moduleName || request.moduleName,
                    tenant: request.tenant
                };
                request.schemaModel = NODICS.getModels(request.source.moduleName, request.source.tenant)[request.source.schemaName.toUpperCaseFirstChar() + 'Model'];
                if (!request.schemaModel) {
                    throw new CLASSES.SearchError('Invalid schema name: ' + request.source.schemaName + ' within indexer configuration');
                }
                request.schemaService = SERVICE['Default' + request.source.schemaName.toUpperCaseFirstChar() + 'Service'];
                if (!request.schemaService) {
                    throw new CLASSES.SearchError('Invalid schema service name: ' + request.source.schemaName + ' within indexer configuration');
                }
            } else if (indexerConfig.path && !UTILS.isBlank(indexerConfig.path)) {
                request.source = {
                    rootPath: indexerConfig.path.rootPath,
                    successPath: indexerConfig.path.successPath,
                    errorPath: indexerConfig.path.errorPath
                };
            }
            if (indexerConfig.target) {
                request.target = {
                    indexName: indexerConfig.target.indexName || request.indexName,
                    typeName: indexerConfig.target.typeName || indexerConfig.target.indexName || request.indexName,
                    moduleName: indexerConfig.target.moduleName || request.moduleName
                };
                let tempRootPath = NODICS.getServerPath() + '/' + CONFIG.get('data').dataDirName + '/import/search';
                if (indexerConfig.target.tempRootPath) {
                    tempRootPath = indexerConfig.target.tempRootPath;
                }
                request.target.rootPath = tempRootPath;
                request.target.dataPath = tempRootPath + '/' + request.target.indexName;
                request.target.successPath = indexerConfig.target.successPath || tempRootPath + '/success';
                request.target.errorPath = indexerConfig.target.errorPath || tempRootPath + '/error';
                request.searchModel = NODICS.getSearchModel(request.moduleName, request.tenant, request.target.indexName);
                if (!request.searchModel) {
                    throw new CLASSES.SearchError('Invalid index name: ' + request.target.indexName + ' within indexer configuration');
                }
                if (request.target.indexName) {
                    request.searchService = SERVICE['Default' + request.target.indexName.toUpperCaseFirstChar() + 'Service'] || SERVICE.DefaultSearchService;
                } else {
                    request.searchService = SERVICE.DefaultSearchService;
                }
            } else {
                throw new CLASSES.SearchError('Target object within indexer can not be null or empty');
            }
        } catch (err) {
            error = new CLASSES.SearchError(err, null, 'ERR_SRCH_00015');
        }
        if (error) {
            process.error(request, response, error);
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**

     * Processes index behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    triggerIndex: function (request, response, process) {
        this.LOG.debug('Triggering index process');
        if (request.indexerConfig.schema && !UTILS.isBlank(request.indexerConfig.schema)) {
            response.targetNode = 'internalIndexerInitializer';
            process.nextSuccess(request, response);
        } else if (request.indexerConfig.path && !UTILS.isBlank(request.indexerConfig.path)) {
            response.targetNode = 'externalIndexerInitializer';
            process.nextSuccess(request, response);
        } else {
            process.error(request, response, new CLASSES.SearchError('ERR_SRCH_00000', 'Invalid type value in indexer: ' + request.indexerConfig.type));
        }
    },

    /**

     * Executes success handler behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    successHandler: function (request, response, process) {
        this.LOG.debug('Updating indexer successfully completed state');
        let indexerConfig = request.indexerConfig;
        indexerConfig.state = ENUMS.IndexerState.SUCCESS.key;
        indexerConfig.endTime = new Date();
        indexerConfig.lastSuccessTime = indexerConfig.startTime;
        indexerConfig.lastErrorLog = [];
        SERVICE.DefaultIndexerService.save({
            tenant: request.tenant,
            model: indexerConfig
        }).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, new CLASSES.SearchError(error, null, 'ERR_SRCH_00000'));
        });
    },

    /**

     * Executes error handler behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    errorHandler: function (request, response, process) {
        this.LOG.debug('Updating indexer completed with error state');
        let indexerConfig = request.indexerConfig;
        indexerConfig.state = ENUMS.IndexerState.ERROR.key;
        indexerConfig.endTime = new Date();
        if (response.errors && response.errors.length > 0) {
            indexerConfig.lastErrorLog = response.errors;
        } else {
            indexerConfig.lastErrorLog = [response.error];
        }
        SERVICE.DefaultIndexerService.save({
            tenant: request.tenant,
            model: indexerConfig
        }).then(success => {
            process.error(request, response);
        }).catch(error => {
            process.error(request, response, new CLASSES.SearchError(error, null, 'ERR_SRCH_00000'));
        });
    }
};