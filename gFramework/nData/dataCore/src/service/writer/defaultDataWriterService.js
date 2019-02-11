/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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

    writeToFile: function (options) {
        return new Promise((resolve, reject) => {
            try {
                let filePath = options.outputPath.destDir + '/' + options.outputPath.importType + '/' + options.outputPath.dataType;
                UTILS.ensureExists(filePath).then(success => {
                    let fileName = filePath + '/' + options.outputPath.fileName;
                    if (fileName.indexOf('.') > 0) {
                        fileName = fileName.substring(0, fileName.lastIndexOf('.') - 1);
                    }
                    fileName = fileName + '.js';
                    this.LOG.debug('  Writing data into file: ' + fileName);
                    fs.writeFileSync(fileName,
                        JSON.stringify(options.header) + '\n\n' + JSON.stringify(options.finalData),
                        CONFIG.get('importDataConvertEncoding'));
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

};