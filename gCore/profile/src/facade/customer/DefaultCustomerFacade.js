/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/profile/src/facade/customer/DefaultCustomerFacade
 * @description Coordinates facade-level delegation for profile default customer facade operations.
 * @layer facade
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * Initializes  behavior for the module runtime.
     *
     * @param {*} options Method input.
     * @returns {*} Method result.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    /**
     * Runs post-initialization behavior after the module runtime is available.
     *
     * @param {*} options Method input.
     * @returns {*} Method result.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    /**
     * Validates customer exist rules.
     *
     * @param {*} request Method input.
     * @returns {*} Method result.
     */
    isCustomerExist: function (request) {
        return SERVICE.DefaultCustomerService.isCustomerExist(request);
    },
    /**
     * Executes sign up behavior.
     *
     * @param {*} request Method input.
     * @returns {*} Method result.
     */
    signUp: function (request) {
        return SERVICE.DefaultCustomerService.signUp(request);
    }
};