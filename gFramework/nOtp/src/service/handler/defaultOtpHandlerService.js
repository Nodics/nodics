/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nOtp/src/service/handler/defaultOtpHandlerService
 * @description Implements nOtp default otp handler service business behavior and extension logic.
 * @layer service
 * @owner nOtp
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
const crypto = require('crypto');

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

     * Executes generate token behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    generateToken: function (request) {
        let _self = this;
        try {
            let otpConfig = CONFIG.get('token').OTP;
            let generatedOtp = crypto.randomInt(Number(otpConfig.rangeStart), Number(otpConfig.rangeEnd));
            _self.LOG.debug('Generated OTP using cryptographically secure randomness');
            return generatedOtp;
        } catch (error) {
            throw new CLASSES.NodicsError(error, 'While generating OTP', 'ERR_OTP_00000');
        }
    },
    /**
     * Executes generate expiry behavior.
     *
     * @param {*} request Method input.
     * @returns {*} Method result.
     */
    generateExpiry: function (request) {
        let _self = this;
        try {
            let otpConfig = CONFIG.get('token').OTP;
            let life = new Date((new Date()).getTime() + otpConfig.validUpTo * 1000);
            _self.LOG.debug(' Otp Expire at: ', life);
            return life;
        } catch (error) {
            throw new CLASSES.NodicsError(error, 'While generating OTP', 'ERR_OTP_00000');
        }
    }
};
