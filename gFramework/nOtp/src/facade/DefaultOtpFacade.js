/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nOtp/src/facade/DefaultOtpFacade
 * @description Coordinates facade-level delegation for nOtp default otp facade operations.
 * @layer facade
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
        return SERVICE.DefaultOtpService.generateOtp(request);
    },
    /**
     * Validates otp rules.
     *
     * @param {*} request Method input.
     * @returns {*} Method result.
     */
    validateOtp: function (request) {
        return SERVICE.DefaultOtpService.validateOtp(request);
    }
};