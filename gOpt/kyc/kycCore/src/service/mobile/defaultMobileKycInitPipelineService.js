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
        this.LOG.debug('Validating mobile KYC init request');
        if (!request.refId) {
            process.error(request, response, new CLASSES.NodicsError('ERR_PRFL_00003', 'Invalid service detail to execute'));
        } else if (!request.type) {
            process.error(request, response, new CLASSES.NodicsError('ERR_PRFL_00003', 'Invalid customer detail to execute'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    buildKycCarrierModel: function (request, response, process) {
        this.LOG.debug('Creating KYC Carrier model for mobile validation');
        request.carrierInput = {
            workflowCode: 'mobileNumberKycWorkflow',
            releaseCarrier: true,
            carrier: {
                code: request.refId + 'MobileKycCarrier_' + (new Date()).getTime(),
                sourceDetail: request.sourceDetail || {
                    schemaName: 'kyc',
                    moduleName: 'kyc'
                },
                event: request.event || {
                    enabled: false
                },
                items: [_.merge({
                    type: request.type,
                    opsType: request.opsType,
                    refId: request.refId,
                    description: request.description
                }, request.item)]
            }
        }
        process.nextSuccess(request, response);

    },
    initMobileKyc: function (request, response, process) {
        this.LOG.debug('Initializing mobile KYC process');
        if (NODICS.isModuleActive('workflow')) {
            SERVICE.DefaultWorkflowService.initCarrierItem(_.merge({
                tenant: request.tenant,
                authData: request.authData
            }, request.carrierInput), response).then(success => {
                response.success = success;
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_PRFL_00006'));
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
    buildKycModel: function (request, response, process) {
        this.LOG.debug('Creating KYC model for mobile validation');
        request.model = {
            type: request.type,
            opsType: request.opsType,
            refId: request.refId,
            description: request.description,
            active: true,
            workflow: {
                workflowCode: request.carrierInput.workflowCode,
                carrierCode: request.carrierInput.carrier.code
            },
            item: request.item
        }
        process.nextSuccess(request, response);

    },
    updateKycModel: function (request, response, process) {
        request.kycService.save(request).then(success => {
            response.success = {
                code: 'SUC_KYC_00001',
                result: success.result
            }
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_KYC_00000'));
        })
    }
};