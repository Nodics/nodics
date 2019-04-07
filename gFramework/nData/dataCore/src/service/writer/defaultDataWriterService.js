/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

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


    writeToFile: function (options) {
        return new Promise((resolve, reject) => {
            try {
                fse.ensureDir(options.outputPath.destDir).then(success => {
                    let fileName = options.outputPath.fileName;
                    if (fileName.indexOf('.') > 0) {
                        fileName = fileName.substring(0, fileName.lastIndexOf('.') - 1);
                    }
                    if (options.outputPath.version) {
                        fileName = fileName + '_' + options.outputPath.version;
                    }
                    fileName = options.outputPath.destDir + '/' + fileName + '.js';
                    if (options.header.local) {
                        delete options.header.local;
                    }
                    let finalObject = {
                        header: options.header,
                        models: options.finalData
                    };
                    this.LOG.debug('  Writing data into file: ' + fileName.replace(NODICS.getNodicsHome(), '.'));
                    fs.writeFileSync(fileName, 'module.exports = ' + JSON.stringify(finalObject, null, 4) + ';', CONFIG.get('data').importDataConvertEncoding || 'utf8');
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