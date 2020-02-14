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
        this.LOG.debug('Validating request to assogn item to next action');
        if (!request.tenant) {
            process.error(request, response, 'Invalid request, tenant can not be null or empty');
        } else if (!request.actionCode) {
            process.error(request, response, 'Invalid request, actionCode can not be null or empty');
        } else if (!request.itemCode && !request.workflowItem) {
            process.error(request, response, 'Invalid request, item detail can not be null or empty');
        } else {
            request.optType = 'nextAction';
            process.nextSuccess(request, response);
        }
    },
    successEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        process.resolve({
            success: true,
            code: 'SUC_SYS_00000',
            msg: SERVICE.DefaultStatusService.get('SUC_SYS_00000').message,
            result: response.success
        });
    },
    handleError: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        process.reject({
            success: false,
            code: 'ERR_SYS_00000',
            msg: SERVICE.DefaultStatusService.get('ERR_SYS_00000').message,
            errors: response.error || response.errors
        });
    }
};