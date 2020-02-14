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
        if (!request.tenant) {
            process.error(request, response, 'Invalid request, tenant can not be null or empty');
        } else if (!request.channels) {
            process.error(request, response, 'Invalid request, could not found a valid channel');
        } else {
            process.nextSuccess(request, response);
        }
    },
    prepareResponse: function (request, response, process) {
        this.LOG.debug('Preparing response for action execution');
        if (!response.success) response.success = {};
        if (!response.errors) response.errors = {};
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
                    throw new Error('Target error: Multiple channels can not hold same target');
                }
            });
            process.nextSuccess(request, response);
        } catch (error) {
            this.LOG.error(error);
            process.error(request, response, error);
        }
    },
    handleMultiChannelRequest: function (request, response, process) {
        request.channelRequests = {};
        if (request.channels.length > 1) {
            let count = 1;
            request.channels.forEach(channel => {
                let itemCode = request.workflowItem.code + '_' + count++;
                request.channelRequests[itemCode] = {
                    originalCode: request.workflowItem.code,
                    channel: channel
                };
            });
        } else {
            request.channelRequests[request.workflowItem.code] = {
                workflowItem: request.workflowItem,
                originalCode: request.workflowItem.code,
                channel: channels[0]
            };
        }
        process.nextSuccess(request, response);
    },
    createChannelRequest: function (request, response, process) {
        if (request.channelRequests.length > 1) {
            let itemModels = [];
            let workflowItem = _.merge({}, request.workflowItem);
            delete workflowItem._id;
            Object.keys(request.channelRequests).forEach(itemCode => {
                let channelRequest = request.channelRequests[itemCode];
                let itemModel = _.merge({}, workflowItem);
                itemModel.code = itemCode;
                itemModel.originalCode = channelRequest.originalCode;
                itemModels.push(itemModel);
            });
            SERVICE.DefaultWorkflowItemService.save({
                tenant: request.tenant,
                models: [itemModels]
            }).then(success => {
                if (success.success && success.result && success.result.length > 0) {
                    success.result.forEach(newModel => {
                        request.channelRequests[newModel.code].workflowItem = newModel;
                    });
                }
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    triggerChannelExecution: function (request, response, process) {
        this.walkThroughChannels(Object.keys(request.channelRequests), request, response).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    successEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        process.resolve({
            success: true,
            code: 'SUC_SYS_00000',
            msg: SERVICE.DefaultStatusService.get('SUC_SYS_00000').message,
            result: response.success,
            errors: response.error || response.errors
        });
    },
    handleError: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        process.reject({
            success: false,
            code: 'ERR_SYS_00000',
            msg: SERVICE.DefaultStatusService.get('ERR_SYS_00000').message,
            result: response.success,
            errors: response.error || response.errors
        });
    },

    walkThroughChannels: function (itemCodes, request, response) {
        return new Promise((resolve, reject) => {
            if (itemCodes && itemCodes.length > 0) {
                let itemCode = itemCodes.shift();
                let channelRequest = request.channelRequests[itemCode];
                SERVICE.DefaultWorkflowChannelService.executeChannel({
                    tenant: request.tenant,
                    workflowItem: channelRequest.workflowItem,
                    workflowHead: request.workflowHead,
                    workflowAction: request.workflowAction,
                    actionResponse: request.actionResponse,
                    channel: channelRequest.channel
                }).then(success => {
                    response.success[channelRequest.channel.code] = success;
                    this.walkThroughChannels(itemCodes, request, response).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    response.errors[channelRequest.channel.code] = error;
                    this.walkThroughChannels(itemCodes, request, response).then(success => {
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