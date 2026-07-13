/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/profile/src/service/customer/defaultCustomerService
 * @description Implements profile default customer service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * Retrieves by login id information.
     *
     * @param {*} request Method input.
     * @returns {*} Method result.
     */
    findByLoginId: function (request) {
        return new Promise((resolve, reject) => {
            this.get({
                tenant: request.tenant,
                authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
                options: {
                    recursive: true,
                },
                query: {
                    loginId: request.loginId
                }
            }).then(customers => {
                if (customers.result.length !== 1) {
                    reject(new CLASSES.NodicsError('ERR_PRFL_00003', 'Invalid login id'));
                } else {
                    resolve(customers.result[0]);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },
    /**
     * Validates customer exist rules.
     *
     * @param {*} request Method input.
     * @returns {*} Method result.
     */
    isCustomerExist: function (request) {
        return new Promise((resolve, reject) => {
            this.get({
                tenant: request.tenant,
                authData: request.authData || SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
                options: {
                    recursive: false,
                },
                query: {
                    loginId: request.loginId
                }
            }).then(customers => {
                if (customers.result.length > 1) {
                    reject(new CLASSES.NodicsError('ERR_PRFL_00003', 'Invalid login id'));
                } else if (customers.result.length < 1) {
                    reject(new CLASSES.NodicsError('ERR_PRFL_00005', 'Customer not exist'));
                } else {
                    resolve({
                        code: 'SUC_PRFL_00002'
                    });
                }
            }).catch(error => {
                reject(error);
            });
        });
    },
    /**
     * Executes sign up behavior.
     *
     * @param {*} request Method input.
     * @returns {*} Method result.
     */
    signUp: function (request) {
        let _self = this;
        request.defaultCustomerService = _self;
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('customerRegistrationHandlerPipeline', request, {}).then(success => {
                resolve(success);
            }).catch(error => {
                reject(new CLASSES.NodicsError(error, null, 'ERR_PRFL_00006'));
            });
        });
    },
};
