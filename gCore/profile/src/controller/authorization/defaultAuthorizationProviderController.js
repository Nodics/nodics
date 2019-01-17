/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

*/

module.exports = {
    authorizeToken: function (request, callback) {
        if (callback) {
            FACADE.DefaultAuthorizationProviderFacade.authorizeToken(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultAuthorizationProviderFacade.authorizeToken(request);
        }
    },

    authorizeAPIKey: function (request, callback) {
        if (callback) {
            FACADE.DefaultAuthorizationProviderFacade.authorizeAPIKey(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultAuthorizationProviderFacade.authorizeAPIKey(request);
        }
    }
};