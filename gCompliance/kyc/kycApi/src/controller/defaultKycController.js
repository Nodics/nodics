/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');

const input = request => {
    const trusted = request || {};
    const authData = trusted.authData;
    const tenant = trusted.tenant;
    return Object.assign({}, trusted, trusted.httpRequest && trusted.httpRequest.body || {}, trusted.httpRequest && trusted.httpRequest.params || {}, {
        authData,
        tenant,
        webhookVerification: trusted.webhookVerification,
        tenantCode: tenant && (tenant.code || tenant) || trusted.tenantCode,
        enterpriseCode: authData && (authData.enterpriseCode || authData.entCode) || trusted.enterpriseCode
    });
};
const invoke = (operation, request, callback) => {
    const promise = FACADE.DefaultKycFacade[operation](input(request));
    if (!callback) return promise;
    promise.then(result => callback(null, result)).catch(callback);
};

/**
 * @module gCompliance/kyc/kycApi/src/controller/defaultKycController
 * @description Exposes request handlers for kyc default kyc controller operations.
 * @layer controller
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

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    initMobileKyc: function (request, callback) {
        request = _.merge(request || {}, request.httpRequest.body);
        if (callback) {
            FACADE.DefaultKycFacade.initMobileKyc(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultKycFacade.initMobileKyc(request);
        }
    },
    /**
     * Validates mobile kyc rules.
     *
     * @param {*} request Method input.
     * @param {*} callback Method input.
     * @returns {*} Method result.
     */
    validateMobileKyc: function (request, callback) {
        request = _.merge(request || {}, request.httpRequest.body);
        if (callback) {
            FACADE.DefaultKycFacade.validateMobileKyc(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultKycFacade.validateMobileKyc(request);
        }
    },
    /**
     * Initializes email kyc behavior for the module runtime.
     *
     * @param {*} request Method input.
     * @param {*} callback Method input.
     * @returns {*} Method result.
     */
    initEmailKyc: function (request, callback) {
        request = _.merge(request || {}, request.httpRequest.body);
        if (callback) {
            FACADE.DefaultKycFacade.initEmailKyc(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultKycFacade.initEmailKyc(request);
        }
    },
    submitCase: (request, callback) => invoke('submitCase', request, callback),
    performCaseAction: (request, callback) => invoke('performCaseAction', request, callback),
    performReviewTaskAction: (request, callback) => invoke('performReviewTaskAction', request, callback),
    deliverDocument: (request, callback) => invoke('deliverDocument', request, callback),
    evaluateEligibility: (request, callback) => invoke('evaluateEligibility', request, callback),
    manageProvider: (request, callback) => invoke('manageProvider', request, callback),
    manageProviderPolicy: (request, callback) => invoke('manageProviderPolicy', request, callback),
    summarizeOperations: (request, callback) => invoke('summarizeOperations', request, callback),
    handleProviderWebhook: (request, callback) => invoke('handleProviderWebhook', request, callback)
};
