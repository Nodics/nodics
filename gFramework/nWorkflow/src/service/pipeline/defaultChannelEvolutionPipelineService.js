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

    /**
     * This pipeline process can be executed either via last executed action after assiging an item to action if it is AUTO, or via API if it is MANUAL. 
     * In case of AUTO workflowItem object will be mandate and for manual, workflowItemCode and response will be mandate. Here response is what business
     * have thier comments for the action
     * @param {*} request 
     * @param {*} response 
     * @param {*} process 
     */
    validateRequest: function (request, response, process) {
        if (!request.channel) {
            process.error(request, response, 'Invalid request, channel can not be null or empty');
        } else if (!request.actionResponse) {
            process.error(request, response, 'Invalid request, could not found a valid action response');
        } else {
            process.nextSuccess(request, response);
        }
    },

    checkDecision: function (request, response, process) {
        if (request.channel.qualifier.decision) {
            if (request.channel.qualifier.decision === request.actionResponse.decision) {
                process.stop(request, response, true);
            } else {
                process.stop(request, response, false);
            }
        } else {
            process.nextSuccess(request, response);
        }
    },

    executeHandler: function (request, response, process) {
        if (request.channel.qualifier.handler) {
            let handler = request.channel.qualifier.handler;
            try {
                let serviceName = handler.substring(0, handler.lastIndexOf('.'));
                let operation = handler.substring(handler.lastIndexOf('.') + 1, handler.length);
                if (SERVICE[serviceName.toUpperCaseFirstChar()] && SERVICE[serviceName.toUpperCaseFirstChar()][operation]) {
                    SERVICE[serviceName.toUpperCaseFirstChar()][operation](actionResponse, channel).then(success => {
                        process.stop(request, response, success);
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
        } else {
            process.nextSuccess(request, response);
        }
    },

    executeScript: function (request, response, process) {
        if (request.channel.qualifier.script) {
            try {
                let result = eval(request.channel.qualifier.script);
                process.stop(request, response, result);
            } catch (error) {
                process.error(request, response, error);
            }
        } else {
            process.nextSuccess(request, response);
        }
    },

    invalidChannel: function (request, response, process) {
        this.LOG.debug('Please validate your channel, It should contain one of [decision, handler or script]');
        process.error(request, response, 'Please validate your channel, It should contain one of [decision, handler or script]');
    }
};
