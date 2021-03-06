/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

    processingAllowedStates: [ENUMS.WorkflowCarrierState.RELEASED.key, ENUMS.WorkflowCarrierState.PROCESSING.key, ENUMS.WorkflowCarrierState.ERROR.key],
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

    getEventConfiguration: function (workflowAction, workflowCarrier) {
        return _.merge(_.merge({}, workflowAction.event || {}), workflowCarrier.event);
    },

    isProcessingAllowed: function (workflowCarrier) {
        return this.processingAllowedStates.includes(workflowCarrier.currentState.state);
    }
};