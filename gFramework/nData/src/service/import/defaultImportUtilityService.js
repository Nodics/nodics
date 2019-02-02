/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const fs = require('fs');

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

    getDataHeaders: function (path, fileList) {
        if (fs.existsSync(path)) {
            let moduleFiles = {};
            UTILS.getAllHeaderFiles(path, moduleFiles);
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

    getInternalDataHeaders: function (moduleList, dataType) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (!moduleList || moduleList.length == 0) {
                    reject('Invalid list of modules to be proccesses');
                } else {
                    let fileList = {};
                    NODICS.getIndexedModules().forEach((moduleObject, moduleIndex) => {
                        moduleObject.forEach(element => {
                            if (moduleList.includes(element.name)) {
                                let dataFilesRoot = element.path;
                                if (dataType === 'core') {
                                    dataFilesRoot = dataFilesRoot + '/data/core';
                                } else if (dataType === 'sample') {
                                    dataFilesRoot = dataFilesRoot + '/data/sample';
                                } else {
                                    dataFilesRoot = dataFilesRoot + '/data/init';
                                }
                                _self.getDataHeaders(dataFilesRoot, fileList);
                            }
                        });
                    });
                    resolve(fileList);
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    /*
     * This function will return list of files from given path grouped by file name
     * @argument - path - path to the external directory
     * @return - object hold files based on thier name
    **/

    getExternalDataHeaders: function (path) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (fs.existsSync(path)) {
                    let fileList = {};
                    _self.getDataHeaders(path, fileList);
                    resolve(fileList);
                } else {
                    reject('Given path :' + path + ' is not valid');
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    getDataFiles: function (path, fileList) {
        if (fs.existsSync(path)) {
            let moduleFiles = {};
            UTILS.getAllDataFiles(path, moduleFiles);
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

    /*
     * This function will return list of files from all modules grouped by file name
     * @argument - moduleList - list of modules to be processed
     * @return - object hold files based on thier name
    **/
    getInternalFiles: function (moduleList, dataType) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (!moduleList || moduleList.length == 0) {
                    reject('Invalid list of modules to be proccesses');
                } else {
                    let fileList = {};
                    NODICS.getIndexedModules().forEach((moduleObject, moduleIndex) => {
                        modules.forEach(element => {
                            if (moduleList.includes(element.name)) {
                                let dataFilesRoot = element.path;
                                if (dataType === 'core') {
                                    dataFilesRoot = dataFilesRoot + '/data/core';
                                } else if (dataType === 'sample') {
                                    dataFilesRoot = dataFilesRoot + '/data/sample';
                                } else {
                                    dataFilesRoot = dataFilesRoot + '/data/init';
                                }
                                _self.getDataFiles(dataFilesRoot, fileList);
                            }
                        });
                    });
                    resolve(fileList);
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    /*
     * This function will return list of files from given path grouped by file name
     * @argument - path - path to the external directory
     * @return - object hold files based on thier name
    **/

    getExternalFiles: function (path) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (fs.existsSync(path)) {
                    let fileList = {};
                    _self.getDataFiles(path, fileList);
                    resolve(fileList);
                } else {
                    reject('Given path :' + path + ' is not valid');
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    isImportPending: function (headers) {
        let pending = false;
        _.each(headers, (header, headerName) => {
            if (!header.done || header.done === false) {
                pending = true;
                return false;
            }
        })
        return pending;
    }
};