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
        } else if (!request.workflowItems && !request.itemCode) {
            process.error(request, response, 'Invalid request, could not found a valid item detail');
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadWorkflowHead: function (request, response, process) {
        SERVICE.DefaultWorkflowHeadService.getWorkflowHead(request).then(workflowHead => {
            request.workflowHead = workflowHead;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    loadWorkflowAction: function (request, response, process) {
        SERVICE.DefaultWorkflowActionService.getWorkflowAction(request).then(workflowAction => {
            request.workflowAction = workflowAction;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    handleMultiChannelRequest: function (request, response, process) {
        request.channelRequests = {};
        if (request.channels.length > 1) {
            let count = 1;
            request.channels.forEach(channel => {
                request.channelRequests[channel.code] = {
                    itemCode: request.workflowItem.code + '_' + count++,
                    originalCode: request.workflowItem.code,
                    workflowItem: request.workflowItem,
                    channel: channel
                };
            });
        } else {
            request.channelRequests[channels[0].code] = {
                itemCode: request.workflowItem.code,
                originalCode: request.workflowItem.code,
                workflowItem: request.workflowItem,
                channel: channels[0]
            };
        }
        process.nextSuccess(request, response);
    },
    createChannelRequest: function (request, response, process) {
        request.itemModels = [];
        Object.keys(request.channelRequests).forEach(requestName => {
            let channelRequest = request.channelRequests[requestName];
            let itemModel = channelRequest.workflowItem;
            delete itemModel._id;
            itemModel.code = channelRequest.itemCode;
            itemModel.originalCode = channelRequest.originalCode;
            channelRequest.itemModel = itemModel;
            request.itemModels.push(itemModel);
        });
        if (request.itemModels.length > 1) {
            SERVICE.DefaultWorkflowItemService.save({
                tenant: request.tenant,
                models: [request.itemModels]
            }).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    triggerChannelExecution: function (request, response, process) {
        this.executeChannel(request.channelRequests, request.tenant).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    executeChannel: function (channelRequests, tenant) {
        return new Promise((resolve, reject) => {
            if (channelRequests && channelRequests.length > 0) {
                let channelRequest = channelRequests.shift();
                SERVICE.DefaultPipelineService.start('executeChannelPipeline', {
                    tenant: tenant,
                    workflowItemCode: channelRequest.itemCode,
                    channel: channelRequest.channel
                }, {}).then(success => {
                    this.executeChannel(itemModels).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    }
};
