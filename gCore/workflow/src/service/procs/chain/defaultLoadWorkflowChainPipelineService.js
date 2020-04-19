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

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating request to load workflow action');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else if (!request.authData || UTILS.isBlank(request.authData)) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, authorization data can not null or empty'));
        } else if (!request.workflowCode) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflowCode can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadWorkflowAction: function (request, response, process) {
        SERVICE.DefaultWorkflowActionService.getWorkflowAction(request.workflowCode, request.tenant).then(workflowAction => {
            response.success = workflowAction;
            if (!request.loadedActions) request.loadedActions = [];
            request.loadedActions.push(workflowAction.code);
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    checkAccess: function (request, response, process) {
        let workflowAction = response.success;
        if (request.authData.userGroups.filter(userGroup => workflowAction.userGroupCodes.includes(userGroup)).length > 0) {
            workflowAction.access = true;
        } else {
            workflowAction.access = false;
        }
        process.nextSuccess(request, response);
    },
    loadChannelDetail: function (request, response, process) {
        let workflowAction = response.success;
        let channels = workflowAction.channels;
        let finalChannels = [];
        if (channels && channels.length > 0) {
            let tmpChannels = [];
            channels.forEach(channel => {
                if (UTILS.isObject(channel)) {
                    finalChannels.push(channel);
                } else {
                    tmpChannels.push(channel);
                }
            });
            if (tmpChannels.length > 0) {
                SERVICE.DefaultWorkflowChannelService.get({
                    tenant: request.tenant,
                    query: {
                        code: {
                            $in: tmpChannels
                        }
                    }
                }).then(success => {
                    if (success && success.result && success.result.length > 0) {
                        success.result.forEach(rChannels => {
                            finalChannels.push(rChannels);
                        });
                        workflowAction.channels = finalChannels;
                        process.nextSuccess(request, response);
                    } else {
                        process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'could not load channels for: ' + tmpChannels));
                    }
                }).catch(error => {
                    process.error(request, response, error);
                });
            } else {
                process.nextSuccess(request, response);
            }
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadChannelsAction: function (request, response, process) {
        let workflowAction = response.success;
        if (workflowAction.channels && workflowAction.channels.length > 0) {
            this.loadNextAction(request, workflowAction.channels, 0).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadNextAction(request, channels, counter) {
        return new Promise((resolve, reject) => {
            if (counter < channels.length) {
                let channel = channels[counter];
                if (channel.target) {
                    if (!request.loadedActions.includes(channel.target)) {
                        SERVICE.DefaultPipelineService.start('loadWorkflowChainPipeline', {
                            tenant: request.tenant,
                            authData: request.authData,
                            workflowCode: channel.target,
                            loadedActions: request.loadedActions
                        }, {}).then(success => {
                            channel.targetAction = success;
                            this.loadNextAction(request, channels, ++counter).then(success => {
                                resolve(true);
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        channel.targetAction = 'Please refer already loaded action';
                        resolve(true);
                    }
                } else {
                    reject(new CLASSES.WorkflowError('ERR_WF_00000', 'Channel is not in proper format'));
                }
            } else {
                resolve(true);
            }
        });
    },
};
