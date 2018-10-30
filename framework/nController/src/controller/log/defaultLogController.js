/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    changeLogLevel: function (request, callback) {
        if (request.httpRequest.body) {
            request.logLevel = request.httpRequest.body.logLevel;
            request.entityName = request.httpRequest.body.entityName;
        }
        if (callback) {
            FACADE.DefaultLogFacade.changeLogLevel(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultLogFacade.changeLogLevel(request);
        }
    }
};