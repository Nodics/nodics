/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nData/nImport/import/src/controller/import/DefaultImportController
 * @description Exposes request handlers for nData default import controller operations.
 * @layer controller
 * @owner nData
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
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

    /**

     * Executes import init data behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    importInitData: function (request, callback) {
        if (!UTILS.isBlank(request.httpRequest.body)) {
            request.modules = request.httpRequest.body.modules || [];
            request.path = request.httpRequest.body.path || null;
            request.options = request.httpRequest.body.options || {};
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

    /**

     * Executes import core data behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    importCoreData: function (request, callback) {
        if (!UTILS.isBlank(request.httpRequest.body)) {
            request.modules = request.httpRequest.body.modules || [];
            request.path = request.httpRequest.body.path || null;
            request.options = request.httpRequest.body.options || {};
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

    /**

     * Executes import sample data behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    importSampleData: function (request, callback) {
        if (!UTILS.isBlank(request.httpRequest.body)) {
            request.modules = request.httpRequest.body.modules || [];
            request.path = request.httpRequest.body.path || [];
            request.options = request.httpRequest.body.options || {};
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

    /**

     * Executes import local data behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    importLocalData: function (request, callback) {
        if (!UTILS.isBlank(request.httpRequest.body) && !UTILS.isBlank(request.httpRequest.body.inputPath)) {
            request.inputPath = request.httpRequest.body.inputPath;
            request.importFinalizeData = request.httpRequest.body.importFinalizeData !== undefined ? request.httpRequest.body.importFinalizeData : true;
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
