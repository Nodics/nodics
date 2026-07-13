/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gOptional/kyc/kycApi/src/controller/defaultKycController
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
    }
};