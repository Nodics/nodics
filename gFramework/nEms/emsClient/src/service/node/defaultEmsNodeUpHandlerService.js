/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gFramework/nEms/emsClient/src/service/node/defaultEmsNodeUpHandlerService
 * @description Implements nEms default ems node up handler service business behavior and extension logic.
 * @layer service
 * @owner nEms
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

     * Validates request rules.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    validateRequest: function (request, response, process) {
        if (!request.moduleName) {
            process.error(request, response, new CLASSES.NodicsError('ERR_EMS_00000', 'Invalid moduleName'));
        } else if (!request.remoteData) {
            process.error(request, response, new CLASSES.NodicsError('ERR_EMS_00000', 'Invalid data object'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**

     * Executes shutdown responsibilities behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

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