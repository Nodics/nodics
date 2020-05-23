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
        this.LOG.debug('Validating request to resume workflow carrier');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else if (!request.carrierCode && !request.workflowCarrier) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, item detail can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    resumeCarrier: function (request, response, process) {
        if (request.workflowCarrier.currentState.state === ENUMS.WorkflowCarrierState.PAUSED.key) {
            let carrierState = {
                state: ENUMS.WorkflowCarrierState.PROCESSING.key,
                action: request.workflowAction.code,
                description: request.comment || 'Carrier successfully resumed'
            };
            request.workflowCarrier.currentState = carrierState;
            request.workflowCarrier.states.push(carrierState);
            process.nextSuccess(request, response);
        } else {
            response.success = 'WorkflowCarrier: ' + request.workflowCarrier.code + ' is already in resumed state';
            process.stop(request, response);
        }
    },
    preResumeInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowHead.code);
        if (interceptors && interceptors.prePause) {
            this.LOG.debug('Applying prePause interceptors for workflow carrier resumed');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.prePause), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed resumed pre interceptors', 'ERR_WF_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    preResumeValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.workflowHead.code);
        if (validators && validators.prePause) {
            this.LOG.debug('Applying prePause validators for workflow carrier resume');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.prePause), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed resumed pre validators', 'ERR_WF_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    updateCarrier: function (request, response, process) {
        this.LOG.debug('Creating workflow resumed carrier');
        SERVICE.DefaultWorkflowCarrierService.save({
            tenant: request.tenant,
            moduleName: request.moduleName,
            options: {
                recursive: true
            },
            model: request.workflowCarrier
        }).then(success => {
            response.success = 'WorkflowCarrier: ' + request.workflowCarrier.code + ' has been resumed successfully';
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    postResumeValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.workflowHead.code);
        if (validators && validators.postPause) {
            this.LOG.debug('Applying postPause validators for workflow carrier resumed');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.postPause), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed resume post validators', 'ERR_WF_00006'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    postResumeInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowHead.code);
        if (interceptors && interceptors.postPause) {
            this.LOG.debug('Applying postPause interceptors for workflow carrier resumed');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.postPause), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed resume post interceptors', 'ERR_WF_00006'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    triggerResumedEvent: function (request, response, process) {
        let eventConfig = SERVICE.DefaultWorkflowUtilsService.getEventConfiguration(request.workflowAction, request.workflowCarrier);
        if (eventConfig.enabled) {
            try {
                this.LOG.debug('Pushing event for carrier resume : ' + request.workflowCarrier.code);
                SERVICE.DefaultWorkflowEventService.publishEvent({
                    tenant: request.tenant,
                    event: 'carrierResumed',
                    type: eventConfig.type || CONFIG.get('workflow').defaultEventType
                }, request.workflowAction, request.workflowCarrier).then(success => {
                    this.LOG.debug('Event successfully posted');
                }).catch(error => {
                    this.LOG.error('While posting carrier resumed event : ', error);
                });
            } catch (error) {
                this.LOG.error('Facing issue posting carrier resumed event : ', error);
            }
        }
        process.nextSuccess(request, response);
    },
    handleSuccess: function (request, response, process) {
        let result = response.success;
        if (response.success.result) {
            result = response.success.result;
        }
        process.resolve({
            code: 'SUC_WF_00000',
            result: result
        });
    }

};