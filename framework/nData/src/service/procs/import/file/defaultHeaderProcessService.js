/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');


module.exports = {

    validateHeader: function (request, response, process) {
        this.LOG.debug('Validating Header: ', request.headerName, ' for processing');
        process.nextSuccess(request, response);
    },

    evaluateHeaderOptions: function (request, response, process) {
        this.LOG.debug('Evaluating header options');
        process.nextSuccess(request, response);
    },

    evaluateHeaderRules: function (request, response, process) {
        this.LOG.debug('Evaluating header rules');
        process.nextSuccess(request, response);
    },

    evaluateHeaderMacros: function (request, response, process) {
        this.LOG.debug('Evaluating header macros');
        process.nextSuccess(request, response);
    },

    loadRawSchema: function (request, response, process) {
        this.LOG.debug('Loading raw schema for header');
        process.nextSuccess(request, response);
    },

    loadModels: function (request, response, process) {
        this.LOG.debug('Loading all required models');
        process.nextSuccess(request, response);
    },

    processHeaderFiles: function (request, response, process) {
        this.LOG.debug('Triggering process to import all files for header');
        /*
            request.phase = options.phase;
            request.importType = options.importType;
            request.headerName = options.headerName;
            let header = request[options.importType].headers[options.headerName];
            header.done = true;
        */

        try {
            let header = request[request.importType].headers[request.headerName];
            if (!UTILS.isBlank(header.dataFiles)) {
                this.processAllFiles(request, response, {
                    pendingFileList: Object.keys(header.dataFiles)
                }).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    console.log('1: ', error);
                    process.nextSuccess(request, response);
                });
            } else {
                this.LOG.debug('There is no data to import for header : ' + request.headerName);
                process.nextSuccess(request, response);
            }
        } catch (error) {
            response.success = false;
            delete response.result;
            delete response.msg;
            delete response.code;
            response.errors.PROC_ERR_0003 = {
                code: 'ERR003',
                msg: error
            };
            process.nextFailure(request, response);
        }
    },

    processAllFiles: function (request, response, options) {
        let _self = this;
        let header = request[request.importType].headers[request.headerName];
        return new Promise((resolve, reject) => {
            if (options.pendingFileList && options.pendingFileList.length > 0) {
                let fileName = options.pendingFileList.shift(); //Actual Files group name
                _self.LOG.debug('Processing file: ', fileName, ' from header: ', request.headerName);
                request.fileName = fileName;
                _self.processFile(request, response).then(success => {
                    _self.processAllFiles(request, response, options).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } else {
                _self.LOG.debug('Done import for files for header : ', request.headerName);
                //console.log(request.headerName, '    ---------    done', )
                header.done = true;
                resolve(true);
            }
        });
    },

    processFile: function (request, response) {
        let header = request[request.importType].headers[request.headerName];
        return new Promise((resolve, reject) => {
            let fileObj = header.dataFiles[request.fileName];
            let fileTypePipeline = CONFIG.get('targetPipelineForFileType')[fileObj.type];
            response[fileTypePipeline] = {
                promise: {
                    resolve: resolve,
                    reject: reject
                }
            };
            SERVICE.PipelineService.startPipeline(fileTypePipeline, request, response);
            /*  
             request.phase = options.phase;
             request.importType = options.importType;
             request.headerName = options.headerName;
             SERVICE.PipelineService.startPipeline('processHeaderPipeline', request, response);
            // options.filename Actual Files group name

            if (request.fileName === 'defaultEmployeeData' && request.phase < 4) {
                reject('-------------------reject');
            } else {
                resolve(true);
            }*/
        });
    },

    handleSucessEnd: function (request, response) {
        this.LOG.debug('Header Process Request has been processed successfully');
        response.headerProcessPipeline.promise.resolve(response);
    },

    handleFailureEnd: function (request, response) {
        this.LOG.debug('Header Process Request has been processed with some failures : ');
        response.headerProcessPipeline.promise.reject(response);
    },

    handleErrorEnd: function (request, response) {
        this.LOG.debug('Header Process Request has been processed and got errors : ');
        response.headerProcessPipeline.promise.reject(response);
    }
};