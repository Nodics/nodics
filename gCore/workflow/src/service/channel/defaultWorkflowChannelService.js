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


    getQalifiedChannel: function (itemResponses, workflowAction, qualifiedChannels = {}) {
        return new Promise((resolve, reject) => {
            if (!rawChannels) {
                rawChannels = [];
                if (workflowAction.isLeafAction) {
                    rawChannels.push(workflowAction.successChannel);
                    rawChannels = rawChannels.concat(workflowAction.channels || []);
                } else {
                    rawChannels = rawChannels.concat(workflowAction.channels);
                }
            }
            if (itemResponses && itemResponses.length > 0) {
                let itemResponse = itemResponses.shift();
                this.evaluateChannels(rawChannels, itemResponse).then(channels => {
                    qualifiedChannels[itemResponse.code] = channels;
                    this.getQalifiedChannel(itemsResponses, request.workflowAction).then(qualifiedChannels => {
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

    evaluateChannels: function (rawChannels, itemResponse, channels = []) {
        return new Promise((resolve, reject) => {
            if (rawChannels && rawChannels.length > 0) {
                let channel = rawChannels.shift();
                SERVICE.DefaultPipelineService.start('evaluateChannelsPipeline', {
                    itemResponse: itemResponse,
                    channel: channel
                }, {}).then(success => {
                    if (success) {
                        channels.push(channel);
                    }
                    this.evaluateChannels(rawChannels, itemResponse, channels).then(channels => {
                        resolve(channels);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(channels);
            }
        });
    },


    handleSuccessProcess: function (request, response) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('handleWorkflowSuccessPipeline', request, response).then(success => {
                reject(success);
            }).catch(error => {
                reject(error);
            });
        });
    },

    handleErrorProcess: function (request) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('handleWorkflowErrorsPipeline', request, {}).then(success => {
                reject(success);
            }).catch(error => {
                reject(error);
            });
        });
    }
};