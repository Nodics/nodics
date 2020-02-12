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
        this.LOG.debug('Validating request for default error handler');
        if (!request.tenant) {
            process.error(request, response, 'Invalid request, Tenant can not be null or empty');
        } else if (!request.error || UTILS.isBlank(request.error)) {
            process.error(request, response, 'Invalid request, Error detail can not be null or empty');
        } else if (!request.error.code) {
            process.error(request, response, 'Invalid request, Error detail should hole mandate properties');
        } else if (!request.workflowItem) {
            process.error(request, response, 'Invalid request, Workflow item can not be null or empty');
        } else {
            process.nextSuccess(request, response);
        }
    },
    createErrorItem: function (request, response, process) {
        this.LOG.debug('Creating error item');
        response.errorItem = _.merge({}, request.workflowItem);
        delete response.errorItem._id;
        response.errorItem.error = {
            code: response.error.code,
            message: response.error.message || response.error.msg,
            stackTrace: response.error.stackTrace
        };
        process.nextSuccess(request, response);
    },
    updateErrorPool: function (request, response, process) {
        this.LOG.debug('updating error pool');
        SERVICE.DefaultWorkflowErrorItemService.save({
            tenant: request.tenant,
            models: [request.errorItem]
        }).then(success => {
            this.LOG.info('Item: has been moved to error pool successfully');
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    updateItemPool: function (request, response, process) {
        this.LOG.debug('updating item pool');
        SERVICE.DefaultWorkflowItemService.removeById([request.workflowItem._id], request.tenant).then(success => {
            this.LOG.info('Item: has been removed from item pool successfully');
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
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
