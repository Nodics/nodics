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
        this.LOG.debug('Validating request to release workflow carrier');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else if (!request.carrierCode && !request.workflowCarrier) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, item detail can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    checkValidRequest: function (request, response, process) {
        if (request.workflowCarrier.type === ENUMS.WorkflowCarrierType.FIXED.key && request.workflowCarrier.currentState.state != ENUMS.WorkflowCarrierState.INIT.key) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, items can not be added in FIXED carrier, after its released'));
        } else if (!request.workflowHead.isNewItemsAllowed) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, items can not be added, action not allow this operation'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    prepareUpdates: function (request, response, process) {
        let workflowCarrier = request.workflowCarrier;
        request.carrierUpdated = false;
        if (request.event) {
            workflowCarrier.event = requst.event || workflowCarrier.event;
            request.carrierUpdated = true;
        }
        if (request.items && request.items.length > 0) {
            if (!workflowCarrier.items) workflowCarrier.items = [];
            let finalItems = [];
            request.items.forEach(item => {
                let existingItem = workflowCarrier.items.filter(eItem => eItem.code === item.code);
                if (existingItem && existingItem.length > 0) {
                    finalItems.push(_.merge(existingItem[0], item));
                } else {
                    finalItems.push(item);
                }
            });
            workflowCarrier.items.forEach(eItem => {
                let existingItem = finalItems.filter(fItem => fItem.code === eItem.code);
                if (!existingItem || existingItem.length <= 0) finalItems.push(eItem);
            });
            request.workflowCarrier.items = finalItems;
            request.carrierUpdated = true;
        }
        process.nextSuccess(request, response);
    },
    updateCarrier: function (request, response, process) {
        if (request.carrierUpdated) {
            SERVICE.DefaultWorkflowCarrierService.save({
                tenant: request.tenant,
                moduleName: request.moduleName,
                options: {
                    recursive: true
                },
                model: request.workflowCarrier
            }).then(success => {
                response.success.workflowCarrier = request.workflowCarrier = success.result;
                response.success.messages.push('Carrier: ' + request.workflowCarrier.code + ' has been updated successfully @: ' + new Date());
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            response.success.messages.push('Request does not contain anything to update');
            process.nextSuccess(request, response);
        }
    }
};
