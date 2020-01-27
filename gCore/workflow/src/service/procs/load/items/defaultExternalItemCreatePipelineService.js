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
        if (!request.itemType && (request.itemType !== ENUMS.WorkflowItemType.INTERNAL.key || request.itemType !== ENUMS.WorkflowItemType.EXTERNAL.key)) {
            process.error(request, response, 'Invalid request, itemType can not be other than [INTERNAL or EXTERNAL]');
        } else {
            process.nextSuccess(request, response);
        }
    },

    createExternalItem: function (request, response, process) {
        this.LOG.debug('Creating new external workflow item');
        request.workflowItem = {
            code: request.item.code,
            active: true,
            item: {
                type: ENUMS.WorkflowItemType.EXTERNAL.key,
                detail: request.item.detail,
                callbackData: request.callbackData
            }
        };
        process.nextSuccess(request, response);
    }
};
