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
        response.success = [];
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
            let responseComment = {
                action: 'qualifiedChannels',
                target: request.workflowAction.code,
                item: request.workflowItem.code || request.workflowItem._id,
                timestamp: new Date()
            };
            if (request.qualifiedChannels.length > 0) {
                request.qualifiedChannels.forEach(channel => {
                    if (!request.actionResponse.channels) request.actionResponse.channels = [];
                    request.actionResponse.channels.push(channel.code);
                });
                responseComment.message = 'Qualified channels: ' + request.actionResponse.channels;
            } else {
                responseComment.message = 'This is end action for workflow';
            }
            response.success.push(responseComment);
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    updateActionResponse: function (request, response, process) {
        SERVICE.DefaultActionResponseService.save({
            tenant: request.tenant,
            model: request.actionResponse
        }).then(success => {
            response.success.push({
                action: 'actionResponseUpdated',
                target: request.workflowAction.code,
                item: request.workflowItem.code || request.workflowItem._id,
                timestamp: new Date(),
                message: 'Action response updated: ' + request.actionResponse._id
            });
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    executeChannels: function (request, response, process) {
        this.LOG.debug('Starting channels execution process');
        if (request.qualifiedChannels.length > 0) {
            SERVICE.DefaultWorkflowChannelService.executeChannels({
                tenant: request.tenant,
                workflowItem: request.workflowItem,
                workflowHead: request.workflowHead,
                workflowAction: request.workflowAction,
                actionResponse: request.actionResponse,
                channels: request.qualifiedChannels
            }).then(success => {
                response.success.push(success);
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    }
};
