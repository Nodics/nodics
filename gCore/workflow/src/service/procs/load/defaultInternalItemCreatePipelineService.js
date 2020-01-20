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
        process.nextSuccess(request, response);
    },

    loadWorkflowItem: function (request, response, process) {
        this.LOG.debug('Creating new internal workflow item');
        if (!request.workflowItems) request.workflowItems = [];
        request.items.forEach(item => {
            let code = item.moduleName + '_' + (item.schemaName || item.indexName) + '_' + item.itemCode;
            request.workflowItems[code] = {
                item: {
                    code: code,
                    active: true,
                    item: {
                        type: ENUMS.WorkflowItemType.INTERNAL.key,
                        detail: {
                            code: item.itemCode,
                            moduleName: item.moduleName,
                            indexName: item.indexName,
                            schemaName: item.schemaName
                        }
                    }
                }
            };
        });
        process.nextSuccess(request, response);
    }
};
