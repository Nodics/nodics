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
        this.LOG.debug('Validating request to init item with workflow');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    createNewItem: function (request, response, process) {
        this.LOG.debug('Creating new external workflow item');
        if (!request.workflowItem && request.item) {
            let item = request.item;
            request.workflowItem = _.merge({}, request.item);
            request.workflowItem.refId = item.refId || item.code;
            request.workflowItem.originalCode = item.originalCode || item.code;
            request.workflowItem.active = (item.active === undefined) ? true : item.active;
            request.workflowItem.event = request.workflowItem.event || {};
            request.workflowItem.event.enabled = request.workflowItem.event.enabled || false;
            request.workflowItem.callbackData = request.workflowItem.callbackData || {};
            process.nextSuccess(request, response);
        } else {
            process.nextSuccess(request, response);
        }
    },
    applyPreUpdateInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowItem.code);
        if (interceptors && interceptors.preUpdate) {
            this.LOG.debug('Applying preUpdate interceptors for workflow item update');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.preUpdate), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed preUpdate interceptors', 'ERR_WF_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    applyPreUpdateValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.workflowItem.code);
        if (validators && validators.preUpdate) {
            this.LOG.debug('Applying preUpdate validators for workflow item update');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.preUpdate), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed preUpdate validators', 'ERR_WF_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    updateWorkflowItem: function (request, response, process) {
        this.LOG.debug('Updating active workflow item');
        SERVICE.DefaultWorkflowItemService.update({
            tenant: request.tenant,
            moduleName: request.moduleName,
            query: {
                code: request.workflowItem.code,
                refId: request.workflowItem.refId
            },
            model: request.workflowItem
        }).then(success => {
            response.success = success;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    applyPostUpdateValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.workflowItem.code);
        if (validators && validators.postUpdate) {
            this.LOG.debug('Applying postUpdate validators for workflow item update');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.postUpdate), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed postUpdate validators', 'ERR_WF_00006'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    applyPostUpdateInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowItem.code);
        if (interceptors && interceptors.postUpdate) {
            this.LOG.debug('Applying postUpdate interceptors for workflow item update');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.postUpdate), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.WorkflowError(error, 'Failed postUpdate interceptors', 'ERR_WF_00006'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    triggerItemUpdateEvent: function (request, response, process) {
        let eventConfig = SERVICE.DefaultWorkflowUtilsService.getEventConfiguration(request.workflowAction, request.workflowItem);
        if (eventConfig.enabled) {
            try {
                this.LOG.debug('Pushing event for item assign to action : ' + request.workflowItem.activeAction.code);
                SERVICE.DefaultWorkflowEventService.publishEvent({
                    tenant: request.tenant,
                    event: 'itemUpdated',
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

};
