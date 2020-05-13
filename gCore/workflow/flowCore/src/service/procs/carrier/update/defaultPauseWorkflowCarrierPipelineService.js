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
        this.LOG.debug('Validating request to pause items');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else if (!request.itemCode) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflowItem code can not be null or empty'));
        } else if (!request.comment) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, comment can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    buildQuery: function (request, response, process) {
        this.LOG.debug('Building query to pause items');
        process.nextSuccess(request, response);
    },
    prepareResponse: function (request, response, process) {
        this.LOG.debug('Preparing response for pause items');
        process.nextSuccess(request, response);
    },
    prePauseInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowHead.code);
        if (interceptors && interceptors.prePause) {
            this.LOG.debug('Applying prePause interceptors for workflow item pause');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.prePause), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed action interceptors', 'ERR_WF_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    prePauseValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.workflowHead.code);
        if (validators && validators.prePause) {
            this.LOG.debug('Applying prePause validators for workflow item pause');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.prePause), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed action validators', 'ERR_WF_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    updateWorkflowItems: function (request, response, process) {
        this.LOG.debug('Pausing all items');
        if (!request.workflowItem.comments) request.workflowItem.comments = [];
        request.workflowItem.comments.push(request.comment);
        SERVICE.DefaultWorkflowItemService.update({
            tenant: request.tenant,
            query: {
                code: request.workflowItem.code
            },
            model: {
                active: false,
                comment: request.workflowItem.comments
            }
        }).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, new CLASSES.WorkflowError(error, 'Could not update items to pause'));
        });
    },
    postPauseValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.workflowHead.code);
        if (validators && validators.postPause) {
            this.LOG.debug('Applying postPause validators for workflow item pause');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.postPause), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed pause validators', 'ERR_WF_00006'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    postPauseInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowHead.code);
        if (interceptors && interceptors.postPause) {
            this.LOG.debug('Applying postPause interceptors for workflow item pause');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.postPause), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed pause interceptors', 'ERR_WF_00006'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    triggerPauseEvent: function (request, response, process) {
        let eventConfig = SERVICE.DefaultWorkflowUtilsService.getEventConfiguration(request.workflowAction, request.workflowItem);
        if (eventConfig.enabled) {
            try {
                this.LOG.debug('Pushing event for item paused : ' + request.workflowItem.activeAction.code);
                let event = {
                    tenant: request.tenant,
                    event: 'itemPaused',
                    type: eventConfig.type || "SYNC",
                    data: {
                        active: false,
                        comments: request.workflowItem.comments
                    }
                };
                SERVICE.DefaultWorkflowEventService.publishEvent(event, request.workflowAction, request.workflowItem).then(success => {
                    this.LOG.debug('Event successfully posted');
                }).catch(error => {
                    this.LOG.error('While posting item assigned event : ', error);
                });
            } catch (error) {
                this.LOG.error('Facing issue posting item assigned event : ', error);
            }
        }
        process.nextSuccess(request, response);
    }
};
