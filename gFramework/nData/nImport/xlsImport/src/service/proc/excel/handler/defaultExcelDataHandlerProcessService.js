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
        if (!request.dataObject) {
            process.error(request, response, 'Invalid data object to process');
        } else {
            process.nextSuccess(request, response);
        }
    },

    executeDataProcessor: function (request, response, process) {
        this.LOG.debug('Applying pre processors in models');
        let moduleName = request.moduleName || request.collection.moduleName;
        let modelName = request.collection.modelName;
        let interceptors = SERVICE.DefaultDataConfigurationService.getImportInterceptors(moduleName, modelName);
        if (interceptors && interceptors.importProcessor && interceptors.importProcessor.length > 0) {
            let interceptorRequest = {
                dataObject: request.dataObject
            };
            let interceptorResponse = {};
            SERVICE.DefaultInterceptorHandlerService.executeProcessorInterceptors([].concat(interceptors.importProcessor), interceptorRequest, interceptorResponse).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_SAVE_00005',
                    error: error
                });
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    processData: function (request, response, process) {
        this.LOG.debug('Checking target process to handle request');
        let processPipeline = 'defaultDataFinalizerProcessPipeline';
        if (request.header.options && request.header.options.processPipeline) {
            processPipeline = request.header.options.processPipeline;
        }
        SERVICE.DefaultPipelineService.start(processPipeline, {
            header: request.header,
            dataObject: request.dataObject,
            outputPath: outputPath
        }, {}).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    writeDataFile: function (request, response, process) {
        this.LOG.debug('Staring file write process for local data import');
        SERVICE.DefaultPipelineService.start('writeDataIntoFileInitializerPipeline', {
            header: request.header,
            dataObject: request.dataObject,
            outputPath: outputPath
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
        this.LOG.debug('Request has been processed and got errors');
        if (response.errors && response.errors.length === 1) {
            process.reject(response.errors[0]);
        } else if (response.errors && response.errors.length > 1) {
            process.reject({
                success: false,
                code: 'ERR_SYS_00000',
                error: esponse.errors
            });
        } else {
            process.reject(response.error);
        }
    }
};