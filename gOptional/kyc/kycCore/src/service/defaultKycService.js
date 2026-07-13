/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gOptional/kyc/kycCore/src/service/defaultKycService
 * @description Implements kyc default kyc service business behavior and extension logic.
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

     * Initializes mobile kyc behavior for the module runtime.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    initMobileKyc: function (request, response) {
        request.kycService = this;
        request.type = ENUMS.KYCType.MOBILE.key;
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultPipelineService.start('initializeMobileKycPipeline', request, {}).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.WorkflowError('Facing issue while initializing mobile KYC'));
            }
        });
    },
    /**
     * Validates mobile kyc rules.
     *
     * @param {*} request Method input.
     * @param {*} response Method input.
     * @returns {*} Method result.
     */
    validateMobileKyc: function (request, response) {
        request.kycService = this;
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultPipelineService.start('validateMobileKycPipeline', request, {}).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.WorkflowError('Facing issue while validating mobile KYC'));
            }
        });
    },

    /**

     * Initializes email kyc behavior for the module runtime.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    initEmailKyc: function (request, response) {
        request.kycService = this;
        request.type = ENUMS.KYCType.EMAIL.key;
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultPipelineService.start('initializeEmailKycPipeline', request, {}).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.WorkflowError('Facing issue while initializing email KYC'));
            }
        });
    },
    /**
     * Validates email kyc rules.
     *
     * @param {*} request Method input.
     * @param {*} response Method input.
     * @returns {*} Method result.
     */
    validateEmailKyc: function (request, response) {
        request.kycService = this;
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultPipelineService.start('validateEmailKycPipeline', request, {}).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.WorkflowError('Facing issue while validating email KYC'));
            }
        });
    },
};