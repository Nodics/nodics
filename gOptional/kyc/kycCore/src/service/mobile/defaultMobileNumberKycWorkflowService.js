/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

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

    performHeadOperation: function (request, response) {
        return new Promise((resolve, reject) => {
            resolve({
                decision: 'INITIATE',
                feedback: {
                    message: 'Mobile number OTP verification initiated'
                }
            });
        });
    },

    initMobileOTP: function (request, response) {
        return new Promise((resolve, reject) => {
            let otpModel = request.workflowCarrier.items[0];
            SERVICE.DefaultOtpService.generateOtp({
                tenant: request.tenant,
                authData: request.authData,
                model: {
                    key: otpModel.mobileNumber,
                    ops: otpModel.loginId,
                    active: true,
                    limit: otpModel.limit || CONFIG.get('token').OTP.attemptLimit || 5,
                    singleUseToken: CONFIG.get('token').OTP.singleUseToken || false
                }
            }, response).then(success => {
                resolve({
                    decision: 'NOTIFY',
                    internalResponce: success.result,
                    customerResponse: success.result,
                    feedback: {
                        message: 'OTP for the mobile been generated'
                    }
                });
            }).catch(error => {
                resolve({
                    decision: 'ERROR',
                    otpError: error,
                    feedback: {
                        message: 'Failed OTP generation for mobile verification'
                    }
                });
            });
        });
    },

    notifyMobileOTP: function (request, response) {
        return new Promise((resolve, reject) => {
            let otpModel = request.workflowCarrier.items[0];
            otpModel.type = ENUMS.KYCType.MOBILE.key;
            SERVICE.DefaultPipelineService.start('initKycNotificationPipeline', {
                tenant: request.tenant,
                authData: request.authData,
                model: otpModel
            }, {}).then(success => {
                resolve({
                    decision: 'VALIDATEOTP',
                    feedback: {
                        message: 'Customer notified for generated OTP'
                    }
                });
            }).catch(error => {
                resolve({
                    decision: 'ERROR',
                    notifyError: error,
                    feedback: {
                        message: 'Failed OTP generation for mobile verification'
                    }
                });
            });
        });
    },

    updateOTPValidated: function (request, response) {
        return new Promise((resolve, reject) => {
            resolve({
                decision: 'SUCCESS',
                feedback: {
                    message: 'OTP for the mobile been validated'
                }
            });
        });
    }
};