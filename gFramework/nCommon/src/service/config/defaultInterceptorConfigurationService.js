/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module common/service/config/DefaultInterceptorConfigurationService
 * @description Stores and prepares effective interceptor definitions by type, item,
 * trigger, and index. It merges default and item-specific interceptors so dynamic
 * behavior can be extended through layered module configuration.
 * @layer service
 * @owner nCommon
 * @override Project modules may add or override interceptor definitions through module
 * layers. Preserve trigger grouping and index ordering when replacing this service.
 *
 * @property {Object} rawInterceptors Effective interceptor definitions grouped by type and item.
 * @property {Object} interceptors Prepared interceptor cache placeholder.
 */
module.exports = {
    /**
     * Prepared interceptor cache placeholder.
     *
     * @type {Object}
     */
    interceptors: {},

    /**
     * Effective raw interceptor definitions grouped by type and item.
     *
     * @type {Object}
     */
    rawInterceptors: {},

    /**
     * Initializes the interceptor configuration service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the interceptor configuration service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Replaces the effective raw interceptor registry.
     *
     * @param {Object} rawInterceptors Effective interceptor definitions.
     * @returns {void}
     */
    setRawInterceptors: function (rawInterceptors) {
        this.rawInterceptors = rawInterceptors;
    },

    /**
     * Returns the effective raw interceptor registry.
     *
     * @returns {Object} Effective interceptor definitions.
     */
    getRawInterceptors: function () {
        return this.rawInterceptors;
    },

    /**
     * Prepares interceptors for one item and interceptor type.
     *
     * Default interceptors for the type are merged with item-specific interceptors,
     * then grouped by trigger and sorted by index.
     *
     * @param {string} itemName Interceptor item name, commonly schema or default.
     * @param {string} type Interceptor type.
     * @returns {Object} Trigger-keyed interceptor arrays.
     */
    prepareItemInterceptors: function (itemName, type) {
        let typeInterceptors = this.getRawInterceptors()[type];
        if (!typeInterceptors || UTILS.isBlank(typeInterceptors)) {
            return {};
        } else {
            let itemInterceptors = _.merge(
                _.merge({}, typeInterceptors.default || {}),
                _.merge({}, typeInterceptors[itemName] || {})
            );
            itemInterceptors = this.arrangeByTigger(itemInterceptors);
            let indexedInterceptors = this.sortInterceptors(itemInterceptors);
            return indexedInterceptors;
        }
    },

    /**
     * Groups interceptors by trigger name.
     *
     * Runtime name keeps the legacy spelling `Tigger`; semantically this means trigger.
     *
     * @param {Object} itemInterceptors Interceptor definitions keyed by interceptor name.
     * @returns {Object} Trigger-keyed interceptor arrays.
     */
    arrangeByTigger: function (itemInterceptors) {
        let interceptorList = {};
        if (itemInterceptors && !UTILS.isBlank(itemInterceptors)) {
            Object.keys(itemInterceptors).forEach(intName => {
                let interceptor = itemInterceptors[intName];
                interceptor.name = intName;
                if (!interceptorList[interceptor.trigger]) interceptorList[interceptor.trigger] = [];
                interceptorList[interceptor.trigger].push(interceptor);
            });
        }
        return interceptorList;
    },

    /**
     * Sorts each trigger's interceptors by configured `index`.
     *
     * @param {Object} itemInterceptors Trigger-keyed interceptor arrays.
     * @returns {Object} Trigger-keyed sorted interceptor arrays.
     */
    sortInterceptors: function (itemInterceptors) {
        let interceptorList = {};
        if (itemInterceptors && !UTILS.isBlank(itemInterceptors)) {
            Object.keys(itemInterceptors).forEach(triggerName => {
                let triggers = itemInterceptors[triggerName];
                let indexedInterceptors = UTILS.sortObject(triggers, 'index');
                let sortedInterceptors = [];
                Object.keys(indexedInterceptors).forEach(key => {
                    if (indexedInterceptors[key] && indexedInterceptors[key].length > 0) {
                        sortedInterceptors = sortedInterceptors.concat(indexedInterceptors[key]);
                    }
                });
                interceptorList[triggerName] = sortedInterceptors;
            });
        }
        return interceptorList;
    },
};
