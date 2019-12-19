/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    dbs: {},
    interceptors: {},

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

    getTenantActiveWorkflowHeads: function (tenants, itemCodes) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (!itemCodes) itemCodes = {};
            if (tenants && tenants.length > 0) {
                let tenant = tenants.shift();
                if (!itemCodes[tenant]) itemCodes[tenant] = [];
                _self.get({
                    tenant: tenant,
                    options: { noLimit: true },
                    query: SERVICE.DefaultWorkflowConfigurationService.getWorkflowDefaultQuery()
                }).then(result => {
                    if (result.success && result.result && result.result.length >= 0) {
                        result.result.forEach(workflowHead => {
                            if (!itemCodes[tenant].includes(workflowHead.code)) itemCodes[tenant].push(workflowHead.code);
                        });
                        this.getTenantActiveWorkflowHeads(tenants, itemCodes).then(itemCodes => {
                            resolve(itemCodes);
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        reject(result.msg);
                    }
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(itemCodes);
            }
        });
    },
};
