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
        this.LOG.debug('Validating request to assign item with workflow');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else if (!request.workflowItem) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflowItem can not be null or empty'));
        } else if (!request.workflowAction) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflowAction can not be null or empty'));
        } else if (!request.workflowHead) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflowHead can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    prepareResponse: function (request, response, process) {
        this.LOG.debug('Preparing response for iten assignmnet');
        if (!response.success) response.success = {
            messages: []
        };
        process.nextSuccess(request, response);
    },
    updateWorkflowItem: function (request, response, process) {
        this.LOG.debug('Updating workflow item');
        let workflowItem = request.workflowItem;
        workflowItem.activeAction = {
            code: request.workflowAction.code,
            state: ENUMS.WorkflowState.PROCESSING.key
        };
        workflowItem.state = ENUMS.WorkflowItemState.PROCESSING.key;
        if (!workflowItem._id) {
            workflowItem.state = ENUMS.WorkflowItemState.NEW.key;
            workflowItem.activeAction.state = ENUMS.WorkflowState.NEW.key;
        }
        if (request.workflowAction.position === ENUMS.WorkflowActionPosition.HEAD.key) {
            workflowItem.activeHead = {
                code: request.workflowAction.code,
                state: ENUMS.WorkflowState.NEW.key
            };
            if (!workflowItem.heads) workflowItem.heads = [];
            workflowItem.heads.push(request.workflowAction.code);
        } else {
            workflowItem.activeHead.state = ENUMS.WorkflowState.PROCESSING.key;
        }
        process.nextSuccess(request, response);
    },
    applyPutInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowAction.code);
        if (interceptors && interceptors.put) {
            this.LOG.debug('Applying put interceptors for workflow item creation');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.put), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed put interceptors', 'ERR_WF_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    applyPutValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.workflowAction.code);
        if (validators && validators.put) {
            this.LOG.debug('Applying put validators for workflow item creation');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.put), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed put validators', 'ERR_WF_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    saveActiveItem: function (request, response, process) {
        this.LOG.debug('Creating active workflow item');
        SERVICE.DefaultWorkflowItemService.save({
            tenant: request.tenant,
            moduleName: request.moduleName,
            model: request.workflowItem
        }).then(success => {
            request.workflowItem = success.result;
            response.success.messages.push('Item: ' + (request.workflowItem.code || request.workflowItem._id) + ' assign to workflow: ' + request.workflowAction.code + ' @: ' + new Date());
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    triggerAssignedEvent: function (request, response, process) {
        let eventConfig = SERVICE.DefaultWorkflowUtilsService.getEventConfiguration(request.workflowAction, request.workflowItem);
        if (eventConfig.enabled) {
            try {
                this.LOG.debug('Pushing event for item assign to action : ' + request.workflowItem.activeAction.code);
                SERVICE.DefaultWorkflowEventService.publishEvent({
                    tenant: request.tenant,
                    event: 'itemAssigned',
                    type: eventConfig.type || "SYNC"
                }, request.workflowAction, request.workflowItem).then(success => {
                    this.LOG.debug('Event successfully posted');
                }).catch(error => {
                    this.LOG.error('While posting item assigned event : ', error);
                });
            } catch (error) {
                this.LOG.error('Facing issue posting item assigned event : ', error);
            }
        }
        process.nextSuccess(request, response);
    },
    performAction: function (request, response, process) {
        if (request.workflowAction.type === ENUMS.WorkflowActionType.AUTO.key) {
            this.LOG.debug('Triggering action for auto workflow head');
            SERVICE.DefaultWorkflowService.performAction({
                tenant: request.tenant,
                workflowHead: request.workflowHead,
                workflowAction: request.workflowAction,
                workflowItem: request.workflowItem,
                authData: request.authData
            }).then(success => {
                if (!response.success[request.workflowAction.code]) response.success[request.workflowAction.code] = [];
                response.success[request.workflowAction.code].push(success);
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    handleError: function (request, response, process) {
        if (!response.error || response.error.isProcessed() || !request.workflowItem || !request.workflowHead || !request.workflowAction) {
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
