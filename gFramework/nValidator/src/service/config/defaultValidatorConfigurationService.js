/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

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
        return new Promise((resolve, reject) => {
            try {
                if (!tenant || !NODICS.getActiveTenants().includes(tenant)) {
                    this.LOG.error('Tenant is not valid: ', tenant);
                    reject('Tenant is not valid: ', tenant);
                } else {
                    let typeRawValidators = this.getTenantRawValidators(tenant)[type];
                    if (!typeRawValidators || UTILS.isBlank(typeRawValidators)) {
                        return {};
                    } else {
                        let itemValidators = _.merge(
                            _.merge({}, typeValidators.default || {}),
                            _.merge({}, typeValidators[itemName] || {})
                        );
                        itemValidators = this.arrangeByTigger(itemValidators);
                        let indexedValidators = this.sortInterceptors(itemValidators);
                        return indexedValidators;
                    }
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    arrangeByTigger: function (validators) {
        let validatorList = {};
        if (validators && !UTILS.isBlank(validators)) {
            _.each(validators, (itemValidators, itemName) => {
                if (!validatorList[itemName]) validatorList[itemName] = {};
                _.each(itemValidators, (validator, validatorname) => {
                    validator.name = validatorname;
                    if (!validatorList[itemName][validator.trigger]) validatorList[itemName][validator.trigger] = [];
                    validatorList[itemName][validator.trigger].push(validator);
                });
            });
        }
        return validatorList;
    },

    sortValidators: function (validators) {
        let validatorList = {};
        if (validators && !UTILS.isBlank(validators)) {
            _.each(validators, (itemValidators, itemName) => {
                if (!validatorList[itemName]) validatorList[itemName] = {};
                _.each(itemValidators, (triggers, triggerName) => {
                    let indexedValidators = UTILS.sortObject(triggers, 'index');
                    let sortedValidators = [];
                    Object.keys(indexedValidators).forEach(key => {
                        if (indexedValidators[key] && indexedValidators[key].length > 0) {
                            sortedValidators = sortedValidators.concat(indexedValidators[key]);
                        }
                    });
                    validatorList[itemName][triggerName] = sortedValidators;
                });
            });
        }
        return validatorList;
    }
};