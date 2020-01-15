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
     * In case of AUTO workflowItem object will be mandate and for manual, itemCode and response will be mandate. Here response is what business
     * have thier comments for the action
     * @param {*} request 
     * @param {*} response 
     * @param {*} process 
     */
    validateRequest: function (request, response, process) {
        if (!request.tenant) {
            process.error(request, response, 'Invalid request, tenant can not be null or empty');
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadWorkflowItem: function (request, response, process) {
        this.LOG.debug('Create Workflow Active Item');
        if (!request.workflowItem) {
            SERVICE.DefaultWorkflowItemService.get({
                tenant: request.tenant,
                query: {
                    code: request.itemCode
                }
            }).then(response => {
                if (response.success && response.result.length > 0) {
                    request.workflowItem = response.result[0];
                    process.nextSuccess(request, response);
                } else {
                    process.error(request, response, 'Invalid request, none workflow action found for code: ' + request.workflowCode);
                }
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadWorkflowHead: function (request, response, process) {
        let workflowCode = request.workflowCode || request.workflowItem.workflowHead.code;
        this.LOG.debug('Loading workflow head: ' + workflowCode);
        if (!request.workflowHead) {
            SERVICE.DefaultWorkflowHeadService.get({
                tenant: request.tenant,
                query: {
                    code: workflowCode,
                    isHead: true
                }
            }).then(response => {
                if (response.success && response.result.length > 0) {
                    request.workflowHead = response.result[0];
                    process.nextSuccess(request, response);
                } else {
                    process.error(request, response, 'Invalid request, none workflows found for code: ' + request.workflowCode);
                }
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadWorkflowAction: function (request, response, process) {
        if (!request.workflowAction) {
            if (!request.workflowItem.activeAction) {
                request.workflowAction = request.workflowHead;
                process.nextSuccess(request, response);
            } else {
                let actionCode = request.actionCode || request.workflowItem.activeAction.code;
                this.LOG.debug('Loading workflow action: ' + actionCode);
                SERVICE.DefaultWorkflowActionService.get({
                    tenant: request.tenant,
                    query: {
                        code: actionCode
                    }
                }).then(response => {
                    if (response.success && response.result.length > 0) {
                        request.workflowAction = response.result[0];
                        process.nextSuccess(request, response);
                    } else {
                        process.error(request, response, 'Invalid request, none workflow action found for code: ' + request.workflowCode);
                    }
                }).catch(error => {
                    process.error(request, response, error);
                });
            }
        } else {
            process.nextSuccess(request, response);
        }
    },
    validateOperation: function (request, response, process) {
        if (request.workflowItem.workflowHead.code !== request.workflowHead.code) {
            process.error(request, response, 'Invalid request, workflow head mismatch');
        } else if (request.workflowItem.activeAction.code !== request.workflowAction.code) {
            process.error(request, response, 'Invalid request, workflow action mismatch');
        } else if (request.workflowAction.type !== ENUMS.WorkflowActionType.AUTO.key && (!request.feedback || UTILS.isBlank(request.feedback))) {
            process.error(request, response, 'Invalid action perform request, action response required');
        } else {
            process.nextSuccess(request, response);
        }
    },
    preActionInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowAction.code);
        if (interceptors && interceptors.preAction) {
            this.LOG.debug('Applying preAction interceptors for workflow action execution');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.preAction), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_SYS_00000',
                    error: error.toString()
                });
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
                process.error(request, response, {
                    success: false,
                    code: 'ERR_SYS_00000',
                    error: error.toString()
                });
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    handleAutoAction: function (request, response, process) {
        if (request.workflowAction.type === ENUMS.WorkflowActionType.AUTO.key) {
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
    createStepResponse: function (request, response, process) {
        let autoResponse = response.success || {};
        let decision = autoResponse.decision || request.decision;
        if (request.workflowAction.allowedDecisions.includes(decision)) {
            request.actionResponse = {
                workflowCode: request.workflowHead.code,
                actionCode: request.workflowAction.code,
                decision: decision,
                response: autoResponse.feedback || request.feedback
            };
            process.nextSuccess(request, response);
        } else {
            process.error(request, response, 'Invalid decision: ' + decision + ' for action: ' + request.workflowAction.code);
        }
    },
    updateStepResponse: function (request, response, process) {
        SERVICE.DefaultActionResponseService.save({
            tenant: request.tenant,
            models: [request.actionResponse]
        }).then(success => {
            if (success.result && success.result.length > 0) {
                request.actionResponse = success.result[0];
            }
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    postActionInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowAction.code);
        if (interceptors && interceptors.postAction) {
            this.LOG.debug('Applying postAction interceptors for workflow action execution');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.postAction), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_SYS_00000',
                    error: error.toString()
                });
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    postActionValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.workflowAction.code);
        if (validators && validators.postAction) {
            this.LOG.debug('Applying postAction validators for workflow action execution');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.postAction), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_SYS_00000',
                    error: error.toString()
                });
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    evaluateChannels: function (request, response, process) {
        this.LOG.debug('Starting channel evaluation process');
        let channels = [].concat(request.workflowAction.channels);
        SERVICE.DefaultWorkflowChannelService.getQalifiedChannel(request.actionResponse, channels).then(channel => {
            response.qualifiedChannel = channel;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    executeChannel: function (request, response, process) {
        this.LOG.debug('Starting channel execution process');
        SERVICE.DefaultPipelineService.start('executeChannelPipeline', {
            workflowHead: request.workflowHead,
            workflowAction: request.workflowAction,
            workflowItem: request.workflowItem,
            actionResponse: request.actionResponse,
            channel: response.qualifiedChannel,
            tenant: request.tenant
        }, {}).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    successEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        response.success.msg = SERVICE.DefaultStatusService.get(response.success.code || 'SUC_SYS_00000').message;
        process.resolve(response.success);
    },
    handleError: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        response.error = (response.errors && response.errors.length === 1) ? response.errors[0] : response.error;
        if (!(response.error instanceof Error) || !UTILS.isObject(response.error)) {
            response.error = {
                message: response.error
            };
        }
        response.error.code = response.error.code || 'ERR_SYS_00000';
        SERVICE.DefaultPipelineService.start('handleWorkflowErrorsPipeline', request, response).then(success => {
            process.reject(response.error);
        }).catch(error => {
            process.reject(response.error);
        });
    }
};
