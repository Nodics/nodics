/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const StreamArray = require('stream-json/streamers/StreamArray');
const fs = require('fs');
var sizeof = require('object-sizeof');

/**
 * @module gFramework/nData/nImport/jsonImport/src/service/init/defaultJsonFileDataProcessService
 * @description Implements nData default json file data process service business behavior and extension logic.
 * @layer service
 * @owner nData
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
        this.LOG.debug('Validating request to process JS file');
        if (!request.files || !(request.files instanceof Array) || request.files.length <= 0) {
            process.error(request, response, new CLASSES.DataImportError('ERR_IMP_00003', 'Invalid file path to read data'));
        } else if (!request.outputPath || UTILS.isBlank(request.outputPath)) {
            process.error(request, response, new CLASSES.DataImportError('ERR_IMP_00003', 'Invalid output path to write data'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**

     * Processes data chunk behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    processDataChunk: function (request, response, process) {
        this.LOG.debug('Starting processing data chunks');
        this.handleFiles(request, response, [].concat(request.files), 0).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, new CLASSES.DataImportError(error));
        });
    },

    /**

     * Processes files behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} files Method input.

     * @param {*} index Method input.

     * @returns {*} Method result.

     */

    handleFiles: function (request, response, files, index) {
        let _self = this;
        let dataHandler = request.header.options.dataHandler;
        return new Promise((resolve, reject) => {
            if (files.length > 0) {
                let file = files.shift();
                let dataChunk = [];
                let readBytes = 0;
                let version = 0;
                const jsonStream = StreamArray.withParser();
                let readStream = fs.createReadStream(file);
                jsonStream.on("data", function (data) {
                    jsonStream.pause();
                    readBytes = readBytes + sizeof(data.value);
                    if (readBytes > CONFIG.get('data').readBufferSize && dataChunk.length > 0) {
                        request.models = [].concat(dataChunk);
                        if (SERVICE.DefaultImportDiagnosticsService) {
                            SERVICE.DefaultImportDiagnosticsService.increment(request, 'recordsRead', request.models.length);
                        }
                        request.outputPath.version = index + '_' + version;
                        SERVICE.DefaultPipelineService.start(dataHandler, request, {}).then(success => {
                            dataChunk = [data.value];
                            readBytes = 0;
                            version = version + 1;
                            jsonStream.resume();
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        dataChunk.push(data.value);
                        jsonStream.resume();
                    }
                });
                jsonStream.on('end', () => {
                    if (dataChunk.length > 0) {
                        request.models = [].concat(dataChunk);
                        if (SERVICE.DefaultImportDiagnosticsService) {
                            SERVICE.DefaultImportDiagnosticsService.increment(request, 'recordsRead', request.models.length);
                        }
                        request.outputPath.version = index + '_' + version;
                        SERVICE.DefaultPipelineService.start(dataHandler, request, {}).then(success => {
                            _self.handleFiles(request, response, files, ++index).then(success => {
                                resolve(true);
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        resolve(true);
                    }
                });
                jsonStream.on('error', (error) => {
                    reject(error);
                });
                readStream.on('error', (error) => {
                    reject(error);
                });
                readStream.pipe(jsonStream.input);
            } else {
                resolve(true);
            }
        });
    }
};
