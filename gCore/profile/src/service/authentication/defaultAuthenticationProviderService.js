/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const crypto = require('crypto');

/**
 * @module gCore/profile/src/service/authentication/defaultAuthenticationProviderService
 * @description Implements profile default authentication provider service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**

     * Executes record auth event behavior.

     *

     * @param {*} event Method input.

     * @returns {*} Method result.

     */

    recordAuthEvent: function (event) {
        if (!SERVICE.DefaultAuthAuditService) return Promise.resolve(false);
        let audit = CONFIG.get('authSecurity') && CONFIG.get('authSecurity').audit || {};
        return SERVICE.DefaultAuthAuditService.record(event).catch(error => {
            if (audit.failClosed === true) throw error;
            this.LOG.error('Authentication audit recording failed', error);
            return false;
        });
    },

    /**

     * Updates auth data information.

     *

     * @param {*} options Method input.

     * @returns {*} Method result.

     */

    updateAuthData: function (options) {
        let _self = this;
        options.state.lastAttempt = new Date();
        return SERVICE.DefaultUserStateService.save({
            tenant: options.tenant,
            model: options.state
        }).then(success => {
            _self.LOG.debug('State data has been updated with current time');
            return success;
        }).catch(error => {
            _self.LOG.error('While updating Active data with current time : ', error);
            throw error;
        });
    },

    /**

     * Updates failed auth data information.

     *

     * @param {*} options Method input.

     * @returns {*} Method result.

     */

    updateFailedAuthData: function (options) {
        let threshold = CONFIG.get('attemptsToLockAccount') || 5;
        options.state.attempts = (options.state.attempts || 0) + 1;
        if (options.state.attempts >= threshold) {
            options.state.locked = true;
            options.state.lockedTime = new Date();
        }
        return this.updateAuthData(options);
    },

    /**

     * Executes authenticate apikey behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    authenticateAPIKey: function (request) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultEnterpriseService.retrieveEnterprise(request.entCode).then(enterprise => {
                SERVICE.DefaultEmployeeService.findByAPIKey({
                    tenant: enterprise.tenant.code,
                    apiKey: request.apiKey
                }).then(employee => {
                    return this.recordAuthEvent({
                        eventType: 'api_key.authentication',
                        outcome: 'success',
                        tenant: enterprise.tenant.code,
                        entCode: enterprise.code,
                        principalId: employee.loginId
                    }).then(() => resolve({
                        enterprise: enterprise,
                        person: employee,
                        tenant: enterprise.tenant.code
                    }));
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**

     * Executes authenticate employee behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    authenticateEmployee: function (request) {
        return new Promise((resolve, reject) => {
            let _self = this;
            SERVICE.DefaultEnterpriseService.retrieveEnterprise(request.entCode).then(enterprise => {
                SERVICE.DefaultEmployeeService.findByLoginId({
                    tenant: enterprise.tenant.code,
                    loginId: request.loginId,
                }).then(employee => {
                    _self.authenticate({
                        request: request,
                        enterprise: enterprise,
                        person: employee,
                        type: 'Employee'
                    }).then(success => {
                        resolve({
                            code: 'SUC_AUTH_00001',
                            result: success
                        });
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**

     * Executes authenticate customer behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    authenticateCustomer: function (request) {
        return new Promise((resolve, reject) => {
            let _self = this;
            SERVICE.DefaultEnterpriseService.retrieveEnterprise(request.entCode).then(enterprise => {
                SERVICE.DefaultCustomerService.findByLoginId({
                    tenant: enterprise.tenant.code,
                    loginId: request.loginId
                }).then(customer => {
                    _self.authenticate({
                        request: request,
                        enterprise: enterprise,
                        person: customer,
                        type: 'Customer'
                    }).then(success => {
                        resolve({
                            code: 'SUC_AUTH_00001',
                            result: success
                        });
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**

     * Executes authenticate behavior.

     *

     * @param {*} options Method input.

     * @returns {*} Method result.

     */

    authenticate: function (options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultUserStateService.findUserState({
                    tenant: options.enterprise.tenant.code,
                    loginId: options.person.loginId,
                    _id: options.person._id
                }).then(state => {
                    if (state.locked || !options.person.active || !options.person.password || options.person.password.active === false || options.person.principalType === 'service') {
                        reject(new CLASSES.NodicsError('ERR_LIN_00002'));
                    } else {
                        UTILS.compareHash(options.request.password, options.person.password.password).then(match => {
                            if (match) {
                                let userGroupCodes = options.person.userGroupCodes || UTILS.getUserGroupCodes(options.person.userGroups);
                                let userGroupPermissions = options.person.userGroupPermissions || UTILS.getUserGroupPermissions(options.person.userGroups);
                                state.attempts = 0;
                                _self.updateAuthData({
                                    state: state,
                                    tenant: options.enterprise.tenant.code
                                }).then(() => _self.createRefreshToken({
                                    entCode: options.enterprise.code,
                                    tenant: options.enterprise.tenant.code,
                                    loginId: options.person.loginId,
                                    type: options.type,
                                    principalType: options.person.principalType,
                                    authVersion: options.person.authVersion || 1,
                                    userGroups: userGroupCodes,
                                    permissions: userGroupPermissions
                                })).then(refreshToken => {
                                    let authToken = _self.generateAuthToken({
                                        entCode: options.enterprise.code,
                                        tenant: options.enterprise.tenant.code,
                                        loginId: options.person.loginId,
                                        principalType: options.person.principalType,
                                        authVersion: options.person.authVersion || 1,
                                        tokenLife: options.person.tokenLife,
                                        userGroups: userGroupCodes,
                                        permissions: userGroupPermissions
                                    });
                                    SERVICE.DefaultPrincipalSecurityStampService.register(options.enterprise.tenant.code, options.person.loginId, options.person.authVersion || 1).then(() => _self.recordAuthEvent({
                                        eventType: 'password.authentication',
                                        outcome: 'success',
                                        tenant: options.enterprise.tenant.code,
                                        entCode: options.enterprise.code,
                                        principalId: options.person.loginId,
                                        tokenType: 'access'
                                    })).then(() => resolve({ authToken: authToken, refreshToken: refreshToken })).catch(reject);
                                }).catch(error => {
                                    reject(error);
                                });
                            } else {
                                _self.updateFailedAuthData({
                                    state: state,
                                    tenant: options.enterprise.tenant.code
                                }).then(() => {
                                    _self.recordAuthEvent({
                                        eventType: 'password.authentication',
                                        outcome: 'failure',
                                        tenant: options.enterprise.tenant.code,
                                        entCode: options.enterprise.code,
                                        principalId: options.person.loginId,
                                        reasonCode: 'INVALID_CREDENTIALS'
                                    }).then(() => reject(new CLASSES.NodicsError('ERR_AUTH_00002', 'Invalid login attempt'))).catch(reject);
                                }).catch(error => {
                                    reject(new CLASSES.NodicsError(error, 'Could not persist failed login state', 'ERR_AUTH_00000'));
                                });
                            }
                        }).catch(error => {
                            reject(new CLASSES.NodicsError('ERR_AUTH_00000'));
                        });
                    }
                }).catch(error => {
                    reject(new CLASSES.NodicsError('ERR_AUTH_00000'));
                });
            } catch (error) {
                reject(new CLASSES.NodicsError('ERR_AUTH_00000'));
            }
        });
    },

    /**

     * Updates refresh token information.

     *

     * @param {*} options Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    createRefreshToken: function (options, callback) {
        return new Promise((resolve, reject) => {
            try {
                let refreshToken = crypto.randomBytes(48).toString('base64url');
                let security = CONFIG.get('authSecurity') || {};
                let refreshPolicy = security.refreshToken || {};
                this.addToken(CONFIG.get('profileModuleName') || 'profile', true, refreshToken, {
                    entCode: options.entCode,
                    tenant: options.tenant,
                    loginId: options.loginId,
                    type: options.type,
                    principalType: options.principalType,
                    authVersion: options.authVersion,
                    userGroups: options.userGroups,
                    permissions: options.permissions
                }, refreshPolicy.expiresInSeconds).then(success => {
                    resolve(refreshToken);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.NodicsError('ERR_AUTH_00000'));
            }
        });
    },

    /**

     * Executes rotate refresh token behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    rotateRefreshToken: function (request) {
        let _self = this;
        let refreshToken = request.refreshToken;
        if (!refreshToken) {
            return Promise.reject(new CLASSES.NodicsError('ERR_AUTH_00002', 'Refresh token is required'));
        }
        let moduleName = CONFIG.get('profileModuleName') || 'profile';
        return this.consumeToken(moduleName, refreshToken).then(session => {
            if (!session || !session.tenant || !session.loginId) {
                throw new CLASSES.NodicsError('ERR_AUTH_00001', 'Refresh session is invalid');
            }
            return SERVICE.DefaultEnterpriseService.retrieveEnterprise(session.entCode).then(enterprise => {
                if (!enterprise.active || !enterprise.tenant || enterprise.tenant.active === false || enterprise.tenant.code !== session.tenant) {
                    throw new CLASSES.NodicsError('ERR_AUTH_00001', 'Refresh session enterprise is inactive or mismatched');
                }
                let finder = session.type === 'Customer' ? SERVICE.DefaultCustomerService : SERVICE.DefaultEmployeeService;
                return finder.findByLoginId({ tenant: session.tenant, loginId: session.loginId });
            }).then(person => {
                if (!person.active || person.principalType === 'service') {
                    throw new CLASSES.NodicsError('ERR_AUTH_00001', 'Refresh principal is inactive or not eligible');
                }
                if (String(session.authVersion) !== String(person.authVersion || 1)) {
                    throw new CLASSES.NodicsError('ERR_AUTH_00001', 'Refresh session security stamp is stale');
                }
                session.userGroups = person.userGroupCodes || UTILS.getUserGroupCodes(person.userGroups);
                session.permissions = person.userGroupPermissions || UTILS.getUserGroupPermissions(person.userGroups);
                session.principalType = person.principalType;
                return _self.createRefreshToken(session);
            }).then(nextRefreshToken => {
                let result = {
                    authToken: _self.generateAuthToken({
                        entCode: session.entCode,
                        tenant: session.tenant,
                        loginId: session.loginId,
                        principalType: session.principalType,
                        authVersion: session.authVersion,
                        userGroups: session.userGroups,
                        permissions: session.permissions
                    }),
                    refreshToken: nextRefreshToken
                };
                return _self.recordAuthEvent({
                    eventType: 'refresh_token.rotation',
                    outcome: 'success',
                    tenant: session.tenant,
                    entCode: session.entCode,
                    principalId: session.loginId,
                    tokenType: 'refresh'
                }).then(() => result);
            });
        });
    },

    /**

     * Removes or clears session information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    revokeSession: function (request) {
        let operations = [this.revokeAccessToken(request.authData)];
        if (request.refreshToken) {
            operations.push(this.removeToken(CONFIG.get('profileModuleName') || 'profile', request.refreshToken));
        }
        return Promise.all(operations).then(() => this.recordAuthEvent({
            eventType: 'session.logout',
            outcome: 'success',
            tenant: request.authData && request.authData.tenant,
            entCode: request.authData && request.authData.entCode,
            principalId: request.authData && (request.authData.loginId || request.authData.serviceId)
        })).then(() => true);
    }
};
