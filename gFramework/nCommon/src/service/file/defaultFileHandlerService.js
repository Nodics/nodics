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

    moveToSuccess: function (options) {
        options.destDir = 'success';
        return this.moveFile(options);
    },

    moveToError: function (options) {
        options.destDir = 'error';
        return this.moveFile(options);
    },

    moveFile: function (options) {
        return new Promise((resolve, reject) => {
            try {
                let filePath = path.dirname(options.fileName);
                let fileName = path.basename(options.fileName);
                let fileExt = path.extname(fileName);
                let fileNameWithoutExt = fileName.replace(fileExt, '');
                if (fileNameWithoutExt.endsWith('_processing')) {
                    fileNameWithoutExt = fileNameWithoutExt.replace('_processing', '');
                }
                filePath = filePath + '/' + options.destDir;
                fse.ensureDir(filePath).then(() => {
                    fse.move(options.fileName, filePath + '/' + fileNameWithoutExt + '_' + Date.now() + fileExt).then(() => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }
};