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
        this.importModels(request, response, {
            pendingRecords: Object.keys(request.finalData)
        }).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    importModels: function (request, response, options) {
        return new Promise((resolve, reject) => {
            let header = request[request.importType].headers[request.headerName];
            let fileObj = header.dataFiles[request.fileName];
            try {
                if (options.pendingRecords && options.pendingRecords.length > 0) {
                    request.currentRecord = options.pendingRecords.shift();
                    request.currentModel = request.finalData[request.currentRecord];
                    let uniqueHash = SYSTEM.generateHash(JSON.stringify(request.currentModel));
                    if (!fileObj.processedRecords.includes(uniqueHash)) {
                        SERVICE.DefaultPipelineService.start('modelImportPipeline', request, {}).then(success => {
                            if (success && UTILS.isArray(success)) {
                                success.forEach(element => {
                                    response.success.push(element);
                                });
                            } else {
                                response.success.push(success);
                            }
                            fileObj.processedRecords.push(uniqueHash);
                            this.importModels(request, response, options).then(success => {
                                resolve(success);
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        this.importModels(request, response, options).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    }
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('JS file import Process Request has been processed successfully');
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.error('JS file import  Process Request has been processed and got errors');
        process.reject(response.errors);
    }
};