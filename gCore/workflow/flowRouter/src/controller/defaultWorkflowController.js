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

    initCarrierItem: function (request, callback) {
        request = _.merge(request || {}, request.httpRequest.body);
        if (callback) {
            FACADE.DefaultWorkflowFacade.initCarrierItem(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultWorkflowFacade.initCarrierItem(request);
        }
    },

    addItemToCarrier: function (request, callback) {
        request = _.merge(request || {}, request.httpRequest.body);
        if (callback) {
            FACADE.DefaultWorkflowFacade.addItemToCarrier(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultWorkflowFacade.addItemToCarrier(request);
        }
    },

    blockCarrier: function (request, callback) {
        request.carrierCode = request.httpRequest.params.carrierCode;
        request.comment = request.httpRequest.body.comment;
        if (callback) {
            FACADE.DefaultWorkflowFacade.blockCarrier(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultWorkflowFacade.blockCarrier(request);
        }
    },

    releaseCarrier: function (request, callback) {
        request.carrierCode = request.httpRequest.params.carrierCode;
        request.comment = request.httpRequest.body.comment;
        if (callback) {
            FACADE.DefaultWorkflowFacade.releaseCarrier(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultWorkflowFacade.releaseCarrier(request);
        }
    },

    pauseCarrier: function (request, callback) {
        request.carrierCode = request.httpRequest.params.carrierCode;
        request.comment = request.httpRequest.body.comment;
        if (callback) {
            FACADE.DefaultWorkflowFacade.pauseCarrier(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultWorkflowFacade.pauseCarrier(request);
        }
    },

    resumeCarrier: function (request, callback) {
        request.carrierCode = request.httpRequest.params.carrierCode;
        request.comment = request.httpRequest.body.comment;
        if (callback) {
            FACADE.DefaultWorkflowFacade.resumeCarrier(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultWorkflowFacade.resumeCarrier(request);
        }
    },

    nextAction: function (request, callback) {
        request.carrierCode = request.httpRequest.params.carrierCode;
        request.actionCode = request.httpRequest.params.actionCode;
        if (callback) {
            FACADE.DefaultWorkflowFacade.nextAction(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultWorkflowFacade.nextAction(request);
        }
    },

    getWorkflowChain: function (request, callback) {
        request.workflowCode = request.httpRequest.params.workflowCode;
        request = _.merge(request || {}, request.httpRequest.body);
        if (callback) {
            FACADE.DefaultWorkflowFacade.getWorkflowChain(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultWorkflowFacade.getWorkflowChain(request);
        }
    },

    /**
     * This function is used to perform an action for item. If action is manual, action response is required
     * {
     *  decision: 'Decision that has been taken',
     *  feedback: 'Either json object or simple message'
     * }
     * @param {*} request 
     */
    performAction: function (request, callback) {
        request.carrierCode = request.httpRequest.params.carrierCode;
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
};