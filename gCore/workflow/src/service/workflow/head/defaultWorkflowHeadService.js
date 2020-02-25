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

    getWorkflowHead: function (request) {
        return new Promise((resolve, reject) => {
            if (request.workflowHead) {
                resolve(request.workflowHead);
            } else {
                let workflowCode = request.workflowCode || request.workflowItem.activeHead.code;
                this.getWorkflowHeadByCode(workflowCode, request.tenant).then(response => {
                    resolve(response);
                }).catch(error => {
                    reject(error);
                });
            }
        });
    },

    getWorkflowHeadByCode: function (workflowCode, tenant) {
        return new Promise((resolve, reject) => {
            this.LOG.debug('Loading workflow head: ' + workflowCode);
            this.get({
                tenant: tenant,
                query: {
                    code: workflowCode
                }
            }).then(response => {
                if (response.result && response.result.length > 0) {
                    resolve(response.result[0]);
                } else {
                    reject(new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, none workflows found for code: ' + workflowCode));
                }
            }).catch(error => {
                reject(error);
            });
        });
    }
};