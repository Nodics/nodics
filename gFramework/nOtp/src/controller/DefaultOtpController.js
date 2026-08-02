/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');

/**
 * @module gFramework/nOtp/src/controller/DefaultOtpController
 * @description Exposes request handlers for nOtp default otp controller operations.
 * @layer controller
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
     * @param {*} callback Method input.
     * @returns {*} Method result.
     */
    generateOtp: function (request, callback) {
        request.model = request.httpRequest.body;
        if (callback) {
            FACADE.DefaultOtpFacade.generateOtp(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOtpFacade.generateOtp(request);
        }
    },
    /**
     * Validates otp rules.
     *
     * @param {*} request Method input.
     * @param {*} callback Method input.
     * @returns {*} Method result.
     */
    validateOtp: function (request, callback) {
        request.model = request.httpRequest.body;
        if (callback) {
            FACADE.DefaultOtpFacade.validateOtp(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOtpFacade.validateOtp(request);
        }
    }
};