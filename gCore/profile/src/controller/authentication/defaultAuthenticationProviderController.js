/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
     * Authenticates an employee and starts a Profile-owned browser session.
     */
    authenticateEmployeeBrowser: function (request, callback) {
        this.mapCredentials(request);
        let operation = FACADE.DefaultAuthenticationProviderFacade.authenticateEmployee(request)
            .then(authentication => {
                let tokens = authentication && authentication.result;
                if (!tokens) {
                    throw new CLASSES.NodicsError(
                        'ERR_AUTH_00001', 'Employee authentication result is invalid'
                    );
                }
                return SERVICE.DefaultBrowserSessionService.start(request, tokens);
            })
            .then(result => ({ code: 'SUC_AUTH_00001', result: result }));
        if (callback) operation.then(result => callback(null, result)).catch(callback);
        else return operation;
    },

    /**
     * Rotates the HttpOnly browser refresh session and returns a new access token.
     */
    restoreEmployeeBrowser: function (request, callback) {
        let operation = SERVICE.DefaultBrowserSessionService.restore(request)
            .then(result => ({ code: 'SUC_AUTH_00000', result: result }));
        if (callback) operation.then(result => callback(null, result)).catch(callback);
        else return operation;
    },

    /**
     * Revokes and clears the Profile-owned browser session.
     */
    logoutEmployeeBrowser: function (request, callback) {
        let operation = SERVICE.DefaultBrowserSessionService.logout(request)
            .then(result => ({ code: 'SUC_AUTH_00000', result: result }));
        if (callback) operation.then(result => callback(null, result)).catch(callback);
        else return operation;
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
