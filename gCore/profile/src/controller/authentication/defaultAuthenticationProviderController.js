/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

*/

module.exports = {

    authenticateEmployee: function (request, callback) {
        request.loginId = request.httpRequest.get('loginId');
        request.password = request.httpRequest.get('password');
        request.source = request.httpRequest.get('source');
        if (callback) {
            FACADE.DefaultAuthenticationProviderFacade.authenticateEmployee(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultAuthenticationProviderFacade.authenticateEmployee(request);
        }
    },

    authenticateCustomer: function (request, callback) {
        request.loginId = request.httpRequest.get('loginId');
        request.password = request.httpRequest.get('password');
        request.source = request.httpRequest.get('source');
        if (callback) {
            FACADE.DefaultAuthenticationProviderFacade.authenticateCustomer(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultAuthenticationProviderFacade.authenticateCustomer(request);
        }
    }
};