/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nDynamo/src/service/event/defaultClassConfigurationChangeListenerService
 * @description Implements nDynamo default class configuration change listener service business behavior and extension logic.
 * @layer service
 * @owner nDynamo
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

     * Processes class update event handler behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    handleClassUpdateEventHandler: function (request, callback) {
        try {
            SERVICE.DefaultClassConfigurationService.classUpdateEventHandler(request).then(success => {
                callback(null, { code: 'SUC_EVNT_00000', message: success });
            }).catch(error => {
                callback(new CLASSES.EventError(error, 'Unable to handle class configuration update', 'ERR_EVNT_00000'));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Unable to handle class configuration update', 'ERR_EVNT_00000'));
        }
    }
};