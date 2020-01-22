/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

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

    addItems: function (request, callback) {
        request = _.merge(request || {}, request.httpRequest.body);
        if (callback) {
            FACADE.DefaultWorkflowFacade.addItems(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultWorkflowFacade.addItems(request);
        }
    },

    performAction: function (request, callback) {
        request.itemCode = request.httpRequest.params.itemCode;
        request.actionResponse = request.httpRequest.body;
        if (callback) {
            FACADE.DefaultWorkflowFacade.performAction(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultWorkflowFacade.performAction(request);
        }
    },

    processChannels: function (request, callback) {
        request.itemCode = request.httpRequest.params.itemCode;
        if (callback) {
            FACADE.DefaultWorkflowFacade.processChannels(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultWorkflowFacade.processChannels(request);
        }
    },


    /* ===================================================================== */
    startWorkflow: function (request, callback) {
        request.itemCode = request.httpRequest.params.itemCode;
        request = _.merge(request || {}, request.httpRequest.body);
        if (callback) {
            FACADE.DefaultWorkflowFacade.startWorkflow(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultWorkflowFacade.startWorkflow(request);
        }
    },




    removeItem: function (request, callback) {
        request.itemCode = request.httpRequest.params.itemCode;
        if (callback) {
            FACADE.DefaultWorkflowFacade.removeItem(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultWorkflowFacade.removeItem(request);
        }
    },

    disableItem: function (request, callback) {
        request.itemCode = request.httpRequest.params.itemCode;
        request.actionResponse = request.httpRequest.body;
        if (callback) {
            FACADE.DefaultWorkflowFacade.disableItem(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultWorkflowFacade.disableItem(request);
        }
    },

    resumeItem: function (request, callback) {
        request.itemCode = request.httpRequest.params.itemCode;
        request = _.merge(request || {}, request.httpRequest.body);
        if (callback) {
            FACADE.DefaultWorkflowFacade.resumeItem(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultWorkflowFacade.resumeItem(request);
        }
    },
};