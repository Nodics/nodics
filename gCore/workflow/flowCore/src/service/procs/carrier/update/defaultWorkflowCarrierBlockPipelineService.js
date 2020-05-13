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
        this.LOG.debug('Validating request to block workflow carrier');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else if (!request.carrierCode && !request.workflowCarrier) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, item detail can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    blockCarrier: function (request, response, process) {
        if (request.workflowCarrier.currentStatus.status != ENUMS.WorkflowCarrierStatus.BLOCKED.key) {
            let carrierStatus = {
                status: ENUMS.WorkflowCarrierStatus.BLOCKED.key,
                description: request.comment || 'Carrier successfully block'
            };
            request.workflowCarrier.currentStatus = carrierStatus;
            request.workflowCarrier.statuses.push(carrierStatus);
            process.nextSuccess(request, response);
        } else {
            response.success = 'WorkflowCarrier: ' + request.workflowCarrier.code + ' is already in blocked state';
            process.stop(request, response);
        }
    },
    updateCarrier: function (request, response, process) {
        this.LOG.debug('Updating workflow carrier for block status');
        SERVICE.DefaultWorkflowCarrierService.save({
            tenant: request.tenant,
            moduleName: request.moduleName,
            model: request.workflowCarrier
        }).then(success => {
            response.success = 'WorkflowCarrier: ' + request.workflowCarrier.code + ' has been blocked successfully';
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    triggerBlockedEvent: function (request, response, process) {
        let eventConfig = SERVICE.DefaultWorkflowUtilsService.getEventConfiguration(request.workflowAction, request.workflowCarrier);
        if (eventConfig.enabled) {
            try {
                this.LOG.debug('Pushing event for carrier blocked : ' + request.workflowCarrier.code);
                SERVICE.DefaultWorkflowEventService.publishEvent({
                    tenant: request.tenant,
                    event: 'carrierBlocked',
                    type: eventConfig.type || CONFIG.get('workflow').defaultEventType
                }, request.workflowAction, request.workflowCarrier).then(success => {
                    this.LOG.debug('Event successfully posted');
                }).catch(error => {
                    this.LOG.error('While posting carrier blocked event : ', error);
                });
            } catch (error) {
                this.LOG.error('Facing issue posting carrier blocked event : ', error);
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
