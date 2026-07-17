/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/workflow/flowCore/src/service/events/defaultWorkflowCarrierChangeListenerService
 * @description Implements workflow default workflow carrier change listener service business behavior and extension logic.
 * @layer service
 * @owner workflow
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


     * Processes item change event behavior.


     *


     * @param {*} request Method input.


     * @param {*} callback Method input.


     * @returns {*} Method result.


     */


    handleItemChangeEvent: function (request, callback) {
        try {
            SERVICE.DefaultWorkflowService.handleItemChangeEvent(request).then(success => {
                if (success.errors && success.errors.length > 0) {
                    let error = new CLASSES.EventError(success.errors[0]);
                    if (success.errors.length > 1) {
                        success.errors.forEach(err => {
                            error.add(err);
                        });
                    }
                    error.metadata = {
                        result: success.result,
                    };
                    callback(error);
                } else {
                    callback(null, success.result);
                }
            }).catch(error => {
                callback(new CLASSES.EventError(error, 'Unable to handle workflow item change', 'ERR_EVNT_00000'));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Unable to handle workflow item change', 'ERR_EVNT_00000'));
        }
    }
};