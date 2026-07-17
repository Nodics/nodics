/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
/**
 * @module gFramework/nValidator/src/service/config/defaultValidatorConfigurationService
 * @description Implements nValidator default validator configuration service business behavior and extension logic.
 * @layer service
 * @owner nValidator
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
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

    /**

     * Updates raw validators information.

     *

     * @param {*} rawValidators Method input.

     * @returns {*} Method result.

     */

    setRawValidators: function (rawValidators) {
        this.rawValidators = rawValidators;
    },

    /**

     * Retrieves raw validators information.

     *

     * @returns {*} Method result.

     */

    getRawValidators: function () {
        return this.rawValidators;
    },

    /**

     * Retrieves tenant raw validators information.

     *

     * @param {*} tenant Method input.

     * @returns {*} Method result.

     */

    getTenantRawValidators: function (tenant) {
        return this.rawValidators[tenant] ? this.rawValidators[tenant] : {};
    },

    /**

     * Runs pre-processing logic for pare item validators.

     *

     * @param {*} tenant Method input.

     * @param {*} itemName Method input.

     * @param {*} type Method input.

     * @returns {*} Method result.

     */

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

    /**

     * Executes arrange by tigger behavior.

     *

     * @param {*} itemValidators Method input.

     * @returns {*} Method result.

     */

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

    /**

     * Executes sort validators behavior.

     *

     * @param {*} itemValidators Method input.

     * @returns {*} Method result.

     */

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