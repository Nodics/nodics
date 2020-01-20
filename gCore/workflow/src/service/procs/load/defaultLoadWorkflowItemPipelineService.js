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
        this.LOG.debug('Validating request to assign item with workflow');
        if (!request.tenant) {
            process.error(request, response, 'Invalid request, tenant can not be null or empty');
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadItem: function (request, response, process) {
        if (request.itemCode) {
            if (!request.itemCodes) request.itemCodes = [];
            request.itemCodes.push(request.itemCode);
            process.nextSuccess(request, response);
        } else {
            process.nextSuccess(request, response);
        }
    },
    loadItems: function (request, response, process) {
        if (request.itemCodes && request.itemCodes.length > 0) {
            SERVICE.DefaultWorkflowItemService.getByCodes({
                tenant: request.tenant,
                itemCodes: request.itemCodes
            }).then(success => {
                if (!request.workflowItems) request.workflowItems = {};
                success.forEach(item => {
                    request.workflowItems[item.code] = {
                        item: request.workflowItems
                    };
                });
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    redirectCreateItems: function (request, response, process) {
        if (request.items && request.items.length > 0) {
            if (request.itemType === ENUMS.WorkflowItemType.INTERNAL.key) {
                response.targetNode = 'loadInternalItem';
                process.nextSuccess(request, response);
            } else {
                response.targetNode = 'loadExternalItem';
                process.nextSuccess(request, response);
            }
        } else {
            process.nextSuccess(request, response);
        }
    }
};
