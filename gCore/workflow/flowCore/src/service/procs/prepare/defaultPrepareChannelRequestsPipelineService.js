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
    prepareResponse: function (request, response, process) {
        this.LOG.debug('Preparing response for action execution');
        if (!response.success) {
            response.success = {
                messages: []
            };
        }
        process.nextSuccess(request, response);
    },
    finalizeChannels: function (request, response, process) {
        let qualifiedChannels = request.actionResponse.qualifiedChannels;
        if (qualifiedChannels.length > 1) {
            let actionsList = request.workflowCarrier.actions.map(action => {
                return action.code;
            });
            let executedChannel = [];
            qualifiedChannels.forEach(channel => {
                if (actionsList && actionsList.includes(channel.target)) {
                    executedChannel.push(channel);
                }
            });
            if (executedChannel.length > 0) {
                request.actionResponse.qualifiedChannels = qualifiedChannels = executedChannel;
            }
            SERVICE.DefaultWorkflowChannelService.get({
                tenant: request.tenant,
                authData: request.authData,
                query: {
                    code: CONFIG.get('workflow').defaultSplitEndChannel || 'defaultSplitEndChannel'
                }
            }).then(success => {
                if (success.result && success.result.length > 0) {
                    response.defaultSplitEndChannel = success.result[0];
                    process.nextSuccess(request, response);
                } else {
                    process.error(request, response, 'Invalid channel, Default split channel not found');
                }
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    prepareChannelsRequest: function (request, response, process) {
        let qualifiedChannels = request.actionResponse.qualifiedChannels;
        response.success.channelRequests = [];
        response.success.channelRequests.push({
            workflowCarrier: request.workflowCarrier,
            workflowHead: request.workflowHead,
            workflowAction: request.workflowAction,
            actionResponse: request.actionResponse,
            channel: (qualifiedChannels.length === 1) ? qualifiedChannels[0] : response.defaultSplitEndChannel
        });
        if (qualifiedChannels.length > 1) {
            for (let count = 0; count < qualifiedChannels.length; count++) {
                let channelItem = _.merge({}, request.workflowCarrier);
                delete channelItem._id;
                channelItem.originalCode = channelItem.code;
                channelItem.code = channelItem.code + '_' + count;
                channelItem.items = channelItem.items.map((wfItem, index) => {
                    delete wfItem._id;
                    return _.merge(wfItem, {
                        originalCode: wfItem.code,
                        code: wfItem.code + '_' + count + '_' + index,
                        refId: wfItem.refId
                    });
                });
                response.success.channelRequests.push({
                    workflowCarrier: channelItem,
                    workflowHead: request.workflowHead,
                    workflowAction: request.workflowAction,
                    actionResponse: request.actionResponse,
                    channel: qualifiedChannels[count]
                });
            }
        }
        process.nextSuccess(request, response);
    },
};
