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
    rawInterceptors: {},

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

    setRawInterceptors: function (rawInterceptors) {
        this.rawInterceptors = rawInterceptors;
    },

    getRawInterceptors: function () {
        return this.rawInterceptors;
    },

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

    arrangeByTigger1: function (interceptors) {
        let interceptorList = {};
        if (interceptors && !UTILS.isBlank(interceptors)) {
            Object.keys(interceptors).forEach(itemName => {
                let itemInterceptors = interceptors[itemName];
                if (!interceptorList[itemName]) interceptorList[itemName] = {};
                Object.keys(itemInterceptors).forEach(intName => {
                    let interceptor = itemInterceptors[intName];
                    interceptor.name = intName;
                    if (!interceptorList[itemName][interceptor.trigger]) interceptorList[itemName][interceptor.trigger] = [];
                    interceptorList[itemName][interceptor.trigger].push(interceptor);
                });
            });
        }
        return interceptorList;
    },

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