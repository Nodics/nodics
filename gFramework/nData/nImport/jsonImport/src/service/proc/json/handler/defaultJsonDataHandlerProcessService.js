/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const StreamArray = require('stream-json/streamers/StreamArray');
const path = require('path');
const fs = require('fs');
var sizeof = require('object-sizeof');


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
        if (!request.dataObject) {
            process.error(request, response, 'Invalid data object to process');
        } else {
            process.nextSuccess(request, response);
        }
    },

    executeDataProcessor: function (request, response, process) {
        this.LOG.debug('Applying data process interceptors');
        let moduleName = request.header.options.moduleName;
        let modelName = request.header.options.modelName;
        let interceptors = SERVICE.DefaultDataConfigurationService.getImportInterceptors(moduleName, modelName);
        if (interceptors && interceptors.processor) {
            SERVICE.DefaultInterceptorHandlerService.executeInterceptors([].concat(interceptors.processor), {
                dataObject: request.dataObject
            }).then(success => {
                request.dataObject = success;
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_FIND_00004',
                    error: error
                });
            });
        } else {
            process.nextSuccess(request, response);
        }
    },



    handleSucessEnd: function (request, response, process) {
        process.resolve(response);
    },

    handleErrorEnd: function (request, response, process) {
        process.reject(response);
    }
};