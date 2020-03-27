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
        this.LOG.debug('Validating input for workflow error occurred process');
        if (!request.tenant) {
            process.error(request, response, new CLASSES.WorkflowError('Invalid tenant value'));
        } else if (!request.data || !request.event.detail || UTILS.isBlank(request.event.detail)) {
            process.error(request, response, new CLASSES.WorkflowError('Invalid event data value'));
        } else if (!request.event) {
            process.error(request, response, new CLASSES.WorkflowError('Invalid event value'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    prepareModel: function (request, response, process) {
        this.LOG.debug('Preparing model to update schema item');
        let data = request.data;
        request.model = {
            code: data.refId,
            workflow: {
                activeHead: data.activeHead,
                activeAction: data.activeAction,
                error: data.error
            }
        };
        if (data.itemDetail.schemName) {
            response.targetNode = 'schemaOperation';
        } else {
            response.targetNode = 'searchOperation';
        }
        process.nextSuccess(request, response);
    },
    updateSchemaItem: function (request, response, process) {
        this.LOG.debug('Updating schema item for workflow error');
        try {
            request.schemaService.save({
                tenant: request.tenant,
                model: request.model
            }).then(success => {
                process.stop(request, response, success);
            }).then(error => {
                process.error(request, response, error);
            });
        } catch (error) {
            process.error(request, response, new CLASSES.WorkflowError(error, 'while updating schema item'));
        }
    },
    updateSearchItem: function (request, response, process) {
        this.LOG.debug('Updating search item for workflow error');
        try {
            request.searchService.doSave({
                tenant: request.tenant,
                model: request.model
            }).then(success => {
                process.stop(request, response, success);
            }).then(error => {
                process.error(request, response, error);
            });
        } catch (error) {
            process.error(request, response, new CLASSES.WorkflowError(error, 'while updating schema item'));
        }
    }
};