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

    moveToProcessing: function (file) {
        return new Promise((resolve, reject) => {
            try {
                let filePath = path.dirname(file);
                let fileName = path.basename(file);
                let fileExt = path.extname(file);
                let fileNameWithoutExt = fileName.replace(fileExt, '');
                let outputFileName = filePath + '/' + fileNameWithoutExt + '_processing' + fileExt;
                fse.move(file, outputFileName).then(() => {
                    resolve(outputFileName);
                }).catch(err => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    },

    moveSyncToProcessing: function (file) {
        let filePath = path.dirname(file);
        let fileName = path.basename(file);
        let fileExt = path.extname(file);
        let fileNameWithoutExt = fileName.replace(fileExt, '');
        let outputFileName = filePath + '/' + fileNameWithoutExt + '_processing' + fileExt;
        fse.moveSync(file, outputFileName, { overwrite: true });
        return outputFileName;
    },

    moveFile: function (files, destPath) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (files.length > 0) {
                    let file = files.shift();
                    try {
                        let fileName = path.basename(file);
                        let fileExt = path.extname(fileName);
                        let fileNameWithoutExt = fileName.replace(fileExt, '');
                        if (fileNameWithoutExt.endsWith('_processing')) {
                            fileNameWithoutExt = fileNameWithoutExt.replace('_processing', '');
                        }
                        fse.ensureDir(destPath).then(() => {
                            fse.move(file, destPath + '/' + fileNameWithoutExt + '_' + Date.now() + fileExt).then(() => {
                                _self.moveFile(files, destPath).then(success => {
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
            } catch (error) {
                reject(error);
            }
        });
    }
};