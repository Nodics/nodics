/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');
module.exports = {
    rawValidators: {},

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

    setRawValidators: function (rawValidators) {
        this.rawValidators = rawValidators;
    },

    getRawValidators: function () {
        return this.rawValidators;
    },

    getTenantRawValidators: function (tenant) {
        return this.rawValidators[tenant] ? this.rawValidators[tenant] : {};
    },

    prepareItemValidators: function (tenant, itemName, type) {
        if (!tenant || !NODICS.getActiveTenants().includes(tenant)) {
            this.LOG.error('Tenant is not valid: ', tenant);
            throw new Error('Tenant is not valid: ' + tenant);
        } else {
            let indexedValidators = {};
            let typeRawValidators = this.getTenantRawValidators(tenant)[type];
            if (typeRawValidators && !UTILS.isBlank(typeRawValidators)) {
                let itemValidators = _.merge(
                    _.merge({}, typeRawValidators.default || {}),
                    _.merge({}, typeRawValidators[itemName] || {})
                );
                itemValidators = this.arrangeByTigger(itemValidators);
                indexedValidators = this.sortValidators(itemValidators);
            }
            return indexedValidators;
        }
    },

    arrangeByTigger: function (itemValidators) {
        let validatorList = {};
        if (itemValidators && !UTILS.isBlank(itemValidators)) {
            Object.keys(itemValidators).forEach(validatorName => {
                let validator = itemValidators[validatorName];
                validator.name = validatorName;
                if (!validatorList[validator.trigger]) validatorList[validator.trigger] = [];
                validatorList[validator.trigger].push(validator);
            });
        }
        return validatorList;
    },

    sortValidators: function (itemValidators) {
        let validatorList = {};
        if (itemValidators && !UTILS.isBlank(itemValidators)) {
            Object.keys(itemValidators).forEach(triggerName => {
                let triggers = itemValidators[triggerName];
                let indexedValidators = UTILS.sortObject(triggers, 'index');
                let sortedValidators = [];
                Object.keys(indexedValidators).forEach(key => {
                    if (indexedValidators[key] && indexedValidators[key].length > 0) {
                        sortedValidators = sortedValidators.concat(indexedValidators[key]);
                    }
                });
                validatorList[triggerName] = sortedValidators;

            });
        }
        return validatorList;
    }
};