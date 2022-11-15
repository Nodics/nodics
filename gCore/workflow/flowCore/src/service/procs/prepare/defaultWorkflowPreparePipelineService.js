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

    validateRequest: function (request, response, process) {
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else if (!request.carrierCode && !request.workflowCarrier) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, carrier detail can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    prepareResponse: function (request, response, process) {
        if (!response.success) {
            response.success = {
                messages: []
            };
        }
        process.nextSuccess(request, response);
    },
    loadWorkflowCarrier: function (request, response, process) {
        if (!request.workflowCarrier && request.carrierCode) {
            SERVICE.DefaultWorkflowCarrierService.getWorkflowCarrier({
                tenant: request.tenant,
                authData: request.authData,
                carrierCode: request.carrierCode || request.workflowCarrier.code
            }).then(success => {
                request.workflowCarrier = success;
                response.success.messages.push('Carrier: ' + (request.workflowCarrier.code || request.workflowCarrier._id) + ' Loaded @: ' + new Date());
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadWorkflowAction: function (request, response, process) {
        if (!request.workflowAction) {
            let actionCode = request.actionCode || request.workflowCarrier.activeAction.code;
            SERVICE.DefaultWorkflowActionService.getWorkflowAction(actionCode, request.tenant).then(workflowAction => {
                request.workflowAction = workflowAction;
                if (request.workflowAction.position === ENUMS.WorkflowActionPosition.HEAD.key) {
                    request.workflowHead = workflowAction;
                }
                response.success.messages.push('Workflow action: ' + actionCode + ' retrived @: ' + new Date());
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadWorkflowHead: function (request, response, process) {
        if (!request.workflowHead) {
            let activeHeadCode = request.workflowCarrier.activeHead
            SERVICE.DefaultWorkflowActionService.getWorkflowHead(activeHeadCode, request.tenant).then(workflowHead => {
                request.workflowHead = workflowHead;
                response.success.messages.push('Workflow head: ' + request.workflowHead.code + ' retrived @: ' + new Date());
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    validateLoadedData: function (request, response, process) {
        if (!request.workflowCarrier) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflow carrier can not be loaded'));
        } else if (!request.workflowAction) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflow action can not be loaded'));
        } else if (!request.workflowHead) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflow head can not be loaded'));
        } else {
            process.nextSuccess(request, response);
        }
    },
};
