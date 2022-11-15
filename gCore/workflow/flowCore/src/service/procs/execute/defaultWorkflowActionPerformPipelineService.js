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
        this.LOG.debug('Validating request to perform workflow action');
        if (!request.authData || UTILS.isBlank(request.authData)) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, authorization data can not null or empty'));
        } else if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    validateOperation: function (request, response, process) {
        let workflowCarrier = request.workflowCarrier;
        if (!SERVICE.DefaultWorkflowUtilsService.isProcessingAllowed(request.workflowCarrier)) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, Current state not allowed to be execute'));
        } else if (workflowCarrier.activeHead !== request.workflowHead.code) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflow head mismatch, for item ' + workflowCarrier.code + ' with workflow head: ' + request.workflowHead.code));
        } else if (workflowCarrier.activeAction.code !== request.workflowAction.code) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflow action mismatch, for item ' + workflowCarrier.code + ' with workflow head: ' + request.workflowAction.code));
        } else if ((workflowCarrier.activeAction.type === ENUMS.WorkflowActionType.MANUAL.key ||
            workflowCarrier.activeAction.type === ENUMS.WorkflowActionType.PARALLEL.key) &&
            (!request.actionResponse || UTILS.isBlank(request.actionResponse))) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, action response can not be null or empty'));
        } else if ((request.workflowAction.type != ENUMS.WorkflowActionType.AUTO.key) &&
            (request.authData.userGroups.filter(userGroup => request.workflowAction.accessGroups.includes(userGroup)).length <= 0)) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_AUTH_00003', 'Current action: ' + request.workflowAction.code + ' not accessible for this user'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    preUpdateCarrier: function (request, response, process) {
        this.LOG.debug('Carrier started processing');
        if (request.workflowCarrier.currentState.state != ENUMS.WorkflowCarrierState.PROCESSING.key) {
            let carrierState = {
                state: ENUMS.WorkflowCarrierState.PROCESSING.key,
                action: request.workflowAction.code,
                time: new Date(),
                description: 'Pushing carrier to processing state'
            };
            request.workflowCarrier.currentState = carrierState;
            request.workflowCarrier.states.push(carrierState);
            request.workflowCarrier.activeAction.state = ENUMS.WorkflowActionState.PROCESSING.key;
        }
        process.nextSuccess(request, response);
    },
    handleManualAction: function (request, response, process) {
        if ((request.workflowAction.type === ENUMS.WorkflowActionType.MANUAL.key ||
            request.workflowAction.type === ENUMS.WorkflowActionType.PARALLEL.key) &&
            request.workflowCarrier.activeAction.state !== ENUMS.WorkflowActionState.FINISHED.key) {
            if (!request.actionResponse) {
                process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, action response can not be null or empty'));
            } else {
                process.nextSuccess(request, response);
            }
        } else {
            process.nextSuccess(request, response);
        }
    },
    handleAutoAction: function (request, response, process) {
        if ((request.workflowAction.type === ENUMS.WorkflowActionType.AUTO.key ||
            request.workflowAction.type === ENUMS.WorkflowActionType.PARALLEL.key) &&
            request.workflowCarrier.activeAction.state !== ENUMS.WorkflowActionState.FINISHED.key) {
            if (request.workflowAction.handler) {
                response.targetNode = 'executeActionHandler';
                process.nextSuccess(request, response);
            } else if (request.workflowAction.script) {
                response.targetNode = 'executeActionScript';
                process.nextSuccess(request, response);
            } else {
                process.error(request, response, 'Invalid action, AUTO action should have handler or script');
            }
        } else {
            process.nextSuccess(request, response);
        }
    },
    executeActionHandler: function (request, response, process) {
        SERVICE.DefaultPipelineService.start('executeActionHandlerPipeline', {
            tenant: request.tenant,
            authData: request.authData,
            workflowHead: request.workflowHead,
            workflowAction: request.workflowAction,
            workflowCarrier: request.workflowCarrier,
            actionResponse: request.actionResponse
        }, {}).then(success => {
            response.success[request.workflowAction.code] = success
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    executeActionScript: function (request, response, process) {
        SERVICE.DefaultPipelineService.start('executeActionScriptPipeline', {
            tenant: request.tenant,
            authData: request.authData,
            workflowHead: request.workflowHead,
            workflowAction: request.workflowAction,
            workflowCarrier: request.workflowCarrier,
            actionResponse: request.actionResponse
        }, {}).then(success => {
            response.success[request.workflowAction.code] = success
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    createStepResponse: function (request, response, process) {
        let actionResponse = response.success[request.workflowAction.code];
        actionResponse = _.merge(
            _.merge(actionResponse || {}, request.actionResponse || {}), {
            workflowCode: request.workflowHead.code,
            actionCode: request.workflowAction.code,
            carrierCode: request.workflowCarrier.code,
            originalCode: request.workflowCarrier.originalCode || request.workflowCarrier.code,
        });
        actionResponse.type = actionResponse.type || ENUMS.WorkflowActionResponseType.SUCCESS.key;
        response.success[request.workflowAction.code] = actionResponse;
        process.nextSuccess(request, response);
    },
    validateActionResponse: function (request, response, process) {
        let actionResponse = response.success[request.workflowAction.code];
        if (!actionResponse.decision) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Decision value can not be null or empty'));
        } else if (request.workflowAction.allowedDecisions && !request.workflowAction.allowedDecisions.includes(actionResponse.decision)) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid decision value, action don not allow value: ' + response.actionResponse.decision));
        } else {
            process.nextSuccess(request, response);
        }
    },
    updatePostCarrierState: function (request, response, process) {
        let actionResponse = response.success[request.workflowAction.code];
        if (actionResponse.type === ENUMS.WorkflowActionResponseType.ERROR.key) {
            let carrierState = {
                state: ENUMS.WorkflowCarrierState.ERROR.key,
                action: request.workflowAction.code,
                time: new Date(),
                description: 'Action performed with errors'
            };
            request.workflowCarrier.currentState = carrierState;
            request.workflowCarrier.states.push(carrierState);
            request.workflowCarrier.activeAction.state = ENUMS.WorkflowActionState.ERROR.key;
            response.success.messages.push('Item: ' + (request.workflowCarrier.code || request.workflowCarrier._id) + ' been set to error @: ' + new Date());
        } else {
            request.workflowCarrier.activeAction.state = ENUMS.WorkflowActionState.FINISHED.key;
            response.success.messages.push('Item: ' + (request.workflowCarrier.code || request.workflowCarrier._id) + ' been set to finished @: ' + new Date());
        }
        request.workflowCarrier.activeAction.actionResponse = actionResponse
        process.nextSuccess(request, response);
    },
    evaluateChannels: function (request, response, process) {
        let actionResponse = response.success[request.workflowAction.code];
        SERVICE.DefaultPipelineService.start('evaluateChannelsPipeline', {
            tenant: request.tenant,
            authData: request.authData,
            workflowHead: request.workflowHead,
            workflowAction: request.workflowAction,
            workflowCarrier: request.workflowCarrier,
            actionResponse: actionResponse
        }, {}).then(success => {
            response.success[request.workflowAction.code].qualifiedChannels = success.qualifiedChannels;
            response.success.messages = response.success.messages.concat(success.messages || []);
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    updateActionResponse: function (request, response, process) {
        let actionResponse = response.success[request.workflowAction.code];
        SERVICE.DefaultActionResponseService.save({
            tenant: request.tenant,
            model: actionResponse
        }).then(success => {
            response.success[request.workflowAction.code] = actionResponse = success.result;
            response.success.messages.push('Item: ' + (request.workflowCarrier.activeAction.code) + ', action response saved @: ' + new Date());
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    updateWorkflowCarrier: function (request, response, process) {
        let actionResponse = response.success[request.workflowAction.code];
        if (!request.workflowCarrier.actions) request.workflowCarrier.actions = [];
        if (actionResponse.type === ENUMS.WorkflowActionResponseType.ERROR.key) {
            if (!request.workflowCarrier.errors) request.workflowCarrier.errors = [];
            request.workflowCarrier.errors.push((new CLASSES.WorkflowError(request.actionResponse.feedback.error || request.actionResponse.feedback.message)).toJson());
        }
        request.workflowCarrier.actions.push({
            code: request.workflowAction.code,
            responseId: actionResponse._id,
            decision: actionResponse.decision,
            feedback: actionResponse.feedback
        });
        SERVICE.DefaultWorkflowCarrierService.save({
            tenant: request.tenant,
            options: {
                recursive: true
            },
            model: request.workflowCarrier
        }).then(success => {
            response.success.workflowCarrier = request.workflowCarrier = success.result;
            response.success.messages.push('Carrier: ' + (request.workflowCarrier.code || request.workflowCarrier._id) + ', updated and saved @: ' + new Date());
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    validateEndAction: function (request, response, process) {
        let actionResponse = response.success[request.workflowAction.code];
        let qualifiedChannels = actionResponse.qualifiedChannels;
        if (qualifiedChannels.length <= 0 && request.workflowAction.position === ENUMS.WorkflowActionPosition.END.key) {
            response.success.messages.push('Action: ' + request.workflowAction.code + ' is END node');
            process.stop(request, response, response.success);
        } else {
            process.nextSuccess(request, response);
        }
    },
    prepareChannelRequests: function (request, response, process) {
        let actionResponse = response.success[request.workflowAction.code];
        SERVICE.DefaultPipelineService.start('prepareChannelRequestsPipeline', {
            tenant: request.tenant,
            authData: request.authData,
            workflowHead: request.workflowHead,
            workflowAction: request.workflowAction,
            workflowCarrier: request.workflowCarrier,
            actionResponse: actionResponse
        }, {}).then(success => {
            response.channelRequests = success.channelRequests;
            response.success.messages = response.success.messages.concat(success.messages || []);
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    executeChannels: function (request, response, process) {
        let channelRequests = response.channelRequests;
        this.walkThroughChannels(channelRequests, request, response).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    walkThroughChannels: function (channelRequests, request, response) {
        return new Promise((resolve, reject) => {
            if (channelRequests && channelRequests.length > 0) {
                let channelRequest = channelRequests.shift();
                SERVICE.DefaultPipelineService.start('nextWorkflowActionPipeline', {
                    tenant: request.tenant,
                    authData: request.authData,
                    workflowCarrier: channelRequest.workflowCarrier,
                    actionCode: channelRequest.channel.target
                }, {}).then(success => {
                    response.success.messages = response.success.messages.concat(success.messages || []);
                    response.success.workflowCarrier = success.workflowCarrier || request.workflowCarrier
                    delete success.messages;
                    delete success.workflowCarrier;
                    _.merge(response.success, success);
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
}