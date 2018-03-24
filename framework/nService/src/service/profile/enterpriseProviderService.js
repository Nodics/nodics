/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    prepareURL: function(config) {
        return SERVICE.ModuleService.buildRequest({
            moduleName: 'profile',
            methodName: 'POST',
            apiName: 'enterprise/get',
            requestBody: {},
            isJsonResponse: true,
            header: {
                enterpriseCode: request.local.enterpriseCode
            }
        });
    },

    loadEnterprise: function(request, callback) {
        let input = request.local || request;
        SERVICE.ModuleService.fetch(this.prepareURL(input), (error, response) => {
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