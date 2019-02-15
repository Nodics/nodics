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
        this.LOG.debug('Validating request to finalize local data import');
        process.nextSuccess(request, response);
    },

    generateDataKey: function (request, response, process) {
        this.LOG.debug('Validating request to finalize local data import');
        console.log('5---------:', request.dataObject);
        request.finalData = {};
        do {
            let data = request.dataObject.shift();
            request.finalData[UTILS.generateHash(JSON.stringify(data))] = data;
        } while (request.dataObject.length > 0);
        process.nextSuccess(request, response);
    },

    writeIntoFile: function (request, response, process) {
        this.LOG.debug('Validating request to finalize local data import');
        SERVICE.DefaultDataWriterService.writeToFile({
            header: request.header,
            finalData: request.finalData,
            outputPath: request.outputPath
        }).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });

    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        if (response.errors && response.errors.length === 1) {
            process.reject(response.errors[0]);
        } else if (response.errors && response.errors.length > 1) {
            process.reject({
                success: false,
                code: 'ERR_SYS_00000',
                error: esponse.errors
            });
        } else {
            process.reject(response.error);
        }
    }
};