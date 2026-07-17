/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const path = require('path');
const fse = require('fs-extra');

/**
 * @module common/service/file/DefaultFileHandlerService
 * @description Shared file movement helper for import/export and batch file workflows.
 * It marks files as processing and moves completed files into destination folders with
 * timestamped names.
 * @layer service
 * @owner nCommon
 * @override Project modules may override this service to enforce storage, archive,
 * naming, or audit policies for enterprise file processing.
 *
 * @property {Object} fse fs-extra dependency for async and sync file moves.
 */
module.exports = {
    /**
     * Initializes the file handler service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the file handler service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Moves a file to the same directory with `_processing` suffix.
     *
     * @param {string} file Source file path.
     * @returns {Promise<string>} New processing file path.
     */
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

    /**
     * Synchronously moves a file to the same directory with `_processing` suffix.
     *
     * @param {string} file Source file path.
     * @returns {string} New processing file path.
     */
    moveSyncToProcessing: function (file) {
        let filePath = path.dirname(file);
        let fileName = path.basename(file);
        let fileExt = path.extname(file);
        let fileNameWithoutExt = fileName.replace(fileExt, '');
        let outputFileName = filePath + '/' + fileNameWithoutExt + '_processing' + fileExt;
        fse.moveSync(file, outputFileName, { overwrite: true });
        return outputFileName;
    },

    /**
     * Moves files into a destination folder with timestamped names.
     *
     * @param {string[]} files Source file paths to move.
     * @param {string} destPath Destination directory.
     * @returns {Promise<boolean>} Resolves after all files move.
     */
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
                            let destFile = destPath + '/' + fileNameWithoutExt + '_' + Date.now() + fileExt;
                            _self.LOG.debug('Moving file from: ' + file);
                            _self.LOG.debug('   -> : ' + destFile);
                            fse.move(file, destFile).then(() => {
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
