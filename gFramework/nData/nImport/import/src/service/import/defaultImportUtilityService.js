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

    getSystemDataHeaders: function (moduleList, dataType) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (!moduleList || moduleList.length == 0) {
                    reject('Invalid list of modules to be proccesses');
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
                            _self.getSystemHeaders(dataFilesRoot, fileList);
                        }
                    });
                    resolve(fileList);
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    getSystemHeaders: function (path, fileList) {
        if (fs.existsSync(path)) {
            let moduleFiles = {};
            UTILS.getSystemHeaderFiles(path, moduleFiles);
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
                    reject('Invalid list of modules to be proccesses');
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
                            _self.getSystemFiles(dataFilesRoot, fileList);
                        }
                    });
                    resolve(fileList);
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    getSystemFiles: function (path, fileList) {
        if (fs.existsSync(path)) {
            let moduleFiles = {};
            UTILS.getSystemDataFiles(path, moduleFiles);
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


    getLocalDataHeaders: function (path) {
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

    getDataHeaders: function (path, fileList) {
        if (fs.existsSync(path)) {
            let moduleFiles = {};
            UTILS.getLocalHeaderFiles(path, moduleFiles);
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

    getLocalDataFiles: function (path) {
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

    getDataFiles: function (path, fileList) {
        if (fs.existsSync(path)) {
            let moduleFiles = {};
            UTILS.getLocalDataFiles(path, moduleFiles);
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

    isImportPending: function (dataFiles) {
        let pending = false;
        _.each(dataFiles, (fileObj, fileName) => {
            if (!fileObj.done || fileObj.done === false) {
                pending = true;
                return false;
            }
        })
        return pending;
    }
};