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
        if (!request.itemType && request.itemType !== ENUMS.WorkflowItemType.INTERNAL.key) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, itemType can not be other than [INTERNAL]'));
        } else if (!request.item || !request.item.detail || (!request.item.detail.schemaName && !request.item.detail.indexName)) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, item detail can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    createInternalItem: function (request, response, process) {
        this.LOG.debug('Creating new internal workflow item');
        let item = request.item;
        request.workflowItem = _.merge({}, request.item);
        request.workflowItem.refId = item.refId || item.code;
        request.workflowItem.originalCode = item.originalCode || item.code;
        request.workflowItem.active = (item.active === undefined) ? true : item.active;
        request.workflowItem.type = ENUMS.WorkflowItemType.INTERNAL.key;
        request.workflowItem.event = request.workflowItem.event || {};
        request.workflowItem.event.enabled = request.workflowItem.event.enabled || false;
        request.workflowItem.detail = request.workflowItem.detail || {};
        request.workflowItem.callbackData = request.workflowItem.callbackData || {};
        process.nextSuccess(request, response);
    }
};
