/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    export: function (request, callback) {
        if (request.httpRequest) {
            request.export = request.httpRequest.body || {};
            request.export.query = request.export.query || request.httpRequest.query || {};
        }
        if (callback) {
            FACADE.DataExportFacade.export(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DataExportFacade.export(request);
        }
    }
};
