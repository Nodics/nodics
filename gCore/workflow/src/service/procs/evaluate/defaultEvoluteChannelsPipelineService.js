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
            process.error(request, response, 'Invalid request, tenant can not be null or empty');
        } else if (!request.itemCode && !request.workflowItem) {
            process.error(request, response, 'Invalid request, workflow item detail can not be null or empty');
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
    validateOperation: function (request, response, process) {
        let workflowItem = request.workflowItem;
        if (workflowItem.workflowHead.code !== request.workflowHead.code) {
            process.error(request, response, 'Invalid request, workflow head mismatch, for item ' + workflowItem.code + ' with workflow head: ' + request.workflowHead.code);
        } else if (workflowItem.activeAction.code !== request.workflowAction.code) {
            process.error(request, response, 'Invalid request, workflow action mismatch, for item ' + workflowItem.code + ' with workflow head: ' + request.workflowAction.code);
        } else if (!request.actionResponse) {
            process.error(request, response, 'Invalid request, action response can not be null or empty');
        } else {
            process.nextSuccess(request, response);
        }
    },
    evaluateChannels: function (request, response, process) {
        this.LOG.debug('Starting channel evaluation process');
        SERVICE.DefaultWorkflowChannelService.getQalifiedChannel(request.actionResponse, request.workflowAction).then(qualifiedChannels => {
            if (!qualifiedChannels || qualifiedChannels.length <= 0) {
                process.error(request, response, 'None channels have bee qualified for this action');
            } else {
                request.qualifiedChannels = qualifiedChannels;
                request.qualifiedChannels.forEach(channel => {
                    if (!request.actionResponse.channels) request.actionResponse.channels = [];
                    request.actionResponse.channels.push(channel.code);
                });
                process.nextSuccess(request, response);
            }
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    updateActionResponse: function (request, response, process) {
        SERVICE.DefaultActionResponseService.save({
            tenant: request.tenant,
            models: [request.actionResponse]
        }).then(success => {
            if (success.result && success.result.length > 0) {
                request.actionResponse = success.result[0];
            }
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
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    }
};
