/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    getEnterprise: function (request, callback) {
        if (UTILS.isBlank(request.entCode)) {
            if (callback) {
                callback({
                    success: false,
                    code: 'ERR_ENT_00000'
                });
            } else {
                return Promise.reject({
                    success: false,
                    code: 'ERR_ENT_00000'
                });
            }
        } else {
            if (!request.tenant) {
                request.tenant = 'default';
            }
            if (!request.options) {
                request.options = {
                    recursive: true,
                    query: {
                        code: request.entCode
                    }
                };
            }
            if (callback) {
                FACADE.DefaultEnterpriseFacade.get(request).then(success => {
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