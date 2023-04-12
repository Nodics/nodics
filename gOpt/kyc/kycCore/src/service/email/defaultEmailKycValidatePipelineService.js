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
        this.LOG.debug('Validating email KYC validation request');
        if (!request.refId || !request.opsType || !request.otp || !request.otp.key || !request.otp.ops || !request.otp.value) {
            process.error(request, response, new CLASSES.NodicsError('ERR_PRFL_00003', 'Invalid request to validate otp'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    buildKycQuery: function (request, response, process) {
        this.LOG.debug('Building email KYC model retrive query');
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
                'item.email': request.otp.key
            }
        }
        process.nextSuccess(request, response);
    },
    loadKycMode: function (request, response, process) {
        this.LOG.debug('Loading email KYC model');
        request.kycService.get({
            tenant: request.tenant,
            authData: request.authData,
            searchOptions: request.kycInput.searchOptions,
            query: request.kycInput.query
        }, {}).then(success => {
            if (success.result || success.result.length === 1) {
                response.kycModel = success.result[0];
                process.nextSuccess(request, response);
            } else {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_KYC_00001'));
            }
        }).catch(error => {
            process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_KYC_00000'));
        });
    },
    validateMobileKyc: function (request, response, process) {
        this.LOG.debug('Initializing email KYC validation process');
        SERVICE.DefaultOtpService.validateOtp({
            tenant: request.tenant,
            authData: request.authData,
            model: {
                key: request.otp.key,
                ops: request.otp.ops,
                value: request.otp.value
            }
        }, response).then(success => {
            response.otpResult = {
                code: success.code
            };
            process.nextSuccess(request, response);
        }).catch(error => {
            let errorCode = error.code;
            if (errorCode) {
                response.otpResult = {
                    code: errorCode
                };
            } else {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_KYC_00000'));
            }
            process.nextSuccess(request, response);
        });
    },
    updateMobileKycWorkflow: function (request, response, process) {
        this.LOG.debug('Updating email KYC workflow about validation');
        let responseMapping = CONFIG.get('kyc').responseMapping[response.otpResult.code];
        if (!responseMapping) {
            responseMapping = CONFIG.get('kyc').responseMapping.default;
        }
        request.actionResponse = {
            decision: responseMapping.decision,
            feedback: {
                code: response.otpResult.code,
                message: responseMapping.message
            }
        };
        if (NODICS.isModuleActive('workflow')) {
            SERVICE.DefaultWorkflowService.performAction({
                tenant: request.tenant,
                authData: request.authData,
                carrierCode: response.kycModel.workflow.carrierCode,
                actionResponse: request.actionResponse
            }, response).then(success => {
                response.workflowResult = {
                    success: success
                }
                process.nextSuccess(request, response);
            }).catch(error => {
                response.workflowResult = {
                    error: error
                }
                process.nextSuccess(request, response);
            });
        } else {
            process.error(request, response, new CLASSES.NodicsError('ERR_PRFL_00003', 'Workflow module is not active in current micro-service'));
            // SERVICE.DefaultModuleService.fetch(this.prepareURL({
            //     tenant: tenant,
            //     requestBody: itemDetails
            // })).then(success => {
            //     resolve(success);
            // }).catch(error => {
            //     reject(error);
            // });
        }
    },
    buildMobileKycModel: function (request, response, process) {
        this.LOG.debug('Constructing Kyc model after operations');
        let kycModel = response.kycModel;
        if (!kycModel.states) kycModel.states = [];
        kycModel.states.push({
            otp: request.actionResponse,
            workflow: (response.workflowResult && response.workflowResult.success) ? {
                success: true,
                code: response.workflowResult.success.code,

            } : {
                success: false,
                code: response.workflowResult.error.code
            }
        });
        process.nextSuccess(request, response);
    },
    updateMobileKycModel: function (request, response, process) {
        this.LOG.debug('Updating mobile KYC model after validation attempt');
        request.kycService.save({
            tenant: request.tenant,
            authData: request.authData,
            model: request.kycModel,
            query: {
                _id: request.kycModel._id
            }
        }, {}).then(success => {
            response.success = {
                code: 'SUC_KYC_00001',
                result: success.result
            }
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, new CLASSES.NodicsError(error));
        })
    }
};