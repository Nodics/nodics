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

    generateDefaultOTP: function (request) {
        let _self = this;
        try {
            let generatedOtp = Math.floor(
                CONFIG.get('otp').otpRangeStart
                + (CONFIG.get('otp').otpRangeEnd - CONFIG.get('otp').otpRangeStart)
                * Math.random());
            _self.LOG.debug('Generated Otp: ', generatedOtp);
            return generatedOtp;
        } catch (error) {
            throw new CLASSES.NodicsError(error, 'While generating OTP', 'ERR_OTP_00000');
        }
    },
    generateExpiry: function (request) {
        let _self = this;
        try {
            let life = new Date((new Date()).getTime() + CONFIG.get('otp').validUpTo * 1000);
            _self.LOG.debug(' Otp Expire at: ', life);
            return life;
        } catch (error) {
            throw new CLASSES.NodicsError(error, 'While generating OTP', 'ERR_OTP_00000');
        }
    }
};