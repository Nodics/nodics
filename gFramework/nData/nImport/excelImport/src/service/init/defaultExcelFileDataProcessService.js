/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const excelProcess = require('excel-as-json2');
const fs = require('fs');
const util = require('util');

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
        this.LOG.debug('Validating request to process Excel file');
        if (!request.files || request.files.length <= 0) {
            process.error(request, response, new CLASSES.DataImportError('ERR_DATA_00003', 'Invalid xls file path to read data'));
        } else if (!request.outputPath || UTILS.isBlank(request.outputPath)) {
            process.error(request, response, new CLASSES.DataImportError('ERR_DATA_00003', 'Invalid output path to write data'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    processDataChunk: function (request, response, process) {
        this.LOG.debug('Starting processing data chunks');
        this.handleFiles(request, response, [].concat(request.files), 0).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    handleFiles: function (request, response, files, index) {
        let _self = this;
        let dataHandler = request.header.options.dataHandler;
        return new Promise((resolve, reject) => {
            if (files.length > 0) {
                let file = files.shift();
                let convertExcel = excelProcess.processFile;
                convertExcel(file, null, CONFIG.get('data').excelTypeParserOptions, (error, jsonData) => {
                    if (error) {
                        reject(error);
                    } else {
                        //console.log('======================== ');
                        //console.log(util.inspect(jsonData, showHidden = false, depth = 8, colorize = true));
                        request.models = jsonData;
                        request.outputPath.version = index + '_0';
                        SERVICE.DefaultPipelineService.start(dataHandler, request, {}).then(success => {
                            _self.handleFiles(request, response, files, ++index).then(success => {
                                resolve(true);
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    }
                });
            } else {
                resolve(true);
            }
        });
    }
};