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

    //This request will have dataObject and header and outputPath
    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating request to finalize local data import');
        if (request.dataObject && request.dataObject instanceof Array && request.dataObject.length > 0) {
            request.outputPath.version = '0';
            process.nextSuccess(request, response);
        } else {
            process.error(request, response, 'Please validate request. data formate is not supported');
        }
    },

    executeDataProcessor: function (request, response, process) {
        this.LOG.debug('Applying pre processors in models');
        let moduleName = request.header.options.moduleName;
        let modelName = request.header.options.modelName;
        modelName = modelName.toUpperCaseFirstChar() + 'Model';
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
        let processPipeline = 'defaultFinalizerDataFilterPipeline';
        if (request.header.options && request.header.options.processPipeline) {
            processPipeline = request.header.options.processPipeline;
        }
        SERVICE.DefaultPipelineService.start(processPipeline, {
            header: request.header,
            dataObject: request.dataObject,
            outputPath: request.outputPath
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
            outputPath: request.outputPath
        }, {}).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
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