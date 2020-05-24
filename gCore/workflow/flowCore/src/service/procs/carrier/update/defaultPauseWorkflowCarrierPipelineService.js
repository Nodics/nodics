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

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating request to pause workflow carrier');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else if (!request.carrierCode && !request.workflowCarrier) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, item detail can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    pauseCarrier: function (request, response, process) {
        if (request.workflowCarrier.currentState.state != ENUMS.WorkflowCarrierState.PAUSED.key) {
            let carrierState = {
                state: ENUMS.WorkflowCarrierState.PAUSED.key,
                action: request.workflowAction.code,
                time: new Date(),
                description: request.comment || 'Carrier successfully paused'
            };
            request.workflowCarrier.currentState = carrierState;
            request.workflowCarrier.states.push(carrierState);
            process.nextSuccess(request, response);
        } else {
            response.success = 'WorkflowCarrier: ' + request.workflowCarrier.code + ' is already in paused state';
            process.stop(request, response);
        }
    },
    prePauseInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowHead.code);
        if (interceptors && interceptors.prePause) {
            this.LOG.debug('Applying prePause interceptors for workflow carrier paused');
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
            this.LOG.debug('Applying prePause validators for workflow carrier pause');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.prePause), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed action validators', 'ERR_WF_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    updateCarrier: function (request, response, process) {
        this.LOG.debug('Creating workflow paused carrier');
        SERVICE.DefaultWorkflowCarrierService.save({
            tenant: request.tenant,
            moduleName: request.moduleName,
            options: {
                recursive: true
            },
            model: request.workflowCarrier
        }).then(success => {
            request.workflowCarrier = success.result;
            response.success = 'WorkflowCarrier: ' + request.workflowCarrier.code + ' has been paused successfully';
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    postPauseValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.workflowHead.code);
        if (validators && validators.postPause) {
            this.LOG.debug('Applying postPause validators for workflow carrier paused');
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
            this.LOG.debug('Applying postPause interceptors for workflow carrier blocked');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.postPause), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed pause interceptors', 'ERR_WF_00006'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    triggerPausedEvent: function (request, response, process) {
        let eventConfig = SERVICE.DefaultWorkflowUtilsService.getEventConfiguration(request.workflowAction, request.workflowCarrier);
        if (eventConfig.enabled) {
            try {
                this.LOG.debug('Pushing event for carrier pause : ' + request.workflowCarrier.code);
                SERVICE.DefaultWorkflowEventService.publishEvent({
                    tenant: request.tenant,
                    event: 'carrierPaused',
                    type: eventConfig.type || CONFIG.get('workflow').defaultEventType
                }, request.workflowAction, request.workflowCarrier).then(success => {
                    this.LOG.debug('Event successfully posted');
                }).catch(error => {
                    this.LOG.error('While posting carrier paused event : ', error);
                });
            } catch (error) {
                this.LOG.error('Facing issue posting carrier paused event : ', error);
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