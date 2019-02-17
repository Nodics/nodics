/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const StreamArray = require('stream-json/streamers/StreamArray');
const path = require('path');
const fs = require('fs');
var sizeof = require('object-sizeof');


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
        if (!request.inputFileName) {
            process.error(request, response, 'Invalid file path to read data');
        } else if (!request.outputPath || UTILS.isBlank(request.outputPath)) {
            process.error(request, response, 'Invalid output path to write data');
        } else {
            process.nextSuccess(request, response);
        }
    },

    processDataChunk: function (request, response, process) {
        this.LOG.debug('Starting processing data chunks');
        const jsonStream = StreamArray.withParser();
        let dataChunk = [];
        let readBytes = 0;
        let version = 0;
        jsonStream.on("data", function (data) {
            jsonStream.pause();
            readBytes = readBytes + sizeof(data.value);
            if (readBytes > CONFIG.get('data').readBufferSize) {
                request.dataObject = [].concat(dataChunk);
                SERVICE.DefaultPipelineService.start('JsonDataHandlerPipeline', request, {}).then(success => {
                    dataChunk = [data];
                    readBytes = 0;
                    version = version + 1;
                    jsonStream.resume();
                }).catch(error => {
                    process.error(request, response, error);
                });
            } else {
                dataChunk.push(data.value);
                jsonStream.resume();
            }
        });
        jsonStream.on('end', () => {
            if (dataChunk.length > 0) {
                request.dataObject = [].concat(dataChunk);
                SERVICE.DefaultPipelineService.start('JsonDataHandlerPipeline', request, {}).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
            } else {
                process.nextSuccess(request, response);
            }
        });
        fs.createReadStream(request.inputFileName).pipe(jsonStream.input);
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