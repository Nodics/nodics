/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/profile/src/service/customer/defaultCustomerRegistrationService
 * @description Implements profile default customer registration service business behavior and extension logic.
 * @layer service
 * @owner profile
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

     * Validates request rules.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating customer registration request');
        if (!request.defaultCustomerService) {
            process.error(request, response, new CLASSES.NodicsError('ERR_PRFL_00003', 'Invalid service detail to execute'));
        } else if (!request.model) {
            process.error(request, response, new CLASSES.NodicsError('ERR_PRFL_00003', 'Invalid customer detail to execute'));
        } else {
            let registration = CONFIG.get('identityGovernance') && CONFIG.get('identityGovernance').customerRegistration || {};
            request.model.userGroups = [registration.group || 'customerUserGroup'];
            request.model.principalType = 'customer';
            request.model.ownerId = request.model.loginId;
            request.model.ownerType = 'customer';
            request.model.createdBy = request.model.loginId;
            request.model.updatedBy = request.model.loginId;
            request.model.active = registration.active === true;
            request.model.accessGroups = [registration.group || 'customerUserGroup'];
            delete request.model.apiKey;
            delete request.model.apiKeyStatus;
            delete request.model.apiKeyScopes;
            delete request.model.permissions;
            process.nextSuccess(request, response);
        }
    },
    /**
     * Validates if customer exist rules.
     *
     * @param {*} request Method input.
     * @param {*} response Method input.
     * @param {*} process Method input.
     * @returns {*} Method result.
     */
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
    /**
     * Validates confirm password rules.
     *
     * @param {*} request Method input.
     * @param {*} response Method input.
     * @param {*} process Method input.
     * @returns {*} Method result.
     */
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
    /**
     * Updates customer information.
     *
     * @param {*} request Method input.
     * @param {*} response Method input.
     * @param {*} process Method input.
     * @returns {*} Method result.
     */
    createCustomer: function (request, response, process) {
        request.defaultCustomerService.save(request).then(success => {
            response.success = success;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_PRFL_00006'));
        })
    }
};
