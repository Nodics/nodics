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

    buildRequest: function(options) {
        console.log('   INFO: Building request url for module ', options.moduleName);
        let header = {
            'content-type': options.contentType || CONFIG.get('defaultContentType')
        };
        if (options.header) {
            _.merge(header, options.header);
        }
        return {
            method: options.methodName || 'GET',
            uri: SYSTEM.prepareConnectionUrl(options.moduleName) + '/' + options.apiName,
            headers: header,
            body: options.requestBody,
            json: options.isJsonResponse || true
        };
    },

    fetch: function(requestUrl, callback) {
        if (callback) {
            requestPromise(requestUrl)
                .then(response => {
                    callback(null, response, requestUrl);
                })
                .catch(error => {
                    callback(error, null, requestUrl);
                });
        } else {
            return requestPromise(requestUrl);
        }
    }
};