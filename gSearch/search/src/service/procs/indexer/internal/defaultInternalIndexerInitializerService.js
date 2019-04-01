/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');

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

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating internal indexer request');
        if (!request.indexerConfig) {
            process.error(request, response, {
                success: false,
                code: 'ERR_SRCH_00003'
            });
        } else if (!request.indexerConfig.target || !request.indexerConfig.target.indexName) {
            process.error(request, response, {
                success: false,
                code: 'ERR_SRCH_00000',
                msg: 'Target configuration within indexer configuration is not valid. Please add indexName'
            });
        } else if (!request.indexerConfig.schema || !request.indexerConfig.schema.name || !request.indexerConfig.schema.moduleName) {
            process.error(request, response, {
                success: false,
                code: 'ERR_SRCH_00000',
                msg: 'Schema configuration within indexer configuration is not valid. Please add schema name and moduleName'
            });
        } else if (request.indexerConfig.state === ENUMS.IndexerState.RUNNING.key) {
            process.error(request, response, {
                success: false,
                code: 'ERR_SRCH_00000',
                msg: 'Currently indexer: ' + request.indexerConfig.code + ' is on RUNNING state'
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    changeIndexerState: function (request, response, process) {
        this.LOG.debug('Changing state of current indexer: ' + request.indexerConfig.code);
        let indexerConfig = request.indexerConfig;
        indexerConfig.state = ENUMS.IndexerState.RUNNING.key;
        indexerConfig.startTime = new Date();
        SERVICE.DefaultIndexerService.save({
            tenant: request.tenant,
            model: indexerConfig
        }).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, {
                success: false,
                code: 'ERR_SRCH_00006',
                error: error
            });
        });
    },

    buildOptions: function (request, response, process) {
        this.LOG.debug('Building options for internal indexer');
        //request.options = _.merge({}, request.indexerConfig.schema.queryOptions || {});
        process.nextSuccess(request, response);
    },

    triggerIndex: function (request, response, process) {
        this.LOG.debug('Triggering index process');
        SERVICE.DefaultPipelineService.start('internalIndexerProcessPipeline', request, {}).then(success => {
            response.targetNode = 'handleSuccess';
            process.nextSuccess(request, response);
        }).catch(error => {
            response.errors.push(error);
            response.targetNode = 'handleError';
            process.nextSuccess(request, response);
        });

    },

    successHandler: function (request, response, process) {
        this.LOG.debug('Updating indexer successfully completed state');
        let indexerConfig = request.indexerConfig;
        indexerConfig.state = ENUMS.IndexerState.SUCCESS.key;
        indexerConfig.endTime = new Date();
        indexerConfig.lastErrorLog = [];
        SERVICE.DefaultIndexerService.save({
            tenant: request.tenant,
            model: indexerConfig
        }).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, {
                success: false,
                code: 'ERR_SRCH_00006',
                error: error
            });
        });
    },

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
            process.error(request, response, {
                success: false,
                code: 'ERR_SRCH_00006',
                error: error
            });
        });
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        response.success.msg = SERVICE.DefaultStatusService.get(response.success.code || 'SUC_SYS_00000').message;
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        if (response.errors && response.errors.length === 1) {
            process.reject(response.errors[0]);
        } else if (response.errors && response.errors.length > 1) {
            process.reject({
                success: false,
                code: 'ERR_SYS_00000',
                error: response.errors
            });
        } else {
            process.reject(response.error);
        }
    }
};