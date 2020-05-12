/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    interceptors: {},
    validators: {},

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

    setWorkflowInterceptors: function (interceptors) {
        this.interceptors = interceptors;
    },

    getWorkflowInterceptors: function (itemCode) {
        if (!this.interceptors[itemCode]) {
            this.interceptors[itemCode] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(itemCode, ENUMS.InterceptorType.workflow.key);
        }
        return this.interceptors[itemCode];
    },

    refreshWorkflowInterceptors: function (itemCode) {
        if (this.interceptors && !UTILS.isBlank(this.interceptors)) {
            if (!itemCode || itemCode === 'default') {
                let tmpInterceptors = {};
                Object.keys(this.interceptors).forEach(itemCode => {
                    tmpInterceptors[itemCode] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(itemCode, ENUMS.InterceptorType.workflow.key);
                });
                this.interceptors = tmpInterceptors;
            } else if (this.interceptors[itemCode]) {
                this.interceptors[itemCode] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(itemCode, ENUMS.InterceptorType.workflow.key);
            }
        }
    },

    handleWorkflowInterceptorUpdated: function (event, callback) {
        try {
            let itemCode = event.data.item;
            this.refreshWorkflowInterceptors(itemCode);
            callback(null, {
                code: 'SUC_EVNT_00000',
                message: success
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Failed updating workflow interceptors', 'ERR_EVNT_00000'));
        }
    },

    setWorkflowValidators: function (validators) {
        this.validators = validators;
    },

    getWorkflowValidators: function (tenant, itemCode) {
        if (!this.validators[tenant] || !this.validators[tenant][itemCode]) {
            if (!this.validators[tenant]) this.validators[tenant] = {};
            this.validators[tenant][itemCode] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, itemCode, ENUMS.InterceptorType.workflow.key);
        }
        return this.validators[tenant][itemCode];
    },

    refreshWorkflowValidators: function (tenant, itemCode) {
        if (this.validators[tenant] && !UTILS.isBlank(this.validators[tenant])) {
            if (!itemCode || itemCode === 'default') {
                let tenantValidators = {};
                Object.keys(this.validators[tenant]).forEach(itemCode => {
                    tenantValidators[itemCode] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, itemCode, ENUMS.InterceptorType.workflow.key);
                });
                this.validators[tenant] = tenantValidators;
            } else if (this.validators[tenant][itemCode]) {
                this.validators[tenant][itemCode] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, itemCode, ENUMS.InterceptorType.workflow.key);
            }
        }
    },

    handleWorkflowValidatorUpdated: function (event, callback) {
        try {
            this.refreshWorkflowValidators(event.data.tenant, event.data.item);
            callback(null, {
                code: 'SUC_EVNT_00000',
                message: success
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Failed updating workflow validators', 'ERR_EVNT_00000'));
        }
    },
};