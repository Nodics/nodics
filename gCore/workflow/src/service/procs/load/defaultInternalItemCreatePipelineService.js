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

    createInternalItem: function (request, response, process) {
        this.LOG.debug('Creating new internal workflow item');
        request.workflowItem = {
            code: request.item.moduleName + '_' + (request.item.schemaName || request.item.indexName) + '_' + request.item.code,
            active: true,
            item: {
                type: ENUMS.WorkflowItemType.INTERNAL.key,
                detail: {
                    code: request.item.code,
                    moduleName: request.item.moduleName,
                    indexName: request.item.indexName,
                    schemaName: request.item.schemaName
                }
            }
        };
        process.nextSuccess(request, response);
    }
};
