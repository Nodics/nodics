/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const fse = require('fs-extra');

const copyrightHeader = '/*\n' +
    '    Nodics - Enterprice Micro-Services Management Framework\n' +
    '\n' +
    '    Copyright (c) 2017 Nodics All rights reserved.\n' +
    '\n' +
    '    This software is the confidential and proprietary information of Nodics ("Confidential Information").\n' +
    '    You shall not disclose such Confidential Information and shall use it only in accordance with the\n' +
    '    terms of the license agreement you entered into with Nodics.\n' +
    '\n' +
    ' */\n';

/**
 * @module gFramework/nData/dataCore/src/service/writer/defaultDataWriterService
 * @description Implements nData default data writer service business behavior and extension logic.
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


     * Executes write to file behavior.


     *


     * @param {*} options Method input.


     * @returns {*} Method result.


     */


    writeToFile: function (options) {
        return new Promise((resolve, reject) => {
            try {
                fse.ensureDir(options.outputPath.dataPath).then(success => {
                    let fileName = options.outputPath.fileName;
                    if (fileName.indexOf('.') > 0) {
                        fileName = fileName.substring(0, fileName.lastIndexOf('.') - 1);
                    }
                    if (options.outputPath.version) {
                        fileName = fileName + '_' + options.outputPath.version;
                    }
                    fileName = options.outputPath.dataPath + '/' + fileName + '.js';
                    if (options.header.local) {
                        delete options.header.local;
                    }
                    let finalObject = {
                        header: options.header,
                        models: options.finalData
                    };
                    this.LOG.debug('Writing data into file: ' + fileName.replace(NODICS.getNodicsHome(), '.'));
                    let header = typeof UTILS !== 'undefined' && UTILS.getCopywriteComment ? UTILS.getCopywriteComment() : copyrightHeader;
                    fs.writeFileSync(fileName, header + '\nmodule.exports = ' + JSON.stringify(finalObject, null, 4) + ';', CONFIG.get('data').importDataConvertEncoding || 'utf8');
                    resolve(true);
                }).catch(error => {
                    reject(new CLASSES.DataError(error, 'failed to write data into file: ' + options.outputPath.fileName));
                });
            } catch (error) {
                reject(new CLASSES.DataError(error, 'failed to write data into file'));
            }
        });
    }
};
