/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information")
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics
*/

const _ = require('lodash');

module.exports = {
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    generateOtp: function (request) {
        request.otpService = this;
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('otpGeneratorPipeline', request, {}).then(success => {
                resolve(success);
            }).catch(error => {
                reject(new CLASSES.NodicsError(error, null, 'ERR_OTP_00000'));
            });
        });
    },

    validateOtp: function (request) {

        request.otpService = this;
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('otpValidatorPipeline', request, {}).then(success => {
                resolve(success);
            }).catch(error => {
                reject(new CLASSES.NodicsError(error, null, 'ERR_OTP_00000'));
            });
        });
    },
};