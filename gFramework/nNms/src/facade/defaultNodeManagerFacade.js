/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nNms/src/facade/defaultNodeManagerFacade
 * @description Coordinates facade-level delegation for nNms default node manager facade operations.
 * @layer facade
 * @owner nNms
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

     * Processes node activated behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    handleNodeActivated: function (request) {
        return SERVICE.DefaultNodeManagerService.handleNodeActivated(request);
    },

    /**

     * Executes request responsibility behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    requestResponsibility: function (request) {
        return SERVICE.DefaultNodeManagerService.requestResponsibility(request);
    },

    /**

     * Executes stop health check behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    stopHealthCheck: function (request) {
        return SERVICE.DefaultNodeManagerService.stopHealthCheck(request);
    }
};