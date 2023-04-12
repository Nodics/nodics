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
        this.LOG.debug('Validating customer registration request');
        if (!request.defaultCustomerService) {
            process.error(request, response, new CLASSES.NodicsError('ERR_PRFL_00003', 'Invalid service detail to execute'));
        } else if (!request.model) {
            process.error(request, response, new CLASSES.NodicsError('ERR_PRFL_00003', 'Invalid customer detail to execute'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    validateIfCustomerExist: function (request, response, process) {
        this.LOG.debug('Validating if customer exist');
        request.defaultCustomerService.isCustomerExist({
            tenant: request.tenant,
            loginId: request.model.loginId
        }).then(error => {
            process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_PRFL_00007'));
        }).catch(success => {
            process.nextSuccess(request, response);
        });
    },
    validateConfirmPassword: function (request, response, process) {
        this.LOG.debug('Validating confirmed password');
        let model = request.model;
        if (!model.password || !model.password.password || !model.password.confirmPassword || (model.password.password !== model.password.confirmPassword)) {
            process.error(request, response, new CLASSES.NodicsError('ERR_PRFL_00003', 'Invalid customer password detail to execute'));
        } else {
            delete request.model.password.confirmPassword;
            process.nextSuccess(request, response);
        }
    },
    createCustomer: function (request, response, process) {
        request.defaultCustomerService.save(request).then(success => {
            response.success = success;
            process.nextSuccess(request, response);
        }).catch(error => {
            reject(new CLASSES.NodicsError(error, null, 'ERR_PRFL_00006'));
        })
    }
};