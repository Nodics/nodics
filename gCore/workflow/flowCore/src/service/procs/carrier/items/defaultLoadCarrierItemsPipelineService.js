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
        this.LOG.debug('Validating request to assign item with workflow');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadCarrierItems: function (request, response, process) {
        process.nextSuccess(request, response);
    },
    loadItems: function (request, response, process) {
        process.nextSuccess(request, response);
    },
    createCarrierItems: function (request, response, process) {
        this.LOG.debug('Creating new external workflow item');
        if (request.items && request.items.length > 0) {
            let finalItems = [];
            if (!request.workflowCarrier.items) request.workflowCarrier.items = [];
            request.items.forEach(item => {
                let existingItem = request.workflowCarrier.items.filter(eItem => eItem.code === item.code);
                if (existingItem && existingItem.length > 0) {
                    finalItems.push(_.merge(existingItem[0], item));
                } else {
                    request.addedNewItems = true;
                    finalItems.push(item);
                }
            });
            request.workflowCarrier.items.forEach(eItem => {
                let existingItem = finalItems.filter(fItem => fItem.code === eItem.code);
                if (!existingItem || existingItem.length <= 0) finalItems.push(eItem);
            });
            request.workflowCarrier.items = finalItems;
            process.nextSuccess(request, response);
        } else {
            request.addedNewItems = false;
            process.nextSuccess(request, response);
        }
    }
};
