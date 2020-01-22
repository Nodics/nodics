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

    addItems: function (request) {
        return SERVICE.DefaultWorkflowService.addItems(request);
    },

    performAction: function (request) {
        return SERVICE.DefaultWorkflowService.performAction(request);
    },

    processChannels: function (request) {
        return SERVICE.DefaultWorkflowService.processChannels(request);
    },

    /* ===================================================================== */
    startWorkflow: function (request) {
        return SERVICE.DefaultWorkflowService.startWorkflow(request);
    },



    removeItem: function (request) {
        return SERVICE.DefaultWorkflowService.removeItem(request);
    },

    disableItem: function (request) {
        return SERVICE.DefaultWorkflowService.disableItem(request);
    },

    resumeItem: function (request) {
        return SERVICE.DefaultWorkflowService.resumeItem(request);
    }
};