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

    setInterceptors: function (interceptors) {
        this.interceptors = interceptors;
    },

    getInterceptors: function (interceptors) {
        return this.interceptors;
    },

    getTypeInterceptors: function (type) {
        return this.interceptors[type];
    },


    prepareInterceptors: function (items, type) {
        return new Promise((resolve, reject) => {
            let itemInterceptors = this.rawInterceptors[type];
            if (!itemInterceptors || UTILS.isBlank(itemInterceptors)) {
                resolve({});
            } else {
                let schemaInterceptors = {};
                items.forEach(schemaName => {
                    let defaultInt = _.merge({}, itemInterceptors.default);
                    let schemaInterceptor = _.merge({}, itemInterceptors[schemaName] || {});
                    schemaInterceptors[schemaName] = _.merge(defaultInt, schemaInterceptor);
                });
                let rawInterceptors = this.arrangeByTigger(schemaInterceptors);
                let indexedInterceptors = this.sortInterceptors(rawInterceptors);
                resolve(indexedInterceptors);
            }
        });
    },

    arrangeByTigger: function (interceptors) {
        let interceptorList = {};
        if (interceptors && !UTILS.isBlank(interceptors)) {
            _.each(interceptors, (itemInterceptors, itemName) => {
                if (!interceptorList[itemName]) interceptorList[itemName] = {};
                _.each(itemInterceptors, (interceptor, intName) => {
                    interceptor.name = intName;
                    if (!interceptorList[itemName][interceptor.trigger]) interceptorList[itemName][interceptor.trigger] = [];
                    interceptorList[itemName][interceptor.trigger].push(interceptor);
                });
            });
        }
        return interceptorList;
    },

    sortInterceptors: function (interceptors) {
        let interceptorList = {};
        if (interceptors && !UTILS.isBlank(interceptors)) {
            _.each(interceptors, (itemInterceptors, itemName) => {
                if (!interceptorList[itemName]) interceptorList[itemName] = {};
                _.each(itemInterceptors, (triggers, triggerName) => {
                    let indexedInterceptors = UTILS.sortObject(triggers, 'index');
                    let sortedInterceptors = [];
                    Object.keys(indexedInterceptors).forEach(key => {
                        if (indexedInterceptors[key] && indexedInterceptors[key].length > 0) {
                            sortedInterceptors = sortedInterceptors.concat(indexedInterceptors[key]);
                        }
                    });
                    interceptorList[itemName][triggerName] = sortedInterceptors;
                });
            });
        }
        return interceptorList;
    }
};