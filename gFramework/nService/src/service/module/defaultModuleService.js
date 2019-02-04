/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const requestPromise = require('request-promise');
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

    buildRequest: function (options) {
        this.LOG.debug('Building request url for module ', options.moduleName);
        let header = {
            'content-type': options.contentType || CONFIG.get('defaultContentType')
        };
        if (options.header) {
            _.merge(header, options.header);
        }
        let url = SERVICE.DefaultRouterService.prepareUrl(options);
        if (!options.apiName.startsWith('/')) {
            url += '/';
        }
        return {
            method: options.methodName || 'GET',
            uri: url + options.apiName,
            headers: header,
            body: options.requestBody || {},
            json: options.isJsonResponse || true
        };
    },

    fetch: function (requestUrl, callback) {
        this.LOG.debug('Hitting module communication URL : ', JSON.stringify(requestUrl));
        if (callback) {
            try {
                requestPromise(requestUrl).then(response => {
                    callback(null, response);
                }).catch(error => {
                    callback(error);
                });
            } catch (error) {
                callback(error);
            }
        } else {
            return requestPromise(requestUrl);
        }
    }
};