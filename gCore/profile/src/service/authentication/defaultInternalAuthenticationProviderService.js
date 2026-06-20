/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');

module.exports = {

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
