/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/workflow/flowCore/src/service/interceptors/defaultWorkflowCarrierInterceptorService
 * @description Implements workflow default workflow carrier interceptor service business behavior and extension logic.
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

     * Retrieves workflow carrier states information.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    loadWorkflowCarrierStates: function (request, response) {
        return new Promise((resolve, reject) => {
            if (!request.options) request.options = {};
            if (!request.options.recursive) {
                request.options.recursive = {
                    states: true
                };
            } else if (UTILS.isObject(request.options.recursive) && request.options.recursive.states === undefined) {
                request.options.recursive.states = true;
            }
            resolve(true);
        });
    }
};