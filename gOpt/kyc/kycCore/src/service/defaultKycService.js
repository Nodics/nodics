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
};