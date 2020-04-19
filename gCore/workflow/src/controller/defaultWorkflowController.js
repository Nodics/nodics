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

    /**
        * This function is used to assign single or multiple items to the workflow. Here items are restricted to belong same workflow only.
        * {
            workflowCode: 'Workflow code, these items needs to be associated',
            itemType: 'Type of item, is it INTERNAL or EXTERNAL',
            item: {
                code: 'Required item code',
                schemaName: 'Either schema name or index name',
                indexName: 'Either schema name or index name',
                moduleName: 'Required module name',
                callbackData: 'Any JSON object needs to be send back along with each events',
                detail: 'JSON object if item is external'
            }
        * }
        * @param {*} request 
        * @param {*} callback 
    */
    initItem: function (request, callback) {
        request = _.merge(request || {}, request.httpRequest.body);
        if (callback) {
            FACADE.DefaultWorkflowFacade.initItem(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultWorkflowFacade.initItem(request);
        }
    },

    pauseItem: function (request, callback) {
        request.itemCode = request.httpRequest.params.itemCode;
        request.comment = request.httpRequest.body.comment;
        if (callback) {
            FACADE.DefaultWorkflowFacade.pauseItem(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultWorkflowFacade.pauseItem(request);
        }
    },

    resumeItem: function (request, callback) {
        request.itemCode = request.httpRequest.params.itemCode;
        request.comment = request.httpRequest.body.comment;
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

    nextAction: function (request, callback) {
        request.itemCode = request.httpRequest.params.itemCode;
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

    /**
     * This function is used to perform an action for item. If action is manual, action response is required
     * {
     *  decision: 'Decision that has been taken',
     *  feedback: 'Either json object or simple message'
     * }
     * @param {*} request 
     */
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

    getWorkflowChain: function (request, callback) {
        request.workflowCode = request.httpRequest.params.workflowCode;
        //request = _.merge(request || {}, request.httpRequest.body);
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

    getActiveItem: function (request, callback) {
        request.itemCode = request.httpRequest.params.itemCode;
        request = _.merge(request || {}, request.httpRequest.body);
        if (callback) {
            FACADE.DefaultWorkflowFacade.getActiveItem(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultWorkflowFacade.getActiveItem(request);
        }
    }
};