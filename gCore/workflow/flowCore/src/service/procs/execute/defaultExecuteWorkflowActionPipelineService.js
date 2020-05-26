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
    updateCarrier: function (request, response, process) {
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
        }
        request.workflowCarrier.activeAction.state = ENUMS.WorkflowActionState.PROCESSING.key;
        process.nextSuccess(request, response);
    },
    prepareResponse: function (request, response, process) {
        this.LOG.debug('Preparing response for action execution');
        response.success = {};
        process.nextSuccess(request, response);
    },
    preActionInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowAction.code);
        if (interceptors && interceptors.preAction) {
            this.LOG.debug('Applying preAction interceptors for workflow action execution');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.preAction), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed action interceptors', 'ERR_WF_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    preActionValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.workflowAction.code);
        if (validators && validators.preAction) {
            this.LOG.debug('Applying preAction validators for workflow action execution');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.preAction), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed action validators', 'ERR_WF_00005'));
            });
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
    markActionExecuted: function (request, response, process) {
        request.workflowCarrier.activeAction.state = ENUMS.WorkflowActionState.FINISHED.key;
        if (!response.success.messages) response.success.messages = [];
        response.success.messages.push('Action performed and marked as done!');
        process.nextSuccess(request, response);
    },
    createStepResponse: function (request, response, process) {
        request.actionResponse = _.merge(
            _.merge(response.success.actionResponse || {}, request.actionResponse || {}), {
            carrierCode: request.workflowCarrier.code,
            originalCode: request.workflowCarrier.originalCode,
            workflowCode: request.workflowHead.code,
            actionCode: request.workflowAction.code
        });
        request.actionResponse.type = request.actionResponse.type || ENUMS.WorkflowActionResponseType.SUCCESS.key;
        delete response.success.actionResponse;
        response.success.messages.push('Decision: ' + request.actionResponse.decision + ' been finalized');
        response.success.decision = request.actionResponse.decision;
        process.nextSuccess(request, response);
    },
    validateResponse: function (request, response, process) {
        this.LOG.debug('Validating action response');
        if (!request.actionResponse.decision) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Decision value can not be null or empty'));
        } else if (request.workflowAction.allowedDecisions && !request.workflowAction.allowedDecisions.includes(request.actionResponse.decision)) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid decision value, action don not allow value: ' + request.actionResponse.decision));
        } else {
            process.nextSuccess(request, response);
        }
    },
    updateActionResponse: function (request, response, process) {
        SERVICE.DefaultActionResponseService.save({
            tenant: request.tenant,
            model: request.actionResponse
        }).then(success => {
            request.actionResponse = success.result;
            response.success.messages.push('Action response been updated');
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    updateWorkflowCarrier: function (request, response, process) {
        if (!request.workflowCarrier.actions) request.workflowCarrier.actions = [];
        if (request.actionResponse.type === ENUMS.WorkflowActionResponseType.ERROR.key) {
            if (!request.workflowCarrier.errors) request.workflowCarrier.errors = [];
            request.workflowCarrier.errors.push((new CLASSES.WorkflowError(request.actionResponse.feedback.error || request.actionResponse.feedback.message)).toJson());
        }
        request.workflowCarrier.activeAction.actionResponse = {
            type: request.actionResponse.type,
            decision: request.actionResponse.decision,
            feedback: request.actionResponse.feedback
        };
        request.workflowCarrier.actions.push({
            code: request.workflowAction.code,
            responseId: request.actionResponse._id,
            decision: request.actionResponse.decision,
            feedback: request.actionResponse.feedback
        });
        SERVICE.DefaultWorkflowCarrierService.save({
            tenant: request.tenant,
            options: {
                recursive: true
            },
            model: request.workflowCarrier
        }).then(success => {
            request.workflowCarrier = success.result;
            response.success.messages.push('Updated workflow item with response id');
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    postActionValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.workflowAction.code);
        if (validators && validators.postAction) {
            this.LOG.debug('Applying postAction validators for workflow action execution');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.postAction), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed action validators', 'ERR_WF_00006'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    postActionInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowAction.code);
        if (interceptors && interceptors.postAction) {
            this.LOG.debug('Applying postAction interceptors for workflow action execution');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.postAction), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed action interceptors', 'ERR_WF_00006'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    triggerActionPerformedEvent: function (request, response, process) {
        response.success.messages.push('Event actionPerformed triggered for action: ' + request.workflowAction.code);
        let eventConfig = SERVICE.DefaultWorkflowUtilsService.getEventConfiguration(request.workflowAction, request.workflowCarrier);
        if (eventConfig.enabled) {
            try {
                this.LOG.debug('Pushing event for action performed : ' + request.workflowCarrier.activeAction.code);
                let event = {
                    tenant: request.tenant,
                    event: 'actionPerformed',
                    type: eventConfig.type || CONFIG.get('workflow').defaultEventType
                };
                SERVICE.DefaultWorkflowEventService.publishEvent(event, request.workflowAction, request.workflowCarrier).then(success => {
                    this.LOG.debug('Event successfully posted');
                }).catch(error => {
                    this.LOG.error('While posting action performed event : ', error);
                });
            } catch (error) {
                this.LOG.error('Facing issue posting action performed event : ', error);
            }
        }
        process.nextSuccess(request, response);
    },
    processChannels: function (request, response, process) {
        this.LOG.debug('Starting channel execution process');
        SERVICE.DefaultWorkflowChannelService.processChannels({
            tenant: request.tenant,
            authData: request.authData,
            workflowCarrier: request.workflowCarrier,
            workflowHead: request.workflowHead,
            workflowAction: request.workflowAction,
            actionResponse: request.actionResponse
        }).then(success => {
            success.messages.forEach(message => {
                response.success.messages.push(message);
            });
            if (success.qualifiedChannels) {
                response.success.qualifiedChannels = success.qualifiedChannels;
            }
            if (!UTILS.isBlank(success.channels)) {
                Object.keys(success.channels).forEach(channel => {
                    response.success[channel] = success.channels[channel];
                });
            }
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    successEnd: function (request, response, process) {
        let handler = request.workflowAction.successHandler;
        if (handler) {
            try {
                let serviceName = handler.substring(0, handler.lastIndexOf('.'));
                let operation = handler.substring(handler.lastIndexOf('.') + 1, handler.length);
                if (SERVICE[serviceName.toUpperCaseFirstChar()] && SERVICE[serviceName.toUpperCaseFirstChar()][operation]) {
                    SERVICE[serviceName.toUpperCaseFirstChar()][operation](request, response).then(success => {
                        this.prepareSuccessResponse(request, response, process);
                    }).catch(error => {
                        this.handleError(request, response, process);
                    });
                } else {
                    if (response.error) {
                        response.error.add(new CLASSES.WorkflowError('ERR_WF_00002', 'Error :: SERVICE.' + serviceName + '.' + operation + '(request, response)'));
                    } else {
                        response.error = new CLASSES.WorkflowError('ERR_WF_00002', 'Error :: SERVICE.' + serviceName + '.' + operation + '(request, response)');
                    }
                    this.handleError(request, response, process);
                }
            } catch (error) {
                if (response.error) {
                    response.error.add(error);
                } else {
                    response.error = error;
                }
                this.handleError(request, response, process);
            }
        } else {
            this.prepareSuccessResponse(request, response, process);
        }
    },
    prepareSuccessResponse: function (request, response, process) {
        response.success = {
            code: 'SUC_WF_00000',
            result: response.success
        }
        SERVICE.DefaultPipelineService.handleSucessEnd(request, response, process);

    },
    handleError: function (request, response, process) {
        if (!response.error || response.error.isProcessed() || !request.workflowCarrier || !request.workflowHead || !request.workflowAction) {
            SERVICE.DefaultPipelineService.handleErrorEnd(request, response, process);
        } else {
            try {
                let handler = request.workflowAction.errorHandler || CONFIG.get('workflow').defaultErrorHandler;
                let serviceName = handler.substring(0, handler.lastIndexOf('.'));
                let operation = handler.substring(handler.lastIndexOf('.') + 1, handler.length);
                if (SERVICE[serviceName.toUpperCaseFirstChar()] && SERVICE[serviceName.toUpperCaseFirstChar()][operation]) {
                    SERVICE[serviceName.toUpperCaseFirstChar()][operation](request, response).then(success => {
                        response.error.setProcessed(true);
                        SERVICE.DefaultPipelineService.handleErrorEnd(request, response, process);
                    }).catch(error => {
                        response.error.setProcessed(true);
                        SERVICE.DefaultPipelineService.handleErrorEnd(request, response, process);
                    });
                } else {
                    if (response.error) {
                        response.error.add(new CLASSES.WorkflowError('ERR_WF_00002', 'Error :: SERVICE.' + serviceName + '.' + operation + '(request, response)'));
                    } else {
                        response.error = new CLASSES.WorkflowError('ERR_WF_00002', 'Error :: SERVICE.' + serviceName + '.' + operation + '(request, response)');
                    }
                    SERVICE.DefaultPipelineService.handleErrorEnd(request, response, process);
                }
            } catch (error) {
                if (response.error) {
                    response.error.add(error);
                } else {
                    response.error = error;
                }
                SERVICE.DefaultPipelineService.handleErrorEnd(request, response, process);
            }
        }
    }
};