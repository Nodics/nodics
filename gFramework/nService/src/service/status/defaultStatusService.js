/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

let assert = require('assert');

/**
 * @module service/status/DefaultStatusService
 * @description Loads and serves Nodics status/error definitions from active
 * module hierarchy. It validates each status definition and provides runtime
 * lookup for consistent error and success response messages.
 * @layer service
 * @owner nService
 * @override Project modules may override status definitions through layered
 * `statusDefinitions.js` files or override this service for alternate response
 * catalog governance.
 *
 * @property {Object} statusMap Effective status definition registry.
 */
module.exports = {

    statusMap: {},

    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            try {
                this.loadStatusDefinitions();
                resolve(true);
            } catch (error) {
                reject(error);
            }
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
     * Loads layered status definitions into the runtime status map.
     *
     * @returns {undefined}
     * @sideEffects Mutates `statusMap`.
     * @throws {AssertionError} When a status code or message is missing.
     */
    loadStatusDefinitions: function () {
        let statusCodes = SERVICE.DefaultFilesLoaderService.loadFiles('/src/utils/statusDefinitions.js');
        Object.keys(statusCodes).forEach(errorCode => {
            let status = statusCodes[errorCode];
            assert.ok(status.code, 'Invalid response code for: ' + errorCode + ', it can not be null or empty');
            assert.ok(status.message, 'Invalid error message for: ' + errorCode + ', it can not be null or empty');
            this.statusMap[errorCode] = status;
        });
    },

    /**
     * Updates one runtime status definition.
     *
     * @param {string} errorCode Status/error code.
     * @param {Object} status Status definition.
     * @returns {undefined}
     */
    updateStatus: function (errorCode, status) {
        this.statusMap[errorCode] = status;
    },

    /**
     * Retrieves one runtime status definition.
     *
     * @param {string} errorCode Status/error code.
     * @returns {Object} Status definition.
     * @throws {CLASSES.NodicsError} When the code is unknown.
     */
    get: function (errorCode) {
        if (!UTILS.isBlank(this.statusMap[errorCode])) {
            return this.statusMap[errorCode];
        } else {
            throw new CLASSES.NodicsError('ERR_SYS_00000', 'Invalid error code: ' + errorCode);
        }
    },
};
