/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    importInitData: function (request, callback) {
        if (!UTILS.isBlank(request.body)) {
            request.local.modules = request.body.modules || [];
            request.local.path = request.body.path || null;
        }
        FACADE.DefaultImportFacade.importInitData(request, callback);
    },

    importCoreData: function (request, callback) {
        if (!UTILS.isBlank(request.body)) {
            request.local.modules = request.body.modules || [];
            request.local.path = request.body.path || null;
        }
        FACADE.DefaultImportFacade.importCoreData(request, callback);

    },

    importSampleData: function (request, callback) {
        if (!UTILS.isBlank(request.body)) {
            request.local.modules = request.body.modules || [];
            request.local.path = request.body.path || [];
        }
        FACADE.DefaultImportFacade.importSampleData(request, callback);
    },
};