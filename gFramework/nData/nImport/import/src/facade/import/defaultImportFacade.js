/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nData/nImport/import/src/facade/import/defaultImportFacade
 * @description Coordinates facade-level delegation for nData default import facade operations.
 * @layer facade
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
     * @returns {*} Method result.
     */
    importInitData: function (request) {
        return SERVICE.DefaultImportService.importInitData(request);
    },

    /**

     * Executes import core data behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    importCoreData: function (request) {
        return SERVICE.DefaultImportService.importCoreData(request);
    },

    /**

     * Executes import sample data behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    importSampleData: function (request) {
        return SERVICE.DefaultImportService.importSampleData(request);
    },

    /**

     * Executes import local data behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    importLocalData: function (request) {
        return SERVICE.DefaultImportService.importLocalData(request);
    },

    /**

     * Executes import remote data behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    importRemoteData: function (request) {
        return SERVICE.DefaultImportService.importRemoteData(request);
    }
};
