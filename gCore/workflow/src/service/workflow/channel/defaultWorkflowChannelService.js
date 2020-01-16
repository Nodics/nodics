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

    getQalifiedChannel: function (workflowAction, actionResponse) {
        return new Promise((resolve, reject) => {
            let rawChannels = [];
            if (workflowAction.isLeafAction) {
                rawChannels.push(workflowAction.successChannel);
                rawChannels = rawChannels.concat(workflowAction.channels || []);
            } else {
                rawChannels = workflowAction.channels;
            }
            let channels = [];
            this.evaluateChannels(workflowAction.channels, actionResponse, channels).then(success => {
                resolve(channels);
            }).catch(error => {
                reject(error);
            });
        });
    },

    evaluateChannels: function (rawChannels, actionResponse, channels) {
        return new Promise((resolve, reject) => {
            if (rawChannels && rawChannels.length > 0) {
                let channel = rawChannels.shift();
                SERVICE.DefaultPipelineService.start('evaluateChannelsPipeline', {
                    actionResponse: actionResponse,
                    channel: channel
                }, {}).then(success => {
                    if (success) {
                        channels.push(channel);
                    }
                    this.evaluateChannels(rawChannels, actionResponse, channels).then(channel => {
                        resolve(true);
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
    },

    executeQualifiedChannels: function (request) {
        return new Promise((resolve, reject) => {
            reject(true);
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