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
        this.LOG.debug('Validating request to finalize local data import');
        if (!request.models || request.models.length <= 0) {
            process.error(request, response, new CLASSES.DataError('ERR_DATA_00005', 'There is no data to write into file'));
        } else if (!request.header || UTILS.isBlank(request.header)) {
            process.error(request, response, new CLASSES.DataError('ERR_DATA_00006', 'To write data into file'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    generateDataKey: function (request, response, process) {
        this.LOG.debug('Generating unique hash key');
        try {
            request.finalData = {};
            do {
                let data = request.models.shift();
                request.finalData[UTILS.generateHash(JSON.stringify(data))] = data;
            } while (request.models.length > 0);
            process.nextSuccess(request, response);
        } catch (error) {
            process.error(request, response, new CLASSES.DataError(error, 'while generating unique identifier for the data'));
        }
    },

    writeIntoFile: function (request, response, process) {
        this.LOG.debug('Writing data object into file');
        SERVICE.DefaultDataWriterService.writeToFile({
            header: _.merge({}, request.header),
            finalData: request.finalData,
            outputPath: request.outputPath
        }).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    }
};