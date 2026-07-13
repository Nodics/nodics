/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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
    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating request to init kyc notification');
        if (!request.tenant || !request.authData) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
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
                refId: request.model.refId,
                type: request.model.type,
                opsType: request.model.opsType,
                active: true,
            }
        }
        process.nextSuccess(request, response);
    },
    loadKycMode: function (request, response, process) {
        this.LOG.debug('Loading mobile KYC model');
        SERVICE.DefaultKycService.get({
            tenant: request.tenant,
            authData: request.authData,
            searchOptions: request.kycInput.searchOptions,
            query: request.kycInput.query
        }, {}).then(success => {
            if (success.result || success.result.length === 1) {
                request.kycModel = success.result[0];
                process.nextSuccess(request, response);
            } else {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_KYC_00001'));
            }
        }).catch(error => {
            process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_KYC_00000'));
        });
    },
    checkKycType: function (request, response, process) {
        if (request.kycModel.type === ENUMS.KYCType.MOBILE.key) {
            response.targetNode = 'mobileKyc';
            process.nextSuccess(request, response);
        } else if (request.kycModel.type === ENUMS.KYCType.EMAIL.key) {
            response.targetNode = 'emailKyc';
            process.nextSuccess(request, response);
        } else if (request.kycModel.type === ENUMS.KYCType.DOCS.key) {
            response.targetNode = 'docKyc';
            process.nextSuccess(request, response);
        } else {
            process.error(request, response, new CLASSES.WorkflowError('ERR_KYC_00002'));
        }
    },
    handleSuccess: function (request, response, process) {
        process.resolve(response.success);
    }
};
