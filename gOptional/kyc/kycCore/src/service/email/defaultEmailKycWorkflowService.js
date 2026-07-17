/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gOptional/kyc/kycCore/src/service/email/defaultEmailKycWorkflowService
 * @description Implements kyc default email kyc workflow service business behavior and extension logic.
 * @layer service
 * @owner kyc
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

     * Executes perform head operation behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    performHeadOperation: function (request, response) {
        return new Promise((resolve, reject) => {
            resolve({
                decision: 'INITIATE',
                feedback: {
                    message: 'Email OTP verification initiated'
                }
            });
        });
    },

    /**

     * Initializes email otp behavior for the module runtime.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    initEmailOTP: function (request, response) {
        return new Promise((resolve, reject) => {
            let otpModel = request.workflowCarrier.items[0];
            SERVICE.DefaultOtpService.generateOtp({
                tenant: request.tenant,
                authData: request.authData,
                model: {
                    key: otpModel.email,
                    ops: otpModel.loginId,
                    active: true,
                    limit: otpModel.limit || CONFIG.get('token').OTP.attemptLimit || 5,
                    singleUseToken: CONFIG.get('token').OTP.singleUseToken || false
                }
            }, response).then(success => {
                resolve({
                    decision: 'NOTIFY',
                    otp: success.result,
                    feedback: {
                        message: 'OTP for the email been generated'
                    }
                });
            }).catch(error => {
                resolve({
                    decision: 'ERROR',
                    otpError: error,
                    feedback: {
                        message: 'Failed OTP generation for email verification'
                    }
                });
            });
        });
    },

    /**

     * Executes notify mobile otp behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    notifyMobileOTP: function (request, response) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('initKycNotificationPipeline', {
                tenant: request.tenant,
                authData: request.authData
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

    /**

     * Updates otpvalidated information.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    updateOTPValidated: function (request, response) {
        return new Promise((resolve, reject) => {
            resolve({
                decision: 'SUCCESS',
                feedback: {
                    message: 'OTP for the email been validated'
                }
            });
        });
    }
};