/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

*/

module.exports = {

    mapCredentials: function (request) {
        let body = request.httpRequest.body || {};
        let compatibility = CONFIG.get('authSecurity') && CONFIG.get('authSecurity').compatibility || {};
        request.loginId = body.loginId;
        request.password = body.password;
        request.source = body.source;
        if (compatibility.allowPasswordHeaders === true) {
            request.loginId = request.loginId || request.httpRequest.get('loginId');
            request.password = request.password || request.httpRequest.get('password');
            request.source = request.source || request.httpRequest.get('source');
        }
    },

    mapRefreshToken: function (request) {
        let body = request.httpRequest.body || {};
        request.refreshToken = body.refreshToken;
    },

    authenticateEmployee: function (request, callback) {
        this.mapCredentials(request);
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
        this.mapCredentials(request);
        if (callback) {
            FACADE.DefaultAuthenticationProviderFacade.authenticateCustomer(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultAuthenticationProviderFacade.authenticateCustomer(request);
        }
    },

    refreshToken: function (request, callback) {
        this.mapRefreshToken(request);
        let operation = SERVICE.DefaultAuthenticationProviderService.rotateRefreshToken(request);
        if (callback) operation.then(result => callback(null, { code: 'SUC_AUTH_00000', result: result })).catch(callback);
        else return operation.then(result => ({ code: 'SUC_AUTH_00000', result: result }));
    },

    logout: function (request, callback) {
        this.mapRefreshToken(request);
        let operation = SERVICE.DefaultAuthenticationProviderService.revokeSession(request);
        if (callback) operation.then(() => callback(null, { code: 'SUC_AUTH_00000', result: true })).catch(callback);
        else return operation.then(() => ({ code: 'SUC_AUTH_00000', result: true }));
    }
};
