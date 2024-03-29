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

    initCarrier: function (request) {
        return SERVICE.DefaultWorkflowService.initCarrier(request);
    },
    releaseCarrier: function (request) {
        return SERVICE.DefaultWorkflowService.releaseCarrier(request);
    },
    updateCarrier: function (request) {
        return SERVICE.DefaultWorkflowService.updateCarrier(request);
    },
    performAction: function (request) {
        return SERVICE.DefaultWorkflowService.performAction(request);
    },

    // blockCarrier: function (request) {
    //     return SERVICE.DefaultWorkflowService.blockCarrier(request);
    // },



    // pauseCarrier: function (request) {
    //     return SERVICE.DefaultWorkflowService.pauseCarrier(request);
    // },

    // resumeCarrier: function (request) {
    //     return SERVICE.DefaultWorkflowService.resumeCarrier(request);
    // },

    // nextAction: function (request) {
    //     return SERVICE.DefaultWorkflowService.nextAction(request);
    // },

    // getWorkflowChain: function (request) {
    //     return SERVICE.DefaultWorkflowService.getWorkflowChain(request);
    // },


};