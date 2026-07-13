/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information")
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics
*/

const _ = require('lodash');

/**
 * @module gFramework/nOtp/src/service/DefaultOtpService
 * @description Implements nOtp default otp service business behavior and extension logic.
 * @layer service
 * @owner nOtp
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * Initializes  behavior for the module runtime.
     *
     * @param {*} options Method input.
     * @returns {*} Method result.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    /**
     * Runs post-initialization behavior after the module runtime is available.
     *
     * @param {*} options Method input.
     * @returns {*} Method result.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**

     * Executes generate otp behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    generateOtp: function (request) {
        return new Promise((resolve, reject) => {
            request.model.type = 'OTP';
            SERVICE.DefaultTokenService.generateToken(request).then(success => {
                resolve(success);
            }).catch(error => {
                reject(new CLASSES.NodicsError(error));
            });
        });
    },

    /**

     * Validates otp rules.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    validateOtp: function (request) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultTokenService.validateToken(request).then(success => {
                resolve(success);
            }).catch(error => {
                reject(new CLASSES.NodicsError(error));
            });
        });
    },
};