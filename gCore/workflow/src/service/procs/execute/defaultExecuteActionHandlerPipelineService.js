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
        let actionResponse = {
            default: {
                decision: 'SUCCESS',
                feedback: {
                    message: 'This is auto action script executed response'
                }
            }
        };
        try {
            this.triggerHandler({
                workflowItems: _.merge({}, request.workflowItems),
                workflowHead: request.workflowHead,
                workflowAction: request.workflowAction,
                serviceName: handler.substring(0, handler.lastIndexOf('.')),
                operation: handler.substring(handler.lastIndexOf('.') + 1, handler.length),
                actionResponse: actionResponse
            }).then(success => {
                response.success = actionResponse;
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } catch (error) {
            process.error(request, response, error);
        }
    },

    triggerHandler: function (options) {
        return new Promise((resolve, reject) => {
            if (options.workflowItems && options.workflowItems.length > 0) {
                let workflowItem = options.workflowItems.shift();
                if (SERVICE[serviceName.toUpperCaseFirstChar()] && SERVICE[serviceName.toUpperCaseFirstChar()][operation]) {
                    SERVICE[serviceName.toUpperCaseFirstChar()][operation]({
                        workflowItem: request.workflowItem,
                        workflowHead: request.workflowHead,
                        workflowAction: request.workflowAction
                    }).then(success => {
                        options.actionResponse[workflowItem.code] = success;
                        this.triggerHandler(options).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    this.LOG.error('Error :: SERVICE.' + serviceName + '.' + operation + '(request, response, this)');
                    options.actionResponse[workflowItem.code] = {
                        decision: 'ERROR',
                        feedback: {
                            message: 'Error :: SERVICE.' + serviceName + '.' + operation + '(request, response)'
                        }
                    };
                    this.triggerHandler(options).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }
            } else {
                resolve(true);
            }
        });
    }
};
