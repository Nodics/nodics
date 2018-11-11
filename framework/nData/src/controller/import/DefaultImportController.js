/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    importInitData: function (request, callback) {
        if (!UTILS.isBlank(request.httpRequest.body)) {
            request.modules = request.httpRequest.body.modules || [];
            request.path = request.httpRequest.body.path || null;
        }
        if (callback) {
            FACADE.DefaultImportFacade.importInitData(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultImportFacade.importInitData(request);
        }
    },

    importCoreData: function (request, callback) {
        if (!UTILS.isBlank(request.httpRequest.body)) {
            request.modules = request.httpRequest.body.modules || [];
            request.path = request.httpRequest.body.path || null;
        }
        if (callback) {
            FACADE.DefaultImportFacade.importCoreData(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultImportFacade.importCoreData(request);
        }
    },

    importSampleData: function (request, callback) {
        if (!UTILS.isBlank(request.httpRequest.body)) {
            request.modules = request.httpRequest.body.modules || [];
            request.path = request.httpRequest.body.path || [];
        }
        if (callback) {
            FACADE.DefaultImportFacade.importSampleData(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultImportFacade.importSampleData(request);
        }
    },
};