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
    * This function is used to evaluate associated channels and process them
    * @param {*} request 
    */
    processChannels: function (request) {
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultPipelineService.start('evaluateChannelsPipeline', {
                    tenant: request.tenant,
                    itemCode: request.itemCode,
                    workflowItem: request.workflowItem,
                    workflowHead: request.workflowHead,
                    workflowAction: request.workflowAction,
                    actionResponse: request.actionResponse
                }, {}).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.WorkflowError('Facing issue while initializing init item process'));
            }
        });
    },

    getQalifiedChannel: function (request) {
        return new Promise((resolve, reject) => {
            let workflowAction = request.workflowAction;
            let rawChannels = [];
            if (workflowAction.position === ENUMS.WorkflowActionPosition.LEAF.key) {
                rawChannels.push(workflowAction.successChannel);
                rawChannels.push(workflowAction.errorChannel);
            }
            rawChannels = rawChannels.concat(workflowAction.channels || []);
            this.evaluateChannels(rawChannels, request).then(qualifiedChannels => {
                if (qualifiedChannels.length <= 0 && workflowAction.position !== ENUMS.WorkflowActionPosition.END.key) {
                    reject(new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid channels configuration: either no channels or not qualified for action: ' + workflowAction.code));
                } else {
                    resolve(qualifiedChannels);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    evaluateChannels: function (rawChannels, request, qualifiedChannels = []) {
        return new Promise((resolve, reject) => {
            if (rawChannels && rawChannels.length > 0) {
                let channel = rawChannels.shift();
                SERVICE.DefaultPipelineService.start('executeChannelQualifierPipeline', {
                    tenant: request.tenant,
                    workflowItem: request.workflowItem,
                    workflowHead: request.workflowHead,
                    workflowAction: request.workflowAction,
                    actionResponse: request.actionResponse,
                    channel: channel
                }, {}).then(success => {
                    if (success) {
                        qualifiedChannels.push(channel);
                    }
                    this.evaluateChannels(rawChannels, request, qualifiedChannels).then(qualifiedChannels => {
                        resolve(qualifiedChannels);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(qualifiedChannels);
            }
        });
    },

    getChannels: function (request) {
        return new Promise((resolve, reject) => {
            if (request.channels && request.channels.length > 0) {
                resolve(request.channels);
            } else {
                let channelCodes = request.actionResponse.channels;
                this.get({
                    tenant: request.tenant,
                    query: {
                        code: {
                            $in: channelCodes
                        }
                    }
                }).then(response => {
                    if (response.result && response.result.length > 0) {
                        resolve(response.result);
                    } else {
                        reject(new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid channels, could not found any channels for: ' + channelCodes));
                    }
                }).catch(error => {
                    reject(error);
                });
            }
        });
    },

    executeChannels: function (request) {
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultPipelineService.start('executeChannelsPipeline', {
                    tenant: request.tenant,
                    itemCode: request.itemCode,
                    workflowItem: request.workflowItem,
                    workflowHead: request.workflowHead,
                    workflowAction: request.workflowAction,
                    actionResponse: request.actionResponse,
                    channels: request.channels
                }, {}).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.WorkflowError('Facing issue while initializing init item process'));
            }
        });
    },

    executeChannel: function (request) {
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultPipelineService.start('executeChannelPipeline', {
                    tenant: request.tenant,
                    workflowItem: request.workflowItem,
                    workflowHead: request.workflowHead,
                    workflowAction: request.workflowAction,
                    actionResponse: request.actionResponse,
                    channel: request.channel,
                    splitItem: request.splitItem
                }, {}).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.WorkflowError('Facing issue while initializing init item process'));
            }
        });
    }
};