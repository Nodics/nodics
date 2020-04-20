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
        } else if (!request.workflowCode && !request.query) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflowCode and query both can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    buildQuery: function (request, response, process) {
        if (!request.options) request.options = {};
        //request.options.recursive = request.options.recursive || true;
        if (request.workflowCode) {
            request.query = {
                code: request.workflowCode
            };
        }
        if (!request.loadedActions) request.loadedActions = [];
        process.nextSuccess(request, response);
    },
    loadWorkflowAction: function (request, response, process) {
        SERVICE.DefaultWorkflowActionService.get({
            tenant: request.tenant,
            options: request.options,
            query: request.query
        }).then(success => {
            try {
                if (success && success.result && success.result.length > 0) {
                    success.result.forEach(workflowAction => {
                        if (request.loadHead && workflowAction.position != ENUMS.WorkflowActionPosition.HEAD.key) {
                            throw new CLASSES.WorkflowError('Invalid workflowHead for: ' + workflowAction.code);
                        }
                        request.loadedActions.push(workflowAction.code);
                    });
                    request.loadHead = false;
                    response.success = success.result;
                    process.nextSuccess(request, response);
                } else {
                    process.error(request, response, new CLASSES.WorkflowError('invalid query, could not found any item for query:' + JSON.stringify(request.query)));
                }
            } catch (error) {
                process.error(request, response, error);
            }
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    checkAccess: function (request, response, process) {
        response.success.forEach(workflowAction => {
            if (request.authData.userGroups.filter(userGroup => workflowAction.userGroupCodes.includes(userGroup)).length > 0) {
                workflowAction.access = true;
            } else {
                workflowAction.access = false;
            }
        });
        process.nextSuccess(request, response);
    },
    loadChannelDetail: function (request, response, process) {
        let workflowActions = response.success;
        this.validateActionsForChannelDetail(request, workflowActions).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    validateActionsForChannelDetail: function (request, workflowActions, counter = 0) {
        return new Promise((resolve, reject) => {
            if (counter < workflowActions.length) {
                let workflowAction = workflowActions[counter];
                if (workflowAction.channels && workflowAction.channels.length > 0) {
                    let finalChannels = [], pendingChannels = [];
                    workflowAction.channels.forEach(channel => {
                        if (UTILS.isObject(channel)) {
                            finalChannels.push(channel);
                        } else {
                            pendingChannels.push(channel);
                        }
                    });
                    if (pendingChannels.length > 0) {
                        this.fatchChannelDetail(request, workflowAction, pendingChannels, finalChannels).then(success => {
                            this.validateActionsForChannelDetail(request, workflowActions, ++counter).then(success => {
                                resolve(true);
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        this.validateActionsForChannelDetail(request, workflowActions, ++counter).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }
                } else {
                    this.validateActionsForChannelDetail(request, workflowActions, ++counter).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }
            } else {
                resolve(true);
            }
        });
    },
    fatchChannelDetail: function (request, workflowAction, pendingChannels, finalChannels) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultWorkflowChannelService.get({
                tenant: request.tenant,
                query: {
                    code: {
                        $in: pendingChannels
                    }
                }
            }).then(success => {
                if (success && success.result && success.result.length > 0) {
                    success.result.forEach(rChannels => {
                        finalChannels.push(rChannels);
                    });
                    workflowAction.channels = finalChannels;
                    resolve(true);
                } else {
                    reject(new CLASSES.WorkflowError('ERR_WF_00003', 'could not load channels for: ' + tmpChannels));
                }
            }).catch(error => {
                reject(error);
            });
        });
    },
    loadChannelsAction: function (request, response, process) {
        this.validateActionsForChannelTarget(request, response.success).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    validateActionsForChannelTarget: function (request, workflowActions, counter = 0) {
        return new Promise((resolve, reject) => {
            if (counter < workflowActions.length) {
                let workflowAction = workflowActions[counter];
                this.loadNextAction(request, workflowAction.channels).then(success => {
                    this.validateActionsForChannelTarget(request, workflowActions, ++counter).then(success => {
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

    loadNextAction(request, channels, counter = 0) {
        return new Promise((resolve, reject) => {
            if (channels && counter < channels.length) {
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
