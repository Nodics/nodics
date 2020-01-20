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
        this.LOG.debug('Validating request for executing action script');
        if (!request.workflowAction) {
            process.error(request, response, 'Invalid request, workflow action not found');
        } else if (!request.workflowAction.script) {
            process.error(request, response, 'Invalid request, workflow action script not found');
        } else {
            process.nextSuccess(request, response);
        }
    },

    executeScript: function (request, response, process) {
        this.LOG.debug('Executing action script');
        try {
            let workflowAction = request.workflowAction;
            let workflowHead = request.workflowHead;
            response.success = {
                default: {
                    decision: 'SUCCESS',
                    feedback: {
                        message: 'This is auto action script executed response'
                    }
                }
            };
            request.workflowItems.forEach(workflowItem => {
                let result = eval(request.workflowAction.script);
                response.success[workflowItem.code] = {
                    decision: result,
                    feedback: {
                        message: 'This is auto action script executed response'
                    }
                };
            });
            process.nextSuccess(request, response);
        } catch (error) {
            process.error(request, response, error);
        }
    }
};
