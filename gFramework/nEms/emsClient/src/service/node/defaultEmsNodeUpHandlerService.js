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
        if (!request.moduleName) {
            process.error(request, response, new CLASSES.NodicsError('ERR_EMS_00000', 'Invalid moduleName'));
        } else if (!request.remoteData) {
            process.error(request, response, new CLASSES.NodicsError('ERR_EMS_00000', 'Invalid data object'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    shutdownResponsibilities: function (request, response, process) {
        SERVICE.DefaultEmsClientConfigurationService.closeConsumers(request.remoteData.consumers).then(success => {
            SERVICE.DefaultEmsClientConfigurationService.closePublishers(request.remoteData.publishers).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        }).catch(error => {
            process.error(request, response, error);
        });
    }
};