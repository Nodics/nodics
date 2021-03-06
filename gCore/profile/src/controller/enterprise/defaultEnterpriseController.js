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
            let error = new CLASSES.NodicsError('ERR_PRFL_00003', 'Enterprise code can not be null or empty');
            if (callback) {
                callback(error);
            } else {
                return Promise.reject(error);
            }
        } else {
            if (!request.tenant) request.tenant = 'default';
            if (!request.options) request.options = {};
            request.options.recursive = request.options.recursive || true;
            request.query = {
                code: request.entCode
            };
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