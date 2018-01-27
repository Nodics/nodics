/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    options: {
        isNew: true
    },

    addToken: function(request, token) {
        new Promise((resolve, reject) => {
            try {
                let currentModule = NODICS.getModules(request.moduleName);
                currentModule.authToken = token;
                resolve(token);
            } catch (error) {
                reject(error);
            }
        });
    },

    findToken: function(request, callback) {
        let moduleObject = NODICS.getModules(request.moduleName);
        if (moduleObject && moduleObject.cache && moduleObject.cache[request.authToken]) {
            callback(null, moduleObject.cache[request.authToken]);
        } else {
            callback('Invalid token');
        }
    },

    authorizeToken: function(processRequest, callback) {
        console.log('Authorizing token');
        this.findToken(processRequest, (error, token) => {
            if (error) {
                let options = {
                    moduleName: 'profile',
                    methodName: 'POST',
                    apiName: 'authorize',
                    requestBody: {},
                    isJsonResponse: true,
                    authToken: processRequest.authToken
                };
                let requestUrl = SERVICE.ModuleService.buildRequest(options);
                console.log('   INFO: Authorizing reqiuest for token :', processRequest.authToken);
                SERVICE.ModuleService.fetch(requestUrl, (error, response) => {
                    if (error) {
                        callback(error, null);
                    } else if (!response.success) {
                        callback('Given token is not valid one', null);
                    } else {
                        callback(null, response.result[0]);
                    }
                });
            } else {
                callback(null, token);
            }
        });
    }
};