/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

*/

/**
 * @module gCore/profile/src/controller/authentication/defaultAuthenticationProviderController
 * @description Exposes request handlers for profile default authentication provider controller operations.
 * @layer controller
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**

     * Builds credentials data.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    mapCredentials: function (request) {
        let body = request.httpRequest.body || {};
        let compatibility = CONFIG.get('authSecurity') && CONFIG.get('authSecurity').compatibility || {};
        request.loginId = body.loginId;
        request.password = body.password;
        request.source = body.source;
        if (compatibility.allowPasswordHeaders === true) {
            request.loginId = request.loginId || request.httpRequest.get('loginId');
            request.password = request.password || request.httpRequest.get('password');
            request.source = request.source || request.httpRequest.get('source');
        }
    },

    /**

     * Builds refresh token data.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    mapRefreshToken: function (request) {
        let body = request.httpRequest.body || {};
        request.refreshToken = body.refreshToken;
    },

    /**

     * Executes authenticate employee behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    authenticateEmployee: function (request, callback) {
        this.mapCredentials(request);
        if (callback) {
            FACADE.DefaultAuthenticationProviderFacade.authenticateEmployee(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultAuthenticationProviderFacade.authenticateEmployee(request);
        }
    },

    /**

     * Executes authenticate customer behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    authenticateCustomer: function (request, callback) {
        this.mapCredentials(request);
        if (callback) {
            FACADE.DefaultAuthenticationProviderFacade.authenticateCustomer(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultAuthenticationProviderFacade.authenticateCustomer(request);
        }
    },

    /**

     * Executes refresh token behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    refreshToken: function (request, callback) {
        this.mapRefreshToken(request);
        let operation = SERVICE.DefaultAuthenticationProviderService.rotateRefreshToken(request);
        if (callback) operation.then(result => callback(null, { code: 'SUC_AUTH_00000', result: result })).catch(callback);
        else return operation.then(result => ({ code: 'SUC_AUTH_00000', result: result }));
    },

    /**

     * Executes logout behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    logout: function (request, callback) {
        this.mapRefreshToken(request);
        let operation = SERVICE.DefaultAuthenticationProviderService.revokeSession(request);
        if (callback) operation.then(() => callback(null, { code: 'SUC_AUTH_00000', result: true })).catch(callback);
        else return operation.then(() => ({ code: 'SUC_AUTH_00000', result: true }));
    }
};
