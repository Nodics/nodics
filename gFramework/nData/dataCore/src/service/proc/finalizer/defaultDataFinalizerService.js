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
        process.nextSuccess(request, response);
    },

    prepareFileType: function (request, response, process) {
        process.nextSuccess(request, response);
    },

    redirectToFileTypeProcess: function (request, response, process) {
        let fileTypeProcess = CONFIG.get('data').fileTypeProcess;
        if (fileTypeProcess && fileTypeProcess[request.inputPath.fileType]) {
            this.LOG.debug('Processing data for file type: ' + request.inputPath.fileType + ' with pipeline: ' + fileTypeProcess[request.inputPath.fileType]);
            SERVICE.DefaultPipelineService.start(fileTypeProcess[request.inputPath.fileType], request, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.error(request, response, 'Could not find file type process for type: ' + request.inputPath.fileType);
        }
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        if (request.inputPath.importType !== 'system') {
            SERVICE.DefaultFileHandlerService.moveFile(request.files, request.inputPath.successPath + '/data').then(success => {
                this.LOG.debug('File moved to success bucket: ' + success);
            }).catch(error => {
                this.LOG.error(request.files);
                this.LOG.error('Facing issued while moving file to success bucket: ', error);
            });
        }
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        if (request.inputPath.importType !== 'system') {
            SERVICE.DefaultFileHandlerService.moveFile(request.files, request.inputPath.errorPath + '/data').then(success => {
                this.LOG.debug('File moved to success bucket: ' + success);
            }).catch(error => {
                this.LOG.error(request.files);
                this.LOG.error('Facing issued while moving file to success bucket: ', error);
            });
        }
        if (response.errors && response.errors.length === 1) {
            process.reject(response.errors[0]);
        } else if (response.errors && response.errors.length > 1) {
            process.reject({
                success: false,
                code: 'ERR_SYS_00000',
                error: response.errors
            });
        } else {
            process.reject(response.error);
        }
    }
};