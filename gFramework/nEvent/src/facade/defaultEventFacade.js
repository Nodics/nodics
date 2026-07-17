/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nEvent/src/facade/defaultEventFacade
 * @description Coordinates facade-level delegation for nEvent default event facade operations.
 * @layer facade
 * @owner nEvent
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

     * Processes event behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    handleEvent: function (request) {
        return SERVICE.DefaultEventService.handleEvent(request);
    },

    /**

     * Processes  behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    publish: function (request) {
        return SERVICE.DefaultEventService.publish(request);
    }
};