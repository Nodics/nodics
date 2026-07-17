/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gFramework/nbpm/src/service/event/handlers/carrier/defaultWorkflowCarrierReleasedEventListenerService
 * @description Implements nbpm default workflow carrier released event listener service business behavior and extension logic.
 * @layer service
 * @owner nbpm
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

     * Processes workflow carrier released event behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    handleWorkflowCarrierReleasedEvent: function (request, callback) {
        try {
            let event = request.event;
            SERVICE.DefaultPipelineService.start('defaultWorkflowCarrierReleasedPipeline', {
                tenant: event.tenant,
                event: event,
                data: event.data
            }, {}).then(success => {
                callback(null, {
                    code: 'SUC_EVNT_00000',
                    message: success
                });
            }).catch(error => {
                callback(new CLASSES.EventError(error, 'Unable to handle carrier release event', 'ERR_EVNT_00000'));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Unable to handle  carrier release event', 'ERR_EVNT_00000'));
        }
    }
};