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

    /**
     * This pipeline process can be executed either via last executed action after assiging an item to action if it is AUTO, or via API if it is MANUAL. 
     * In case of AUTO workflowItem object will be mandate and for manual, workflowItemCode and response will be mandate. Here response is what business
     * have thier comments for the action
     * @param {*} request 
     * @param {*} response 
     * @param {*} process 
     */
    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating request to evaluate channels');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else if (!request.itemCode && !request.workflowItem) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflow item detail can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadActionResponse: function (request, response, process) {
        SERVICE.DefaultWorkflowActionResponseService.getActionResponse(request).then(actionResponse => {
            request.actionResponse = actionResponse;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    prepareResponse: function (request, response, process) {
        this.LOG.debug('Preparing response for action execution');
        response.success = {
            messages: []
        };
        process.nextSuccess(request, response);
    },
    validateOperation: function (request, response, process) {
        let workflowItem = request.workflowItem;
        if (workflowItem.activeHead.code !== request.workflowHead.code) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflow head mismatch, for item ' + workflowItem.code + ' with workflow head: ' + request.workflowHead.code));
        } else if (workflowItem.activeAction.code !== request.workflowAction.code) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflow action mismatch, for item ' + workflowItem.code + ' with workflow head: ' + request.workflowAction.code));
        } else if (!request.actionResponse) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, action response can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    evaluateChannels: function (request, response, process) {
        this.LOG.debug('Starting channel evaluation process');
        SERVICE.DefaultWorkflowChannelService.getQalifiedChannel({
            tenant: request.tenant,
            workflowItem: request.workflowItem,
            workflowHead: request.workflowHead,
            workflowAction: request.workflowAction,
            actionResponse: request.actionResponse
        }).then(qualifiedChannels => {
            request.qualifiedChannels = qualifiedChannels;
            if (request.qualifiedChannels.length > 0) {
                response.success.qualifiedChannels = [];
                request.qualifiedChannels.forEach(channel => {
                    response.success.qualifiedChannels.push(channel.code);
                    if (!request.actionResponse.channels) request.actionResponse.channels = [];
                    request.actionResponse.channels.push(channel.code);
                });
                response.success.messages.push('Qualified channels: ' + request.actionResponse.channels + ' @: ' + new Date());
                process.nextSuccess(request, response);
            } else {
                response.success.messages.push('This is end action for workflow @: ' + new Date());
                process.stop(request, response);
            }
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    updateActionResponse: function (request, response, process) {
        SERVICE.DefaultActionResponseService.save({
            tenant: request.tenant,
            model: request.actionResponse
        }).then(success => {
            response.success.messages.push('Action response: ' + request.actionResponse._id + ' been updated with qualified channels');
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    executeChannels: function (request, response, process) {
        this.LOG.debug('Starting channels execution process');
        SERVICE.DefaultWorkflowChannelService.executeChannels({
            tenant: request.tenant,
            workflowItem: request.workflowItem,
            workflowHead: request.workflowHead,
            workflowAction: request.workflowAction,
            actionResponse: request.actionResponse,
            channels: request.qualifiedChannels
        }).then(success => {
            response.success.channels = success;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    }
};
