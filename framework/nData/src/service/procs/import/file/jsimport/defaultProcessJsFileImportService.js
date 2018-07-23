/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    loadFileData: function (request, response, process) {
        this.LOG.debug('Loading data from JS file: ', request.fileName);
        let header = request[request.importType].headers[request.headerName];
        let fileObj = header.dataFiles[request.fileName];
        if (fileObj && fileObj.list && fileObj.list.length > 0) {
            let finalData = require(fileObj.list[0]);
            if (fileObj.list.length > 1) {
                for (let counter = 1; counter < fileObj.list.length; counter++) {
                    finalData = _.merge(finalData, require(fileObj.list[counter]));
                }
            }
            request.finalData = finalData;
            process.nextSuccess(request, response);
        } else {
            this.LOG.warn('Could not found any data to import for: ', request.fileName);
            process.stop(request, response);
        }
    },

    importFileData: function (request, response, process) {
        this.LOG.debug('Initiating import process for file: ', request.fileName);
        let header = request[request.importType].headers[request.headerName];
        let fileObj = header.dataFiles[request.fileName];
        this.importModels(request, response, {
            pendingRecords: Object.keys(request.finalData)
        }).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            response.success = false;
            delete response.result;
            delete response.msg;
            delete response.code;
            response.errors.PROC_ERR_0003 = {
                code: 'ERR003',
                msg: error
            };
            process.nextFailure(request, response);
        });
    },

    importModels: function (request, response, options) {
        let _self = this;
        let header = request[request.importType].headers[request.headerName];
        let fileObj = header.dataFiles[request.fileName];
        return new Promise((resolve, reject) => {
            if (options.pendingRecords && options.pendingRecords.length > 0) {
                let currentRecord = options.pendingRecords.shift();
                let model = request.finalData[currentRecord];
                let uniqueHash = SYSTEM.generateHash(JSON.stringify(model));
                if (!fileObj.processedRecords.includes(uniqueHash)) {
                    _self.importModel(request, response, {
                        currentRecord: currentRecord
                    }).then(success => {
                        fileObj.processedRecords.push(uniqueHash);
                        _self.importNextModel(request, response, options, resolve, reject);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    _self.importNextModel(request, response, options, resolve, reject);
                }
            } else {
                resolve(true);
            }
        });
    },

    importNextModel: function (request, response, options, resolve, reject) {
        this.importModels(request, response, options).then(success => {
            resolve(success);
        }).catch(error => {
            reject(error);
        })
    },

    importModel: function (request, response, options) {
        return new Promise((resolve, reject) => {
            response.modelImportPipeline = {
                promise: {
                    resolve: resolve,
                    reject: reject
                }
            }
            request.currentRecord = options.currentRecord;
            SERVICE.PipelineService.startPipeline('modelImportPipeline', request, response);
        });
    },

    handleSucessEnd: function (request, response) {
        this.LOG.debug('JS file import Process Request has been processed successfully');
        response.processJsFileImportPipeline.promise.resolve(response);
    },

    handleFailureEnd: function (request, response) {
        this.LOG.debug('JS file import  Process Request has been processed with some failures : ');
        response.processJsFileImportPipeline.promise.reject(response);
    },

    handleErrorEnd: function (request, response) {
        this.LOG.debug('JS file import  Process Request has been processed and got errors : ');
        response.processJsFileImportPipeline.promise.reject(response);
    }
};