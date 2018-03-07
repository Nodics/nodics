/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

*/

module.exports = {

    authenticate: function(processRequest, callback) {
        let request = {
            moduleName: processRequest.moduleName,
            loginId: processRequest.httpRequest.get('loginId'),
            password: processRequest.httpRequest.get('password'),
            enterpriseCode: processRequest.httpRequest.get('enterpriseCode'),
            source: processRequest.httpRequest.get('source')
        };
        FACADE.AuthenticationProviderFacade.authenticate(request, callback);

    },

    authorize: function(processRequest, callback) {
        let request = {
            moduleName: processRequest.moduleName,
            authToken: processRequest.authToken
        };

        FACADE.AuthenticationProviderFacade.authorize(request, callback);

    }
};