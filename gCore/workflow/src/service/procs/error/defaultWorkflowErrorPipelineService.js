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
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, Tenant can not be null or empty'));
        } else if (!request.workflowItem || !request.workflowItem._id) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, Workflow item can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    updateError: function (request, response, process) {
        if (request.workflowItem.errorCounts < CONFIG.get('workflow').itemErrorLimit || 5) {
            if (!request.workflowItem.errors) request.workflowItem.errors = [];
            request.workflowItem.errors.push(response.error.toJson());
            request.workflowItem.errorCounts = request.workflowItem.errorCounts + 1;
            SERVICE.DefaultWorkflowItemService.save({
                tenant: request.tenant,
                model: request.workflowItem
            }).then(success => {
                this.LOG.debug('Error been updated for item: ' + request.workflowItem.code);
            }).catch(error => {
                this.LOG.debug('Failed updating error for item: ' + request.workflowItem.code);
            });
            process.stop(request, response, new CLASSES.WorkflowError('Error has been updated into workflow item'));
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
            model: request.errorItem
        }).then(success => {
            this.LOG.info('Item: has been moved to error pool successfully');
            if (!response.success) response.success = [];
            response.success.push('Item: has been moved to error pool successfully: ' + request.workflowItem.code);
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },
    updateItemPool: function (request, response, process) {
        this.LOG.debug('updating item pool');
        SERVICE.DefaultWorkflowItemService.removeById([request.workflowItem._id], request.tenant).then(success => {
            this.LOG.info('Item: has been removed from item pool successfully');
            if (!response.success) response.success = [];
            response.success.push('Item: has been removed from item pool successfully: ' + request.workflowItem.code);
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    }
};
