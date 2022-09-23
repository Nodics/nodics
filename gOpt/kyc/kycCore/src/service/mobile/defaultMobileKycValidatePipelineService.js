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
    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating mobile KYC validation request');
        if (!request.refId || !request.opsType || !request.otp || !request.otp.key || !request.otp.ops || !request.otp.value) {
            process.error(request, response, new CLASSES.NodicsError('ERR_PRFL_00003', 'Invalid request to validate otp'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    buildKycQuery: function (request, response, process) {
        this.LOG.debug('Building mobile KYC model retrive query');
        request.kycInput = {
            searchOptions: {
                pageSize: 1,
                sort: {
                    updated: -1
                }
            },
            query: {
                refId: request.refId,
                type: ENUMS.KYCType.MOBILE.key,
                opsType: request.opsType,
                active: true,
                'item.loginId': request.otp.ops,
                'item.mobileNumber': request.otp.key
            }
        }
        process.nextSuccess(request, response);
    },
    loadKycMode: function (request, response, process) {
        this.LOG.debug('Loading mobile KYC model');
        request.kycService.get({
            tenant: request.tenant,
            authData: request.authData,
            searchOptions: request.kycInput.searchOptions,
            query: request.kycInput.query
        }, {}).then(success => {
            response.kycModel = success.result[0];
            process.nextSuccess(request, response);
        }).catch(error => {
            process.nextSuccess(request, response);
        });
    },
    validateMobileKyc: function (request, response, process) {
        this.LOG.debug('Initializing mobile KYC validation process');
        SERVICE.DefaultOtpService.validateOtp({
            tenant: request.tenant,
            authData: request.authData,
            model: {
                key: request.otp.key,
                ops: request.otp.ops,
                value: request.otp.value
            }
        }, response).then(success => {
            response.otpResult = success;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.nextSuccess(request, response);
        });
    },
    updateMobileKycWorkflow: function (request, response, process) {
        this.LOG.debug('Updating mobile KYC workflow about validation');
        process.nextSuccess(request, response);
        // if (NODICS.isModuleActive('workflow')) {
        //     SERVICE.DefaultWorkflowService.nextAction(_.merge({
        //         tenant: request.tenant,
        //         authData: request.authData
        //     }, request.carrierInput), response).then(success => {
        //         response.success = success;
        //         process.nextSuccess(request, response);
        //     }).catch(error => {
        //         process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_PRFL_00006'));
        //     });
        // } else {
        //     process.error(request, response, new CLASSES.NodicsError('ERR_PRFL_00003', 'Workflow module is not active in current micro-service'));
        //     // SERVICE.DefaultModuleService.fetch(this.prepareURL({
        //     //     tenant: tenant,
        //     //     requestBody: itemDetails
        //     // })).then(success => {
        //     //     resolve(success);
        //     // }).catch(error => {
        //     //     reject(error);
        //     // });
        // }
    },
    // updateKycModel: function (request, response, process) {
    //     this.LOG.debug('Creating KYC model for mobile validation');
    //     request.model = {
    //         type: request.type,
    //         opsType: request.opsType,
    //         refId: request.refId,
    //         description: request.description,
    //         active: true,
    //         workflow: {
    //             workflowCode: request.carrierInput.workflowCode,
    //             carrierCode: request.carrierInput.carrier.code
    //         },
    //         item: request.item
    //     }
    //     process.nextSuccess(request, response);

    // },
    updateMobileKycModel: function (request, response, process) {
        this.LOG.debug('Updating mobile KYC model after validation attempt');
        response.success = {
            code: 'SUC_KYC_00002',
            result: success.result
        }
        // process.nextSuccess(request, response);
        // request.kycService.save(request).then(success => {
        //     response.success = {
        //         code: 'SUC_KYC_00001',
        //         result: success.result
        //     }
        //     process.nextSuccess(request, response);
        // }).catch(error => {
        //     process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_KYC_00000'));
        // })
    }
};