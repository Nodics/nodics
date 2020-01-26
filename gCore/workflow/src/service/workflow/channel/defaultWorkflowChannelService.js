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


    getQalifiedChannel: function (actionResponse, workflowAction) {
        return new Promise((resolve, reject) => {
            let rawChannels = [];
            if (workflowAction.isLeafAction) {
                rawChannels.push(workflowAction.successChannel);
                rawChannels = rawChannels.concat(workflowAction.channels || []);
            } else {
                rawChannels = rawChannels.concat(workflowAction.channels);
            }
            this.evaluateChannels(rawChannels, actionResponse).then(qualifiedChannels => {
                resolve(qualifiedChannels);
            }).catch(error => {
                reject(error);
            });
        });
    },

    evaluateChannels: function (rawChannels, actionResponse, qualifiedChannels = []) {
        return new Promise((resolve, reject) => {
            if (rawChannels && rawChannels.length > 0) {
                let channel = rawChannels.shift();
                SERVICE.DefaultPipelineService.start('executeChannelQualifierPipeline', {
                    actionResponse: actionResponse,
                    channel: channel
                }, {}).then(success => {
                    if (success) {
                        qualifiedChannels.push(channel);
                    }
                    this.evaluateChannels(rawChannels, actionResponse, qualifiedChannels).then(qualifiedChannels => {
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
                    if (response.success && response.result.length > 0) {
                        resolve(response.result);
                    } else {
                        reject('Invalid channels, could not found any channels for: ' + channelCodes);
                    }
                }).catch(error => {
                    reject(error);
                });
            }
        });
    },

    executeChannels: function (request) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('executeChannelsPipeline', {
                tenant: request.tenant,
                itemCode: request.itemCode,
                workflowItem: request.workflowItem,
                workflowHead: request.workflowHead,
                workflowAction: request.workflowAction,
                actionResponse: request.actionResponse,
                channels: request.qualifiedChannels
            }, {}).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
            });
        });
    },

    executeChannel: function (request) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('executeChannelsPipeline', {
                tenant: request.tenant,
                workflowItem: request.workflowItem,
                workflowHead: request.workflowHead,
                workflowAction: request.workflowAction,
                actionResponse: request.actionResponse,
                channel: request.channel
            }, {}).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
            });
        });
    },
};