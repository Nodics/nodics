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
        this.LOG.debug('Validating request to process JSON file');
        if (!request.fileName) {
            process.error(request, response, 'Invalid file name to read data');
        } else if (!request.header || UTILS.isBlank(request.header)) {
            process.error(request, response, 'Invalid header to write data');
        } else if (!request.files || request.files.length <= 0) {
            process.error(request, response, 'Invalid file list to read data');
        } else {
            process.nextSuccess(request, response);
        }
    },

    readDataChunk: function (request, response, process) {
        this.LOG.debug('Starting processing data chunks');
        try {
            let dataObject = {};
            let data = [];
            request.files.forEach(file => {
                let fileData = require(file);
                if (!UTILS.isBlank(fileData)) {
                    dataObject = _.merge(dataObject, fileData);
                }
            });
            if (dataObject && !UTILS.isBlank(dataObject)) {
                Object.keys(dataObject).forEach(element => {
                    data.push(dataObject[element]);
                });
            }
            response.success = data;
            process.nextSuccess(request, response);
        } catch (error) {
            process.error(request, response, error);
        }

    },

    handleSucessEnd: function (request, response, process) {
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed and got errors');
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