/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

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

    importLocalData: function (request, callback) {
        if (!UTILS.isBlank(request.httpRequest.body) && !UTILS.isBlank(request.httpRequest.body.inputPath)) {
            request.inputPath = request.httpRequest.body.inputPath;
            request.importFinalizeData = request.httpRequest.body.importFinalizeData || true;
        }
        if (callback) {
            FACADE.DefaultImportFacade.importLocalData(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultImportFacade.importLocalData(request);
        }
    },
};