/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gCore/workflow/flowCore/src/service/default/defaultSuccessActionHandlerService
 * @description Implements workflow default success action handler service business behavior and extension logic.
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

     * Executes perform default success action behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    performDefaultSuccessAction: function (request, response) {
        return new Promise((resolve, reject) => {
            resolve({
                type: ENUMS.WorkflowActionResponseType.SUCCESS.key,
                decision: 'SUCCESS',
                feedback: {
                    message: 'This is default success action, performed as success'
                }
            });
        });
    }
};