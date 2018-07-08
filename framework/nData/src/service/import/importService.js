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

    /*
     * This function will return list of files from all modules grouped by file name
     * @argument - moduleList - list of modules to be processed
     * @return - object hold files based on thier name
    **/
    getInternalFiles: function (moduleList, dataType) {
        return new Promise((resolve, reject) => {
            try {
                if (!moduleList || moduleList.length == 0) {
                    reject('Invalid list of modules to be proccesses');
                } else {
                    let fileList = [];
                    _.each(NODICS.getIndexedModules(), (modules, moduleIndex) => {
                        modules.forEach(element => {
                            if (moduleList.includes(element.name)) {
                                let moduleFiles = {};
                                let dataFilesRoot = element.path;
                                if (dataType === 'core') {
                                    dataFilesRoot = dataFilesRoot + '/data/core'
                                } else if (dataType === 'sample') {
                                    dataFilesRoot = dataFilesRoot + '/data/sample'
                                } else {
                                    dataFilesRoot = dataFilesRoot + '/data/init'
                                }
                                UTILS.getAllFile(dataFilesRoot, moduleFiles);
                                _.each(moduleFiles, (dataFile, name) => {
                                    if (fileList[name]) {
                                        fileList[name].push(dataFile);
                                    } else {
                                        fileList[name] = [dataFile];
                                    }
                                });
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
        return new Promise((resolve, reject) => {
            try {
                if (fs.existsSync(path)) {
                    let fileList = [];
                    let moduleFiles = {};
                    UTILS.getAllFile(path, moduleFiles);
                    _.each(moduleFiles, (dataFile, name) => {
                        if (fileList[name]) {
                            fileList[name].push(dataFile);
                        } else {
                            fileList[name] = [dataFile];
                        }
                    });
                    resolve(fileList);
                } else {
                    reject('Given path :' + path + ' is not valid');
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    processDataImport: function (input, callback) {
        let _self = this;





        let dataType = 'init';
        SERVICE.InternalDataLoadService.getInternalFiles(['profile', 'sampleServer']).then(fileList => {
            console.log(fileList);
        }).catch(error => {
            console.log(error);
        });
        SERVICE.InternalDataLoadService.getExternalFiles(NODICS.getNodicsHome() + '/tmp').then(fileList => {
            console.log(fileList);
        }).catch(error => {
            console.log(error);
        });
    },
};