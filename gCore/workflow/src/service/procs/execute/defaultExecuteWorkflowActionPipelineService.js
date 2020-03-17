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
     * In case of AUTO workflowItem object will be mandate and for manual, itemCode and response will be mandate. Here response is what business
     * have thier comments for the action
     * @param {*} request 
     * @param {*} response 
     * @param {*} process 
     */
    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating request to perform workflow action');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    validateOperation: function (request, response, process) {
        let workflowItem = request.workflowItem;
        if (workflowItem.activeHead.code !== request.workflowHead.code) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflow head mismatch, for item ' + workflowItem.code + ' with workflow head: ' + request.workflowHead.code));
        } else if (workflowItem.activeAction.code !== request.workflowAction.code) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflow action mismatch, for item ' + workflowItem.code + ' with workflow head: ' + request.workflowAction.code));
        } else if ((workflowItem.activeAction.type === ENUMS.WorkflowActionType.MANUAL.key ||
            workflowItem.activeAction.type === ENUMS.WorkflowActionType.PARALLEL.key) &&
            (!request.actionResponse || UTILS.isBlank(request.actionResponse))) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, action response can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
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
            request.workflowItem.activeAction.state !== ENUMS.WorkflowActionState.FINISHED.key) {
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
        request.workflowItem.activeAction.state = ENUMS.WorkflowActionState.FINISHED.key;
        if (!response.success.messages) response.success.messages = [];
        response.success.messages.push('Action performed and marked as done!');
        process.nextSuccess(request, response);
    },
    createStepResponse: function (request, response, process) {
        request.actionResponse = _.merge(
            _.merge(response.success.actionResponse || {}, request.actionResponse || {}), {
            itemCode: request.workflowItem.code,
            originalCode: request.workflowItem.originalCode,
            workflowCode: request.workflowHead.code,
            actionCode: request.workflowAction.code,
            type: ENUMS.WorkflowActionResponseType.SUCCESS.key
        });
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
    updateWorkflowItem: function (request, response, process) {
        request.workflowItem.activeAction.responseId = request.actionResponse._id;
        if (!request.workflowItem.actions) request.workflowItem.actions = [];
        request.workflowItem.actions.push(request.workflowAction.code);
        SERVICE.DefaultWorkflowItemService.save({
            tenant: request.tenant,
            model: request.workflowItem
        }).then(success => {
            request.workflowItem = success.result;
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
        this.LOG.debug('Publishing success event');
        response.success.messages.push('Event actionPerformed triggered for action: ' + request.workflowAction.code);
        process.nextSuccess(request, response);

    },
    processChannels: function (request, response, process) {
        this.LOG.debug('Starting channel execution process');
        SERVICE.DefaultWorkflowChannelService.processChannels({
            tenant: request.tenant,
            workflowItem: request.workflowItem,
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
        if (!response.error || response.error.isProcessed()) {
            SERVICE.DefaultPipelineService.handleErrorEnd(request, response, process);
        } else {
            try {
                let handler = request.workflowAction.successHandler || CONFIG.get('workflow').defaultErrorHandler;
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
