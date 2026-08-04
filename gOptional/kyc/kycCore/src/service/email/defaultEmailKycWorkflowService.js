/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
        let model = request.workflowCarrier.items[0];
        return SERVICE.DefaultNotifyVerificationService.create(request, { key: model.email, ops: model.loginId, channelCode: 'email', recipientType: 'EMAIL', recipientReference: 'kyc-email:' + model.loginId, maskedRecipient: String(model.email).replace(/^(.).*(@.*)$/, '$1***$2'), ownerModule: 'kyc', ownerReferenceType: 'EMAIL_KYC', ownerReferenceCode: model.code || model.loginId, idempotencyKey: 'kyc-email:' + (model.code || model.loginId), correlationId: model.code || model.loginId, variables: { brandName: model.brandName || 'Nodics', supportContact: model.supportContact || 'Support' } }).then(result => ({ decision: 'NOTIFY', verification: result, feedback: { message: 'Email verification challenge delivered' } })).catch(error => ({ decision: 'ERROR', verificationError: { code: error.code || 'ERR_NOTIFY_00011' }, feedback: { message: 'Failed email verification challenge delivery' } }));
    },

    /**

     * Executes notify mobile otp behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    notifyMobileOTP: function (request, response) {
        return Promise.resolve({ decision: 'VALIDATEOTP', feedback: { message: 'Email verification challenge is ready for validation' } });
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
