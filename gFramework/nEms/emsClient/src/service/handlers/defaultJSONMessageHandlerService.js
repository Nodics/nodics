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
        this.LOG.debug('Validating JSON message handler request');
        if (!request.queue) {
            process.error(request, response, new CLASSES.NodicsError('ERR_EMS_00000', 'Invalid queue detail'));
        } else if (!request.message) {
            process.error(request, response, new CLASSES.NodicsError('ERR_EMS_00000', 'Invalid message'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    processMessage: function (request, response, process) {
        this.LOG.debug('Applying message translator');
        try {
            response.success = {
                code: 'SUC_EMS_00000',
                result: JSON.parse(request.message)
            };
            process.nextSuccess(request, response);
        } catch (error) {
            process.error(request, response, new CLASSES.NodicsError('ERR_EMS_00005'));
        }
    }
};