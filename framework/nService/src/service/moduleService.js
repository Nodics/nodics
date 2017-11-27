/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

var requestPromise = require('request-promise');

module.exports = {
    options: {
        isNew: true
    },
    buildRequest: function(moduleName, methodName, apiName, requestBody, contentType, isJsonResponse) {
        return {
            method: methodName || 'GET',
            uri: SYSTEM.prepareConnectionUrl(moduleName) + '/' + apiName,
            headers: {
                'content-type': contentType || CONFIG.defaultContentType,
                'tenant': 'default',
                'authTocken': 'xdcfgvhbjn324356gfbvd'
            },
            body: requestBody,
            json: isJsonResponse || true
        };
    },

    fetch: function(options, callback) {
        console.log('Calling ', options);
        if (callback) {
            requestPromise(options)
                .then(function(response) {
                    callback(null, response, options);
                })
                .catch(function(error) {
                    callback(error, null, options);
                });
        } else {
            return requestPromise(options);
        }
    }
};