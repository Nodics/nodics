/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gOptional/kyc/kycCore/src/service/notify/docs/defaultDocumentKycNotificationInitPipelineService
 * @description Implements KYC document notification initialization validation for workflow notification pipelines.
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
     * Validates the tenant and authentication context required to initialize document KYC notification.
     *
     * @param {Object} request Pipeline request context.
     * @param {Object} response Pipeline response context.
     * @param {Object} process Pipeline process callbacks.
     * @returns {void}
     */
    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating request to init document kyc notification');
        if (!request.tenant || !request.authData) {
            process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00003', 'Invalid request, tenant can not be null or empty'));
        } else {
            response.success = {
                code: 'SUC_KYC_00003'
            }
            process.nextSuccess(request, response);
        }
    }
};
