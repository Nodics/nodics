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

    validateHeader: function (request, response, process) {
        this.LOG.debug('Validating Header: ', request.headerName, ' for processing');
        process.nextSuccess(request, response);
    },

    evaluateHeaderOptions: function (request, response, process) {
        this.LOG.debug('Evaluating header options');
        process.nextSuccess(request, response);
    },

    evaluateHeaderQuery: function (request, response, process) {
        this.LOG.debug('Evaluating header rules');
        process.nextSuccess(request, response);
    },

    evaluateHeaderMacros: function (request, response, process) {
        this.LOG.debug('Evaluating header macros');
        process.nextSuccess(request, response);
    },

    loadRawSchema: function (request, response, process) {
        this.LOG.debug('Loading raw schema for header');
        let header = request[request.importType].headers[request.headerName].header;
        header.rawSchema = NODICS.getModule(header.options.moduleName).rawSchema[header.options.modelName];
        process.nextSuccess(request, response);
    },

    loadModels: function (request, response, process) {
        this.LOG.debug('Loading all required models');
        process.nextSuccess(request, response);
    },

    processHeaderFiles: function (request, response, process) {
        this.LOG.debug('Triggering process to import all files for header');
        try {
            let header = request[request.importType].headers[request.headerName];
            if (!UTILS.isBlank(header.dataFiles)) {
                this.processAllFiles(request, response, {
                    pendingFileList: Object.keys(header.dataFiles)
                }).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    if (error && UTILS.isArray(error)) {
                        error.forEach(element => {
                            response.errors.push(element);
                        });
                    } else {
                        response.errors.push(error);
                    }
                    process.nextSuccess(request, response);
                });
            } else {
                this.LOG.debug('There is no data to import for header : ' + request.headerName);
                process.nextSuccess(request, response);
            }
        } catch (error) {
            process.error(request, response, error);
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
                let fileObj = header.dataFiles[request.fileName];
                let fileTypePipeline = CONFIG.get('targetPipelineForFileType')[fileObj.type];
                SERVICE.DefaultPipelineService.start(fileTypePipeline, request, {}).then(success => {
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
                header.done = true;
                resolve(true);
            }
        });
    },

    handleSucessEnd: function (request, response, process) {
        if (response.errors.length > 0) {
            this.LOG.error('Header Process Request has been processed and got errors');
            process.reject(response.errors);
        } else {
            this.LOG.debug('Header Process Request has been processed successfully');
            process.resolve(response.success);
        }
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Header Process Request has been processed and got errors');
        process.reject(response.errors);
    }
};