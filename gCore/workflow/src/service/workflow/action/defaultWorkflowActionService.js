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

    getActionCode: function (request) {
        let actionCode = request.actionCode;
        if (actionCode) {
            let workflowItem = request.workflowItems[Object.keys(request.workflowItems)[0]];
            actionCode = workflowItem.activeAction.code;
        }
        return actionCode;
    },

    getWorkflowAction: function (request) {
        return new Promise((resolve, reject) => {
            if (request.workflowAction) {
                resolve(request.workflowAction);
            } else if (!request.workflowAction && !request.actionCode) {
                resolve(request.workflowHead);
            } else {
                let actionCode = this.getActionCode(request);
                this.LOG.debug('Loading workflow action: ' + actionCode);
                this.get({
                    tenant: request.tenant,
                    query: {
                        code: actionCode
                    }
                }).then(response => {
                    if (response.success && response.result.length > 0) {
                        resolve(response.result[0]);
                    } else {
                        reject('Invalid request, none workflow action found for code: ' + actionCode);
                    }
                }).catch(error => {
                    reject(error);
                });
            }
        });
    }
};