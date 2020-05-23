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
        this.LOG.debug('Validating request for default success handler');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, Tenant can not be null or empty'));
        } else if (!request.workflowCarrier) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, Workflow carrier can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    createSuccessItem: function (request, response, process) {
        this.LOG.debug('Creating success carrier');
        response.successItem = _.merge({}, request.workflowCarrier);
        delete response.successItem._id;
        response.successItem.activeAction.state = ENUMS.WorkflowActionState.FINISHED.key;
        let carrierState = {
            state: ENUMS.WorkflowCarrierState.FINISHED.key,
            description: 'Carrier successfully processed'
        };
        request.successItem.currentState = carrierState;
        response.successItem.states.push(carrierState);
        if (response.successItem.states && response.successItem.states.length > 0) {
            let items = [];
            response.successItem.states.forEach(wtItem => {
                delete wtItem._id;
                items.push(wtItem);
            });
            response.successItem.states = items;
        }
        process.nextSuccess(request, response);
    },
    successInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowHead.code);
        if (interceptors && interceptors.success) {
            this.LOG.debug('Applying  interceptors for workflow carrier success');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.success), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed carrier success interceptors', 'ERR_WF_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    successValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.workflowHead.code);
        if (validators && validators.success) {
            this.LOG.debug('Applying prePause validators for workflow carrier error');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.success), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed carrier success validators', 'ERR_WF_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    updateArchivePool: function (request, response, process) {
        this.LOG.debug('updating archive pool');
        SERVICE.DefaultWorkflowArchivedCarrierService.save({
            tenant: request.tenant,
            model: response.successItem
        }).then(success => {
            this.LOG.info('Carrier: has been moved to archived pool successfully');
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    updateItemPool: function (request, response, process) {
        this.LOG.debug('updating item pool');
        SERVICE.DefaultWorkflowCarrierService.removeById([request.workflowCarrier._id], request.tenant).then(success => {
            this.LOG.info('Carrier: has been removed from carrier pool successfully');
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    triggerSuccessEvent: function (request, response, process) {
        response.success.messages.push('Event carrier processed triggered for action: ' + request.workflowAction.code);
        let eventConfig = SERVICE.DefaultWorkflowUtilsService.getEventConfiguration(request.workflowAction, request.workflowCarrier);
        if (eventConfig.enabled) {
            try {
                this.LOG.debug('Pushing event for carrier processed : ' + request.workflowCarrier.code);
                SERVICE.DefaultWorkflowEventService.publishEvent({
                    tenant: request.tenant,
                    event: 'carrierProcessed',
                    type: eventConfig.type || CONFIG.get('workflow').defaultEventType
                }, request.workflowAction, request.workflowCarrier).then(success => {
                    this.LOG.debug('Event successfully posted');
                }).catch(error => {
                    this.LOG.error('While posting carrier processed event : ', error);
                });
            } catch (error) {
                this.LOG.error('Facing issue posting carrier processed event : ', error);
            }
        }
        process.nextSuccess(request, response);
    }
};
