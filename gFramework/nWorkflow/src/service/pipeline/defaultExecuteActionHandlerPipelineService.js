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
        this.LOG.debug('Validating request for executing action handler');
        if (!request.workflowAction) {
            process.error(request, response, 'Invalid request, workflow action not found');
        } else if (!request.workflowAction.handler) {
            process.error(request, response, 'Invalid request, workflow action handler not found');
        } else {
            process.nextSuccess(request, response);
        }
    },

    executeHandler: function (request, response, process) {
        this.LOG.debug('Executing action handler');
        let handler = request.workflowAction.handler;
        try {
            let serviceName = handler.substring(0, handler.lastIndexOf('.'));
            let operation = handler.substring(handler.lastIndexOf('.') + 1, handler.length);
            if (SERVICE[serviceName.toUpperCaseFirstChar()] && SERVICE[serviceName.toUpperCaseFirstChar()][operation]) {
                SERVICE[serviceName.toUpperCaseFirstChar()][operation](request, response).then(success => {
                    response.success = success;
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
            } else {
                this.LOG.error('Error :: SERVICE.' + serviceName + '.' + operation + '(request, response, this)');
                process.error(request, response, 'Error :: SERVICE.' + serviceName + '.' + operation + '(request, response)');
            }
        } catch (error) {
            process.error(request, response, error);
        }
    }
};
