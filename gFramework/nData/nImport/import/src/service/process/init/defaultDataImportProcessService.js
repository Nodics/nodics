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
        this.LOG.debug('Validating request');
        if (!request.inputPath) {
            process.error(request, response, 'Please validate request. Mandate property inputPath not have valid value');
        } else {
            process.nextSuccess(request, response);
        }
    },

    loadDataFiles: function (request, response, process) {
        this.LOG.debug('Loading list of files from Path to be imported');
        SERVICE.DefaultImportUtilityService.getLocalDataFiles(request.inputPath.path).then(success => {
            let files = {};
            Object.keys(success).forEach(fileName => {
                let fileList = success[fileName];
                files[fileName] = {
                    file: fileList[0],
                    name: fileName,
                    processed: [],
                    done: false
                };
            });
            request.dataFiles = files;
            request.nonMacroFiles = {};
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    processDataFiles: function (request, response, process) {
        this.LOG.debug('Starting data import process');
        try {
            if (request.dataFiles && Object.keys(request.dataFiles).length > 0) {
                this.processFiles(request, response, {
                    phase: 0,
                    phaseLimit: CONFIG.get('data').dataImportPhasesLimit || 5,
                    pendingFiles: Object.keys(request.dataFiles)
                }).then(success => {
                    if (response.errors.length > 0) {
                        process.error(request, response);
                    } else {
                        process.nextSuccess(request, response);
                    }
                }).catch(error => {
                    process.error(request, response, error);
                });
            } else {
                this.LOG.debug('No data found to import from: ' + request.inputPath.path);
                process.nextSuccess(request, response);
            }
        } catch (error) {
            process.error(request, response, error);
        }
    },

    processFiles: function (request, response, options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (options.phase < options.phaseLimit) {
                    if (options.pendingFiles && options.pendingFiles.length > 0) {
                        let fileName = options.pendingFiles.shift();
                        let fileObj = request.dataFiles[fileName];
                        if (!fileObj.done || fileObj.done === false) {
                            let fileData = require(fileObj.file);
                            SERVICE.DefaultPipelineService.start('processFileDataImportPipeline', {
                                tenant: request.tenant,
                                dataFiles: request.dataFiles,
                                phase: options.phase,
                                phaseLimit: options.phaseLimit,
                                fileName: fileName,
                                fileData: fileData
                            }, {}).then(success => {
                                fileObj.done = true;
                                _self.processNextFile(request, response, options, resolve, reject);
                            }).catch(error => {
                                if (options.phase >= options.phaseLimit - 1) {
                                    if (error instanceof Array) {
                                        error.forEach(element => {
                                            response.errors.push({ element });
                                        });
                                    } else {
                                        response.errors.push({ error });
                                    }
                                }
                                _self.processNextFile(request, response, options, resolve, reject);
                            });
                        } else {
                            _self.processNextFile(request, response, options, resolve, reject);
                        }
                    } else {
                        resolve(true);
                    }
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    processNextFile: function (request, response, options, resolve, reject) {
        if (options.pendingFiles && options.pendingFiles.length <= 0) {
            if (SERVICE.DefaultImportUtilityService.isImportPending(request.dataFiles)) {
                options.phase = options.phase + 1;
                options.pendingFiles = Object.keys(request.dataFiles);
            } else {
                options.phase = options.phaseLimit;
            }
        }
        this.processFiles(request, response, options).then(success => {
            resolve(success);
        }).catch(error => {
            reject(error);
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
