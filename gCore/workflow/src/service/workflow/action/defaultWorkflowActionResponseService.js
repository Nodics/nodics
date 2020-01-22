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

    getActionResponse: function (request) {
        return new Promise((resolve, reject) => {
            if (request.actionResponse) {
                resolve(request.actionResponse);
            } else {
                let actionResponseCode = request.workflowItem.activeAction.responseCode;
                this.LOG.debug('Loading workflow action response: ' + actionResponseCode);
                this.get({
                    tenant: request.tenant,
                    query: {
                        code: actionResponseCode
                    }
                }).then(response => {
                    if (response.success && response.result.length > 0) {
                        resolve(response.result[0]);
                    } else {
                        reject('Invalid request, none workflow action response found for code: ' + actionResponseCode);
                    }
                }).catch(error => {
                    reject(error);
                });
            }
        });
    }
};