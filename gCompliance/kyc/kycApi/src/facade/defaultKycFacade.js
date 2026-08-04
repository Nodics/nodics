/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCompliance/kyc/kycApi/src/facade/defaultKycFacade
 * @description Coordinates facade-level delegation for kyc default kyc facade operations.
 * @layer facade
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

     * Initializes mobile kyc behavior for the module runtime.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    initMobileKyc: function (request) {
        return SERVICE.DefaultKycService.initMobileKyc(request);
    },
    /**
     * Validates mobile kyc rules.
     *
     * @param {*} request Method input.
     * @returns {*} Method result.
     */
    validateMobileKyc: function (request) {
        return SERVICE.DefaultKycService.validateMobileKyc(request);
    },
    /**
     * Initializes email kyc behavior for the module runtime.
     *
     * @param {*} request Method input.
     * @returns {*} Method result.
     */
    initEmailKyc: function (request) {
        return SERVICE.DefaultKycService.initEmailKyc(request);
    },
    submitCase: request => SERVICE.DefaultKycService.submitCase(request),
    performCaseAction: request => SERVICE.DefaultKycService.performCaseAction(request),
    performReviewTaskAction: request => SERVICE.DefaultKycService.performReviewTaskAction(request),
    deliverDocument: request => SERVICE.DefaultKycService.deliverDocument(request),
    evaluateEligibility: request => SERVICE.DefaultKycService.evaluateEligibility(request),
    manageProvider: request => SERVICE.DefaultKycService.manageProvider(request),
    manageProviderPolicy: request => SERVICE.DefaultKycService.manageProviderPolicy(request),
    summarizeOperations: request => SERVICE.DefaultKycService.summarizeOperations(request),
    handleProviderWebhook: request => SERVICE.DefaultKycService.handleProviderWebhook(request)
};
