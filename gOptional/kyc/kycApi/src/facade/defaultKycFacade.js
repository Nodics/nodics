/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gOptional/kyc/kycApi/src/facade/defaultKycFacade
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
    }
};