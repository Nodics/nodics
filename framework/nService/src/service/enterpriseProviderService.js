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

    loadEnterprise: function(processRequest, callback) {
        let options = {
            moduleName: 'profile',
            methodName: 'POST',
            apiName: 'enterprise/get',
            requestBody: {},
            isJsonResponse: true,
            enterpriseCode: processRequest.enterpriseCode
        };
        let requestUrl = SERVICE.ModuleService.buildRequest(options);
        console.log('loadEnterprise : ', requestUrl);
        SERVICE.ModuleService.fetch(requestUrl, (error, response) => {
            if (error) {
                callback(error, null);
            } else if (!response.success) {
                callback(error, null);
            } else {
                callback(null, response.result[0]);
            }
        });
    }
};