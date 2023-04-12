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
        if (!request.tenant || !request.authData) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, mandate data can not be null or empty'));
        } else if (!request.carrierCode && !request.workflowCarrier) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflow item detail can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadActionResponse: function (request, response, process) {
        if (!request.actionResponse) {
            SERVICE.DefaultWorkflowActionResponseService.getActionResponse(request).then(actionResponse => {
                request.actionResponse = actionResponse;
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    validateOperation: function (request, response, process) {
        let workflowCarrier = request.workflowCarrier;
        if (workflowCarrier.activeHead !== request.workflowHead.code) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflow head mismatch, for item ' + workflowCarrier.code + ' with workflow head: ' + request.workflowHead.code));
        } else if (workflowCarrier.activeAction.code !== request.workflowAction.code) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflow action mismatch, for item ' + workflowCarrier.code + ' with workflow head: ' + request.workflowAction.code));
        } else if (!request.actionResponse) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, action response can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    evaluateChannels: function (request, response, process) {
        this.LOG.debug('Starting channel evaluation process');
        SERVICE.DefaultWorkflowChannelService.getQalifiedChannels({
            tenant: request.tenant,
            authData: request.authData,
            workflowCarrier: request.workflowCarrier,
            workflowHead: request.workflowHead,
            workflowAction: request.workflowAction,
            actionResponse: request.actionResponse
        }).then(qualifiedChannels => {
            response.success.qualifiedChannels = qualifiedChannels
            let channels = [];
            qualifiedChannels.forEach(channel => {
                channels.push(channel.code);
            });
            response.success.messages.push('Qualified channels: ' + channels + ' @: ' + new Date());
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    validateChannels: function (request, response, process) {
        let qualifiedChannels = response.success.qualifiedChannels;
        let targets = [];
        try {
            qualifiedChannels.forEach(channel => {
                if (targets.includes(channel.target)) {
                    throw new CLASSES.WorkflowError('Target error: Multiple channels can not hold same target');
                } else {
                    targets.push(channel.target);
                }
            });
            process.nextSuccess(request, response);
        } catch (error) {
            process.error(request, response, error);
        }
    }
};
