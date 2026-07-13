/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const RequireFromString = require('require-from-string');

/**
 * @module gFramework/nDynamo/src/facade/class/defaultClassConfigurationFacade
 * @description Coordinates facade-level delegation for nDynamo default class configuration facade operations.
 * @layer facade
 * @owner nDynamo
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

     * Retrieves class information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    getClass: function (request) {
        return SERVICE.DefaultClassConfigurationService.getClass(request);
    },

    /**

     * Retrieves snapshot information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    getSnapshot: function (request) {
        return SERVICE.DefaultClassConfigurationService.getSnapshot(request);
    },

    /**

     * Updates class information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    updateClass: function (request) {
        return SERVICE.DefaultClassConfigurationService.updateClass(request);
    },

    /**

     * Processes class behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    executeClass: function (request) {
        return SERVICE.DefaultClassConfigurationService.executeClass(request);
    },
};