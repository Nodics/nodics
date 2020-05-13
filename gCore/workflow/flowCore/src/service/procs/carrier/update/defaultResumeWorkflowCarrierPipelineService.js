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
        this.LOG.debug('Validating request to resume carrier');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else if (!request.carrierCode && !request.workflowCarrier) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, workflowItem code can not be null or empty'));
        } else if (!request.comment) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, comment can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    buildQuery: function (request, response, process) {
        this.LOG.debug('Building query to resume carrier');
        process.nextSuccess(request, response);
    },
    prepareResponse: function (request, response, process) {
        this.LOG.debug('Preparing response for resume carrier');
        process.nextSuccess(request, response);
    },
    preResumeInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowHead.code);
        if (interceptors && interceptors.preResume) {
            this.LOG.debug('Applying preResume interceptors for workflow carrier pause');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.preResume), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed resume interceptors', 'ERR_WF_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    preResumeValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.workflowHead.code);
        if (validators && validators.preResume) {
            this.LOG.debug('Applying preResume validators for workflow carrier pause');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.preResume), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed resume validators', 'ERR_WF_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    updateWorkflowCarrier: function (request, response, process) {
        this.LOG.debug('Pausing all items');

        SERVICE.DefaultWorkflowCarrierService.update({
            tenant: request.tenant,
            query: {
                code: request.workflowCarrier.code
            },
            model: request.workflowCarrier
        }).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, new CLASSES.WorkflowError(error, 'Could not update items to pause'));
        });
    },
    postResumeValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.workflowHead.code);
        if (validators && validators.postResume) {
            this.LOG.debug('Applying postResume validators for workflow item resume');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.postResume), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed resume validators', 'ERR_WF_00006'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    postResumeInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowHead.code);
        if (interceptors && interceptors.postResume) {
            this.LOG.debug('Applying postResume interceptors for workflow item resume');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.postResume), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed resume interceptors', 'ERR_WF_00006'));
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
                    event: 'itemResumed',
                    type: eventConfig.type || "SYNC",
                    data: {
                        active: request.workflowItem.active,
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