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

    validateRequest: function (request, response, process) {
        request.outputPath.dataType = 'externalFile'; // value could be here as 'local', 'external', 'direct'
        process.nextSuccess(request, response);
    },

    prepareFileType: function (request, response, process) {
        request.outputPath.fileType = request.inputFileName.substring(request.inputFileName.lastIndexOf('.') + 1, request.inputFileName.length);
        process.nextSuccess(request, response);
    },

    redirectToFileTypeProcess: function (request, response, process) {
        let fileTypeProcess = CONFIG.get('data').fileTypeProcess;
        if (fileTypeProcess) {
            this.LOG.debug('Processing data for file type: ', request.outputPath.fileType);
            SERVICE.DefaultPipelineService.start(fileTypeProcess, request, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.error(request, response, 'Could not find file type process for type: ' + request.outputPath.fileType);
        }
    },

    writeDataFile: function (request, response, process) {
        this.LOG.debug('Staring file write process for local data import');

    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        process.reject(response.errors);
    }
};