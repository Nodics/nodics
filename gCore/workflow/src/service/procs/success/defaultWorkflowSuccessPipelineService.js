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
        this.LOG.debug('Validating request for default success handler');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, Tenant can not be null or empty'));
        } else if (!request.workflowItem) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, Workflow item can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    createSuccessItem: function (request, response, process) {
        this.LOG.debug('Creating success item');
        response.successItem = _.merge({}, request.workflowItem);
        delete response.successItem._id;
        process.nextSuccess(request, response);
    },
    updateArchivePool: function (request, response, process) {
        this.LOG.debug('updating archive pool');
        SERVICE.DefaultWorkflowArchivedItemService.save({
            tenant: request.tenant,
            models: [response.successItem]
        }).then(success => {
            this.LOG.info('Item: has been moved to archived pool successfully');
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
    }
};
