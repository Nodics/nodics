/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const path = require('path');
const fse = require('fs-extra');

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

    moveToProcessing: function (options) {
        return new Promise((resolve, reject) => {
            try {
                let filePath = path.dirname(options.fileName);
                let fileName = path.basename(options.fileName);
                let fileExt = path.extname(options.fileName);
                let fileNameWithoutExt = fileName.replace(fileExt, '');
                let outputFileName = filePath + '/' + fileNameWithoutExt + '_processing' + fileExt;
                fse.move(options.fileName, outputFileName).then(() => {
                    resolve(outputFileName);
                }).catch(err => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    },

    moveSyncToProcessing: function (options) {
        let filePath = path.dirname(options.fileName);
        let fileName = path.basename(options.fileName);
        let fileExt = path.extname(options.fileName);
        let fileNameWithoutExt = fileName.replace(fileExt, '');
        let outputFileName = filePath + '/' + fileNameWithoutExt + '_processing' + fileExt;
        fse.moveSync(options.fileName, outputFileName, { overwrite: true });
        return outputFileName;
    },

    moveToSuccess: function (files) {
        return this.moveFile([].concat(files), 'success');
    },

    moveToError: function (files) {
        return this.moveFile([].concat(files), 'error');
    },

    moveFile: function (files, type) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (files.length > 0) {
                let file = files.shift();
                try {
                    let filePath = path.dirname(file);
                    let fileName = path.basename(file);
                    let fileExt = path.extname(fileName);
                    let fileNameWithoutExt = fileName.replace(fileExt, '');
                    if (fileNameWithoutExt.endsWith('_processing')) {
                        fileNameWithoutExt = fileNameWithoutExt.replace('_processing', '');
                    }
                    filePath = filePath + '/' + type;
                    fse.ensureDir(filePath).then(() => {
                        fse.move(file, filePath + '/' + fileNameWithoutExt + '_' + Date.now() + fileExt).then(() => {
                            _self.moveFile(files, type).then(success => {
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
                } catch (error) {
                    reject(error);
                }
            } else {
                resolve(true);
            }
        });
    }
};