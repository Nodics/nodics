
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

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

    loadFiles: function (fileName, frameworkFile) {
        let _self = this;
        let mergedFile = frameworkFile || {};
        NODICS.getIndexedModules().forEach(function (value, key) {
            var filePath = value.path + fileName;
            if (fs.existsSync(filePath)) {
                _self.LOG.debug('Loading file from : ' + filePath.replace(NODICS.getNodicsHome(), '.'));
                var commonPropertyFile = require(filePath);
                mergedFile = _.merge(mergedFile, commonPropertyFile);
            }
        });
        return mergedFile;
    },

    processFiles: function (filePath, filePostFix, callback) {
        let _self = this;
        if (fs.existsSync(filePath)) {
            let files = fs.readdirSync(filePath);
            if (files) {
                files.map(function (file) {
                    return path.join(filePath, file);
                }).filter(function (file) {
                    if (fs.statSync(file).isDirectory()) {
                        _self.processFiles(file, filePostFix, callback);
                    } else {
                        return fs.statSync(file).isFile();
                    }
                }).filter(function (file) {
                    if (!filePostFix || filePostFix === '*') {
                        return true;
                    } else {
                        return file.endsWith(filePostFix);
                    }
                }).forEach(function (file) {
                    _self.LOG.debug('   Loading file from : ', file.replace(NODICS.getNodicsHome(), '.'));
                    callback(file);
                });
            }
        }
    },

    getGlobalVariables: function (fileName) {
        let _self = this;
        let gVar = {};
        NODICS.getIndexedModules().forEach(function (value, key) {
            var filePath = value.path + fileName;
            if (fs.existsSync(filePath)) {
                _self.LOG.debug('Loading file from : ' + filePath.replace(NODICS.getNodicsHome(), '.'));
                fs.readFileSync(filePath).toString().split('\n').forEach((line) => {
                    if (line.startsWith('const') || line.startsWith('let') || line.startsWith('var')) {
                        let value = line.trim().split(' ');
                        if (!gVar[value[1]]) {
                            gVar[value[1]] = {
                                value: line.trim()
                            };
                        }
                    }
                });
            }
        });
        return gVar;
    }
};