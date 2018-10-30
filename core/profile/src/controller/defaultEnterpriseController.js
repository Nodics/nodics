/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    getEnterprise: function (request, callback) {
        if (UTILS.isBlank(request.enterpriseCode)) {
            if (callback) {
                callback('Invalid enterprise code');
            } else {
                return Promise.reject('Invalid enterprise code');
            }
        } else {
            if (!request.local.tenant) {
                request.local.tenant = 'default';
            }
            if (!request.local.options) {
                request.local.options = {
                    recursive: true,
                    query: {
                        enterpriseCode: request.enterpriseCode
                    }
                };
            }
            if (callback) {
                FACADE.DefaultEnterpriseFacade.get(request, callback).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                return FACADE.DefaultEnterpriseFacade.get(request);
            }
        }
    }
};