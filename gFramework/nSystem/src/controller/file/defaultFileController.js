/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nSystem/src/controller/file/defaultFileController
 * @description Exposes request handlers for nSystem default file controller operations.
 * @layer controller
 * @owner nSystem
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

     * Retrieves file content information.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    getFileContent: function (request, callback) {
        if (request.httpRequest.body) {
            request.type = request.httpRequest.body.type;
            request.path = request.httpRequest.body.path;
            request.fileName = request.httpRequest.body.fileName;
        }
        if (callback) {
            FACADE.DefaultFileFacade.getFileContent(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultFileFacade.getFileContent(request);
        }
    },

    /**

     * Executes download file behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    downloadFile: function (request, callback) {
        if (request.httpRequest.body) {
            request.path = request.httpRequest.body.path;
            request.fileName = request.httpRequest.body.fileName;
        }
        if (callback) {
            FACADE.DefaultFileFacade.downloadFile(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultFileFacade.downloadFile(request);
        }
    }
};