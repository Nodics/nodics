/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const fs = require('fs');

/**
 * @module gFramework/nData/nImport/import/src/service/import/defaultImportUtilityService
 * @description Implements nData default import utility service business behavior and extension logic.
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

     * Retrieves system data headers information.

     *

     * @param {*} moduleList Method input.

     * @param {*} dataType Method input.

     * @returns {*} Method result.

     */

    getSystemDataHeaders: function (moduleList, dataType) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (!moduleList || moduleList.length == 0) {
                    reject(new CLASSES.DataImportError('ERR_IMP_00003', 'Invalid list of modules to be proccesses'));
                } else {
                    let fileList = {};
                    NODICS.getIndexedModules().forEach((moduleObject, moduleIndex) => {
                        if (moduleList.includes(moduleObject.name)) {
                            let dataFilesRoot = moduleObject.path;
                            if (dataType === 'init') {
                                dataFilesRoot = dataFilesRoot + '/data/init';
                            } else if (dataType === 'core') {
                                dataFilesRoot = dataFilesRoot + '/data/core';
                            } else {
                                dataFilesRoot = dataFilesRoot + '/data/sample';
                            }
                            _self.getHeaderFiles(dataFilesRoot, fileList);
                        }
                    });
                    resolve(fileList);
                }
            } catch (error) {
                reject(new CLASSES.DataImportError(error, 'while collecting system data headers'));
            }
        });
    },

    /**

     * Retrieves header files information.

     *

     * @param {*} path Method input.

     * @param {*} fileList Method input.

     * @returns {*} Method result.

     */

    getHeaderFiles: function (path, fileList) {
        if (fs.existsSync(path)) {
            let moduleFiles = {};
            UTILS.getHeaderFiles(path, moduleFiles);
            _.each(moduleFiles, (dataFile, name) => {
                if (fileList[name]) {
                    fileList[name].push(dataFile);
                } else {
                    fileList[name] = [dataFile];
                }
            });
            return fileList;
        }
    },

    /**
     * This function will return list of files from all modules grouped by file name
     * @param {*} moduleList 
     * @param {*} dataType 
     */
    getSystemDataFiles: function (moduleList, dataType) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (!moduleList || moduleList.length == 0) {
                    reject(new CLASSES.DataImportError('ERR_IMP_00003', 'Invalid list of modules to be proccesses'));
                } else {
                    let fileList = {};
                    NODICS.getIndexedModules().forEach((moduleObject, moduleIndex) => {
                        if (moduleList.includes(moduleObject.name)) {
                            let dataFilesRoot = moduleObject.path;
                            if (dataType === 'init') {
                                dataFilesRoot = dataFilesRoot + '/data/init';
                            } else if (dataType === 'core') {
                                dataFilesRoot = dataFilesRoot + '/data/core';
                            } else {
                                dataFilesRoot = dataFilesRoot + '/data/sample';
                            }
                            _self.getDataFiles(dataFilesRoot, fileList);
                        }
                    });
                    resolve(fileList);
                }
            } catch (error) {
                reject(new CLASSES.DataImportError(error, 'while collecting system data files'));
            }
        });
    },

    /**

     * Retrieves data files information.

     *

     * @param {*} path Method input.

     * @param {*} fileList Method input.

     * @returns {*} Method result.

     */

    getDataFiles: function (path, fileList) {
        if (fs.existsSync(path)) {
            let moduleFiles = {};
            UTILS.getDataFiles(path, moduleFiles);
            _.each(moduleFiles, (dataFile, name) => {
                if (fileList[name]) {
                    fileList[name].push(dataFile);
                } else {
                    fileList[name] = [dataFile];
                }
            });
            return fileList;
        }
    },

    /**

     * Retrieves local header files information.

     *

     * @param {*} filePath Method input.

     * @returns {*} Method result.

     */

    getLocalHeaderFiles: function (filePath) {
        let fileList = {};
        let headerBatchSize = CONFIG.get('data').headerBatchSize || 0;
        return new Promise((resolve, reject) => {
            try {
                if (fs.existsSync(filePath)) {
                    let files = fs.readdirSync(filePath);
                    if (files) {
                        for (let count = 0; count < files.length; count++) {
                            let element = files[count];
                            let file = path.join(filePath, element);
                            if (!fs.statSync(file).isDirectory()) {
                                let name = element.split('.').shift();
                                let extname = element.split('.').pop();
                                if (!UTILS.isBlank(name) && (name.endsWith('Header') || name.endsWith('Headers'))) {
                                    fileList[name + '_' + extname] = [SERVICE.DefaultFileHandlerService.moveSyncToProcessing(file)];
                                    if (headerBatchSize && headerBatchSize > 0 && Object.keys(fileList).length >= headerBatchSize) {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                resolve(fileList);
            } catch (error) {
                reject(new CLASSES.DataImportError(error, 'while collecting local data files'));
            }
        });
    },

    /**

     * Retrieves all frefix files information.

     *

     * @param {*} filePath Method input.

     * @param {*} fileList Method input.

     * @param {*} preFix Method input.

     * @returns {*} Method result.

     */

    getAllFrefixFiles: function (filePath, fileList, preFix) {
        let _self = this;
        if (fs.existsSync(filePath)) {
            let files = fs.readdirSync(filePath);
            if (files) {
                files.forEach(element => {
                    let file = path.join(filePath, element);
                    if (fs.statSync(file).isDirectory()) {
                        _self.getAllFrefixFiles(file, fileList, preFix);
                    } else {
                        let name = element.substring(0, element.lastIndexOf("."));
                        name = name.replace(/\./g, '');
                        let extname = element.split('.').pop();
                        if (!UTILS.isBlank(name) && (!preFix || element.startsWith(preFix)) &&
                            !name.endsWith('Header') && !name.endsWith('Headers') && !name.endsWith('processing')) {
                            fileList[name + '_' + extname] = SERVICE.DefaultFileHandlerService.moveSyncToProcessing(file);
                        }
                    }
                });
            }
        }
    },

    /**

     * Retrieves import files information.

     *

     * @param {*} filePath Method input.

     * @returns {*} Method result.

     */

    getImportFiles: function (filePath) {
        let fileList = {};
        return new Promise((resolve, reject) => {
            try {
                if (fs.existsSync(filePath)) {
                    let files = fs.readdirSync(filePath);
                    if (files) {
                        for (let count = 0; count < files.length; count++) {
                            let element = files[count];
                            let file = path.join(filePath, element);
                            if (!fs.statSync(file).isDirectory()) {
                                let name = element.split('.').shift();
                                let extname = element.split('.').pop();
                                fileList[name + '_' + extname] = SERVICE.DefaultFileHandlerService.moveSyncToProcessing(file);
                            }
                        }
                    }
                }
                resolve(fileList);
            } catch (error) {
                reject(new CLASSES.DataImportError(error, 'while collecting import files'));
            }
        });
    },

    /**

     * Validates import pending rules.

     *

     * @param {*} dataFiles Method input.

     * @returns {*} Method result.

     */

    isImportPending: function (dataFiles) {
        let pending = false;
        _.each(dataFiles, (fileObj, fileName) => {
            if (!fileObj.done || fileObj.done === false) {
                pending = true;
                return false;
            }
        });
        return pending;
    }
};