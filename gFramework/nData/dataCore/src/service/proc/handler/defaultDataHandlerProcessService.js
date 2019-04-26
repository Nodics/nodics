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

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating request to process JSON file');
        if (!request.models) {
            process.error(request, response, 'Invalid data object to process');
        } else {
            process.nextSuccess(request, response);
        }
    },

    executeDataProcessor: function (request, response, process) {
        this.LOG.debug('Applying pre processors in models');
        let moduleName = request.header.options.moduleName;
        let schemaName = request.header.options.schemaName;
        let interceptors = SERVICE.DefaultDataConfigurationService.getImportInterceptors(moduleName, schemaName);
        if (interceptors && interceptors.importProcessor && interceptors.importProcessor.length > 0) {
            SERVICE.DefaultProcessorHandlerService.executeProcessors(
                [].concat(interceptors.importProcessor), {
                    models: request.models
                }, {}).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
        } else {
            process.nextSuccess(request, response);
        }
    },

    processData: function (request, response, process) {
        this.LOG.debug('Checking target process to handle request');
        let processPipeline = 'defaultImportDataFilterPipeline';
        if (request.header.options && request.header.options.processPipeline) {
            processPipeline = request.header.options.processPipeline;
        }
        SERVICE.DefaultPipelineService.start(processPipeline, {
            header: request.header,
            models: request.models,
            outputPath: request.outputPath
        }, {}).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    writeDataFile: function (request, response, process) {
        this.LOG.debug('Starting file write process for local data import');
        SERVICE.DefaultPipelineService.start('writeDataIntoFileInitializerPipeline', {
            header: request.header,
            models: request.models,
            outputPath: request.outputPath
        }, {}).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    handleSucessEnd: function (request, response, process) {
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