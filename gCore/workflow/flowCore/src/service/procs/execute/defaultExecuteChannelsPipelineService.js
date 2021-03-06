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
     * This pipeline process can be executed either via last executed action after assiging an item to action if it is AUTO, or via API if it is MANUAL. 
     * In case of AUTO workflowCarrier object will be mandate and for manual, carrierCode and response will be mandate. Here response is what business
     * have thier comments for the action
     * @param {*} request 
     * @param {*} response 
     * @param {*} process 
     */
    validateRequest: function (request, response, process) {
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else if (!request.channels) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, could not found a valid channel'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    prepareResponse: function (request, response, process) {
        this.LOG.debug('Preparing response for action execution');
        if (!response.success) response.success = {};
        process.nextSuccess(request, response);
    },
    loadActionResponse: function (request, response, process) {
        SERVICE.DefaultWorkflowActionResponseService.getActionResponse(request).then(actionResponse => {
            request.actionResponse = actionResponse;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    loadChannels: function (request, response, process) {
        SERVICE.DefaultWorkflowChannelService.getChannels(request).then(channels => {
            request.channels = channels;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    validateChannels: function (request, response, process) {
        let targets = [];
        try {
            request.channels.forEach(channel => {
                if (targets.includes(channel.target)) {
                    throw new CLASSES.WorkflowError('Target error: Multiple channels can not hold same target');
                }
            });
            process.nextSuccess(request, response);
        } catch (error) {
            process.error(request, response, error);
        }
    },
    finalizeChannels: function (request, response, process) {
        if (request.channels.length > 1) {
            let executedChannel = [];
            let actionsList = request.workflowCarrier.actions.map(action => {
                return action.code;
            });
            request.channels.forEach(channel => {
                if (actionsList && actionsList.includes(channel.target)) {
                    executedChannel.push(channel);
                }
            });
            if (executedChannel.length > 0) {
                request.channels = executedChannel;
            }
            SERVICE.DefaultWorkflowChannelService.get({
                tenant: request.tenant,
                query: {
                    code: CONFIG.get('workflow').defaultSplitEndChannel || 'defaultSplitEndChannel'
                }
            }).then(success => {
                if (success.result && success.result.length > 0) {
                    request.defaultSplitEndChannel = success.result[0];
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
    handleMultiChannelRequest: function (request, response, process) {
        request.channelRequests = [];
        request.channelRequests.push({
            tenant: request.tenant,
            authData: request.authData,
            workflowCarrier: request.workflowCarrier,
            workflowHead: request.workflowHead,
            workflowAction: request.workflowAction,
            actionResponse: request.actionResponse,
            channel: (request.channels.length === 1) ? request.channels[0] : request.defaultSplitEndChannel
        });
        if (request.channels.length > 1) {
            for (let count = 0; count < request.channels.length; count++) {
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
                request.channelRequests.push({
                    tenant: request.tenant,
                    authData: request.authData,
                    workflowCarrier: channelItem,
                    workflowHead: request.workflowHead,
                    workflowAction: request.workflowAction,
                    actionResponse: request.actionResponse,
                    channel: request.channels[count]
                });
            }
        }
        process.nextSuccess(request, response);
    },
    triggerItemSplitEvent: function (request, response, process) {
        let eventConfig = SERVICE.DefaultWorkflowUtilsService.getEventConfiguration(request.workflowAction, request.workflowCarrier);
        if (eventConfig.enabled) {
            try {
                this.LOG.debug('Pushing event for item split : ' + request.workflowCarrier.activeAction.code);
                let event = {
                    tenant: request.tenant,
                    event: 'channelsEvaluated',
                    type: eventConfig.type || CONFIG.get('workflow').defaultEventType,
                    data: {
                        qualifiedChannels: request.channels.map(channel => {
                            return {
                                code: channel.code,
                                decision: channel.qualifier.decision
                            };
                        }),
                    }
                };
                if (request.channelRequests.length > 1) {
                    event.data.splitData = {};
                    request.channelRequests.forEach(channelRequest => {
                        let carrier = channelRequest.workflowCarrier;
                        if (carrier.code != request.workflowCarrier.code) {
                            event.data.splitData[carrier.code] = carrier.items.map(wfItem => {
                                return {
                                    code: wfItem.code,
                                    originalCode: wfItem.originalCode,
                                    refId: wfItem.refId,
                                };
                            });
                        }
                    });
                }
                SERVICE.DefaultWorkflowEventService.publishEvent(event, request.workflowAction, request.workflowCarrier).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
            } catch (error) {
                process.error(request, response, error);
            }
        } else {
            process.nextSuccess(request, response);
        }
    },
    triggerChannelExecution: function (request, response, process) {
        this.walkThroughChannels(request.channelRequests, request, response).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    walkThroughChannels: function (channelRequests, request, response) {
        return new Promise((resolve, reject) => {
            if (channelRequests && channelRequests.length > 0) {
                let channelRequest = channelRequests.shift();
                SERVICE.DefaultWorkflowChannelService.executeChannel(channelRequest).then(success => {
                    response.success[channelRequest.channel.code] = success;
                    this.walkThroughChannels(channelRequests, request, response).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    if (!(error instanceof CLASSES.NodicsError)) {
                        error = new CLASSES.WorkflowError(error);
                    }
                    response.success[channelRequest.channel.code] = error.toJson();
                    this.walkThroughChannels(channelRequests, request, response).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                });
            } else {
                resolve(true);
            }
        });
    }
};
