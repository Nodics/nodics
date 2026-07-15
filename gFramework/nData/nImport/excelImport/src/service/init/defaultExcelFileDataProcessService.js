/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const ExcelJS = require('exceljs');
const fs = require('fs');
const util = require('util');

/**
 * @module gFramework/nData/nImport/excelImport/src/service/init/defaultExcelFileDataProcessService
 * @description Implements nData default excel file data process service business behavior and extension logic.
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
        this.LOG.debug('Validating request to process Excel file');
        if (!request.files || request.files.length <= 0) {
            process.error(request, response, new CLASSES.DataImportError('ERR_DATA_00003', 'Invalid xls file path to read data'));
        } else if (!request.outputPath || UTILS.isBlank(request.outputPath)) {
            process.error(request, response, new CLASSES.DataImportError('ERR_DATA_00003', 'Invalid output path to write data'));
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
            process.error(request, response, error);
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
                this.convertExcelFile(file, CONFIG.get('data').excelTypeParserOptions || {}).then(jsonData => {
                    //console.log('======================== ');
                    //console.log(util.inspect(jsonData, showHidden = false, depth = 8, colorize = true));
                    request.models = jsonData;
                    if (SERVICE.DefaultImportDiagnosticsService) {
                        SERVICE.DefaultImportDiagnosticsService.increment(request, 'recordsRead', request.models.length);
                    }
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
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    /**
     * Converts the first configured worksheet of an Excel file into row objects keyed by the header row.
     *
     * @param {*} file Excel file path to parse.
     * @param {*} parserOptions Excel parser options from layered configuration.
     * @returns {Promise<Array>} Parsed row models.
     */
    convertExcelFile: function (file, parserOptions) {
        return new Promise((resolve, reject) => {
            let workbook = new ExcelJS.Workbook();
            workbook.xlsx.readFile(file).then(() => {
                let sheetIndex = parserOptions && parserOptions.sheet ? Number(parserOptions.sheet) : 1;
                let worksheet = workbook.worksheets[sheetIndex - 1] || workbook.worksheets[0];
                if (!worksheet) {
                    resolve([]);
                    return;
                }
                let headers = [];
                let records = [];
                worksheet.eachRow((row, rowNumber) => {
                    let values = row.values.slice(1);
                    if (rowNumber === 1) {
                        headers = values.map(value => value === undefined || value === null ? '' : String(value).trim());
                    } else {
                        let record = {};
                        values.forEach((value, valueIndex) => {
                            let header = headers[valueIndex];
                            if (!header) {
                                return;
                            }
                            if ((value === undefined || value === null || value === '') && parserOptions.omitEmptyFields) {
                                return;
                            }
                            record[header] = value && value.text ? value.text : value;
                        });
                        if (Object.keys(record).length > 0) {
                            records.push(record);
                        }
                    }
                });
                resolve(records);
            }).catch(error => {
                reject(error);
            });
        });
    }
};
