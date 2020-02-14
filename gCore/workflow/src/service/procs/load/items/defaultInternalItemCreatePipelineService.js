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

    createInternalItem: function (request, response, process) {
        this.LOG.debug('Creating new internal workflow item');
        let item = request.item;
        if (!item.event) item.event = {};
        request.workflowItem = {
            code: item.code, //Allways unique code
            originalCode: item.originalCode || item.code,
            refId: item.refId, // reference to source of item
            active: true,
            type: ENUMS.WorkflowItemType.INTERNAL.key,
            detail: {
                moduleName: item.moduleName,
                indexName: item.indexName,
                schemaName: item.schemaName
            },
            event: {
                enabled: item.event.enabled || false,
                config: item.event.config
            },
            callbackData: item.callbackData
        };
        process.nextSuccess(request, response);
    }
};