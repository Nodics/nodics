/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

*/

module.exports = {

    authenticateEmployee: function (request, callback) {
        request.local.loginId = request.get('loginId');
        request.local.password = request.get('password');
        request.local.enterpriseCode = request.get('enterpriseCode');
        request.local.source = request.get('source');
        FACADE.DefaultAuthenticationProviderFacade.authenticateEmployee(request, callback);

    },

    authenticateCustomer: function (request, callback) {
        request.local.loginId = request.get('loginId');
        request.local.password = request.get('password');
        request.local.enterpriseCode = request.get('enterpriseCode');
        request.local.source = request.get('source');
        FACADE.DefaultAuthenticationProviderFacade.authenticateCustomer(request, callback);

    },

    authorize: function (request, callback) {
        FACADE.DefaultAuthenticationProviderFacade.authorize(request, callback);
    }
};