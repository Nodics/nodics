/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const csv = require('csvtojson');

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
        this.LOG.debug('Validating request to process CSV file');
        if (!request.fileName) {
            process.error(request, response, 'Invalid file name to read data');
        } else if (!request.header || UTILS.isBlank(request.header)) {
            process.error(request, response, 'Invalid header to write data');
        } else if (!request.files || request.files.length <= 0) {
            process.error(request, response, 'Invalid file list to read data');
        } else {
            process.nextSuccess(request, response);
        }
    },

    readFilesData: function (request, response, process) {
        this.LOG.debug('Starting processing data chunks: ', request.files);
        this.readFiles(request.files, []).then(success => {
            response.success = success;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    readFiles: function (files, data) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let fileName = files.shift();
            csv(CONFIG.get('data').csvTypeParserOptions | {}).fromFile(fileName).then(jsonObj => {
                if (jsonObj && jsonObj.length > 0) {
                    jsonObj.forEach(element => {
                        data.push(element);
                    });
                }
                if (files.length > 0) {
                    _self.readFiles(files, data).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(data);
                }
            }).catch(error => {
                reject(error);
            });
        });
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