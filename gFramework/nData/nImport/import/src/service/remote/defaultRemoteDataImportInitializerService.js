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

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating request');
        if (!request.connectionOptions) {
            process.error(request, response, new CLASSES.DataImportError('ERR_IMP_00003', 'Please validate request. Mandate property connectionOptions not have valid value'));
        } else if (!request.localDir) {
            process.error(request, response, new CLASSES.DataImportError('ERR_IMP_00003', 'Please validate request. Mandate property localDir not have valid value'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    prepareOutputURL: function (request, response, process) {
        this.LOG.debug('Preparing output file path');
        request.outputPath = {
            dataPath: NODICS.getServerPath() + '/' + (CONFIG.get('data').dataDirName || 'temp'),
            dataType: request.dataType,
            importType: 'import'
        };
        process.nextSuccess(request, response);
    },

    loadHeaderFileList: function (request, response, process) {
        this.LOG.debug('Loading list of headers from Path to be imported: ' + request.path);
        SERVICE.DefaultImportUtilityService.getExternalDataHeaders(request.path).then(success => {
            request.data.headerFiles = success;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    loadDataFileList: function (request, response, process) {
        this.LOG.debug('Loading list of files from Path to be imported');
        SERVICE.DefaultImportUtilityService.getExternalFiles(request.path).then(success => {
            request.data.dataFiles = success;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    }
};