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
        this.LOG.debug('Validating request for error handler');
        process.nextSuccess(request, response);
    },
    executeErrorHandlers: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowCode);
        if (interceptors && interceptors.error) {
            this.LOG.debug('Applying error interceptors for workflow: ' + request.workflowCode);
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.error), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    createErrorItem: function (request, response, process) {
        this.LOG.debug('Creating error item');
        response.errorItem = request.workflowItem;
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
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    }
};
