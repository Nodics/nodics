/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const excelProcess = require('excel-as-json');

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

    readData: function (request, response, process) {
        this.LOG.debug('Starting processing data chunks');
        return new Promise((resolve, reject) => {
            this.readFiles(request.files, []).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
            });
        });
    },

    readFiles: function (files, data) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let fileName = files.shift();
            let convertExcel = excelProcess.processFile;
            convertExcel(fileName, null, CONFIG.get('data').excelTypeParserOptions, (error, jsonObj) => {
                if (error) {
                    reject(error);
                } else {
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
                }
            });
        });
    }
};