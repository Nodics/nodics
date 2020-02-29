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

    getWorkflowAction: function (actionCode, tenant) {
        return new Promise((resolve, reject) => {
            this.LOG.debug('Loading workflow action: ' + actionCode);
            this.get({
                tenant: tenant,
                options: {
                    recursive: true
                },
                query: {
                    code: actionCode
                }
            }).then(response => {
                if (response.result && response.result.length > 0) {
                    resolve(response.result[0]);
                } else {
                    reject(new CLASSES.WorkflowError('ERR_WF_00010', 'Invalid request, none workflow action found for code: ' + actionCode));
                }
            }).catch(error => {
                reject(error);
            });
        });
    }
};