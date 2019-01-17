/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
module.exports = {
    getAPIKey: function (request, callback) {
        if (request.httpRequest.params.tntCode) {
            request.tenant = request.httpRequest.params.tntCode;
        }
        if (callback) {
            FACADE.DefaultAPIKeyFacade.getAPIKey(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultAPIKeyFacade.getAPIKey(request);
        }
    }
};