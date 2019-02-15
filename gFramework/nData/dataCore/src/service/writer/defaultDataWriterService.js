/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const path = require('path');
const moveFile = require('move-file');

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


    writeToFile: function (options) {
        return new Promise((resolve, reject) => {
            try {
                let filePath = options.outputPath.destDir + '/' + options.outputPath.importType + '/' + options.outputPath.dataType;
                UTILS.ensureExists(filePath);
                let fileName = options.outputPath.fileName;
                if (fileName.indexOf('.') > 0) {
                    fileName = fileName.substring(0, fileName.lastIndexOf('.') - 1);
                }
                if (options.outputPath.version) {
                    fileName = fileName + '_' + options.outputPath.version;
                }
                fileName = filePath + '/' + fileName + '.js';
                this.LOG.debug('  Writing data into file: ' + fileName);// + '\n\n models[' + JSON.stringify(options.finalData) + ']\n}'
                fs.writeFileSync(fileName, "\nmodule.exports = {\nheader:" + JSON.stringify(options.header) + ',\n\n models:' + JSON.stringify(options.finalData) + '\n};',
                    CONFIG.get('importDataConvertEncoding'));
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    moveToSuccess: function (options) {
        options.destDir = 'success';
    },

    moveToError: function (options) {
        options.destDir = 'error';
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
                UTILS.ensureExists(filePath);
                moveFile(options.fileName, filePath + '/' + fileNameWithoutExt + '_' + Date.now() + fileExt).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }
};