/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gCore/profile/src/service/authentication/defaultInternalAuthenticationProviderService
 * @description Implements profile default internal authentication provider service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**

     * Retrieves internal auth token information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    getInternalAuthToken: function (request) {
        return new Promise((resolve, reject) => {
            try {
                let authData = request.authData || {};
                let permissions = authData.permissions || [];
                let groups = authData.userGroups || [];
                let security = CONFIG.get('authSecurity') || {};
                let policy = security.internalToken || {};
                let crossTenantPermissions = policy.crossTenantPermissions || ['auth.internal.token.read.anyTenant'];
                let crossTenantGroups = policy.crossTenantGroups || [];
                let sameTenant = authData.tenant === request.tenant;
                let crossTenantAllowed = permissions.includes('*') ||
                    permissions.some(permission => crossTenantPermissions.includes(permission)) ||
                    groups.some(group => crossTenantGroups.includes(group));
                if (!sameTenant && !crossTenantAllowed) {
                    reject(new CLASSES.NodicsError('ERR_AUTH_00003', 'Cross-tenant internal token access is not permitted'));
                    return;
                }
                let headers = request.headers || {};
                let runtimeInstanceId = headers['x-nodics-runtime-instance'];
                let requestedModules = String(headers['x-nodics-modules'] || '').split(',').map(value => value.trim()).filter(Boolean);
                if (runtimeInstanceId && requestedModules.length > 0) {
                    let unknownModules = requestedModules.filter(moduleName => !NODICS.getRawModule(moduleName));
                    if (unknownModules.length > 0) {
                        reject(new CLASSES.NodicsError('ERR_AUTH_00003', 'Unknown module identity requested'));
                        return;
                    }
                    let principal = authData.person || {};
                    SERVICE.DefaultServiceTokenService.issue({
                        entCode: authData.entCode,
                        tenant: request.tenant,
                        serviceId: authData.serviceId || principal.loginId || principal.code || 'nodics-runtime',
                        runtimeInstanceId: runtimeInstanceId,
                        modules: requestedModules,
                        authVersion: authData.authVersion || principal.authVersion || 1,
                        userGroups: authData.userGroups || [],
                        permissions: authData.permissions || []
                    }).then(authToken => resolve({ code: 'SUC_AUTH_00000', result: { authToken: authToken } })).catch(reject);
                    return;
                }
                let authToken = NODICS.getInternalAuthToken(request.tenant);
                if (!authToken) {
                    reject(new CLASSES.NodicsError('ERR_AUTH_00001', 'Internal authentication token is unavailable'));
                    return;
                }
                resolve({
                    code: 'SUC_AUTH_00000',
                    result: {
                        authToken: authToken
                    }
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error));
            }
        });
    }
};
