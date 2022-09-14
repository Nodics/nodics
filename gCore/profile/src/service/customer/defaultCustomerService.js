/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    findByLoginId: function (request) {
        return new Promise((resolve, reject) => {
            this.get({
                tenant: request.tenant,
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
    isCustomerExist: function (request) {
        return new Promise((resolve, reject) => {
            this.get({
                tenant: request.tenant,
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