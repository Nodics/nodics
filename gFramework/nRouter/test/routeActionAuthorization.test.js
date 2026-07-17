/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

let routeActionAuthorization = {
    enabled: true,
    strict: false,
    superPermissions: ['*', 'runtime.config.*'],
    groupPermissions: {
        userGroup: ['*']
    }
};

global.CONFIG = {
    get: function (key) {
        if (key === 'routeActionAuthorization') {
            return routeActionAuthorization;
        }
        if (key === 'authSecurity') {
            return {
                internalToken: {
                    routePermission: 'auth.internal.token.read'
                }
            };
        }
        return undefined;
    }
};

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) {
            super(message || code);
            this.code = code;
        }
    }
};

const service = require('../src/service/request/defaultSecuredRequestPipelineService');
service.LOG = { debug: function () {} };

function executeCheckAccess(request) {
    let state = {
        success: false,
        error: undefined
    };
    service.checkAccess(request, {}, {
        nextSuccess: function () {
            state.success = true;
        },
        error: function (req, res, error) {
            state.error = error;
        }
    });
    return state;
}

function createRequest(options) {
    return {
        authData: {
            entCode: 'defaultEnterprise',
            tenant: 'default',
            userGroups: options.userGroups || ['userGroup'],
            permissions: options.permissions
        },
        router: {
            accessGroups: options.accessGroups || ['userGroup'],
            permission: options.permission
        }
    };
}

routeActionAuthorization = {
    enabled: true,
    strict: false,
    groupPermissions: {}
};
let backwardCompatible = executeCheckAccess(createRequest({
    permission: 'runtime.config.request.approve',
    permissions: []
}));
assert.strictEqual(backwardCompatible.success, true, 'Non-strict mode should allow routes when no permissions are available');

routeActionAuthorization = {
    enabled: true,
    strict: true,
    groupPermissions: {}
};
let denied = executeCheckAccess(createRequest({
    permission: 'runtime.config.request.approve',
    permissions: ['runtime.config.request.view']
}));
assert.strictEqual(denied.success, false, 'Strict mode should deny missing route permission');
assert.strictEqual(denied.error.code, 'ERR_AUTH_00003');

let granted = executeCheckAccess(createRequest({
    permission: 'runtime.config.request.approve',
    permissions: ['runtime.config.request.approve']
}));
assert.strictEqual(granted.success, true, 'Strict mode should allow matching route permission');

let wildcardGranted = executeCheckAccess(createRequest({
    permission: 'runtime.config.cleanup.execute',
    permissions: ['runtime.config.*']
}));
assert.strictEqual(wildcardGranted.success, true, 'Wildcard permission should allow matching route action');

routeActionAuthorization = {
    enabled: true,
    strict: true,
    groupPermissions: {
        runtimeApproverGroup: ['runtime.config.request.approve']
    }
};
let groupGranted = executeCheckAccess(createRequest({
    userGroups: ['runtimeApproverGroup'],
    accessGroups: ['runtimeApproverGroup'],
    permission: 'runtime.config.request.approve',
    permissions: []
}));
assert.strictEqual(groupGranted.success, true, 'Group-derived permission should allow matching route action');

let configuredPermissionGranted = executeCheckAccess({
    authData: {
        entCode: 'defaultEnterprise',
        tenant: 'default',
        userGroups: ['serviceAccountUserGroup'],
        permissions: ['auth.internal.token.read']
    },
    router: {
        accessGroups: ['serviceAccountUserGroup'],
        permissionConfig: 'authSecurity.internalToken.routePermission'
    }
});
assert.strictEqual(configuredPermissionGranted.success, true, 'Configured route permission should resolve from layered properties');

let configuredPermissionDenied = executeCheckAccess({
    authData: {
        entCode: 'defaultEnterprise',
        tenant: 'default',
        userGroups: ['serviceAccountUserGroup'],
        permissions: []
    },
    router: {
        accessGroups: ['serviceAccountUserGroup'],
        permissionConfig: 'authSecurity.internalToken.routePermission'
    }
});
assert.strictEqual(configuredPermissionDenied.success, false, 'Configured route permission should deny missing grants');
assert.strictEqual(configuredPermissionDenied.error.code, 'ERR_AUTH_00003');

let capturedAuthorizedRequest;
global.UTILS = {
    getUserGroupCodes: function (groups) {
        return groups.map(group => group.code);
    },
    getUserGroupPermissions: function (groups) {
        return groups.reduce((permissions, group) => permissions.concat(group.permissions || []), []);
    }
};
global.SERVICE = {
    DefaultAuthorizationProviderService: {
        authorizeAPIKey: function () {
            return {
                then: function (resolve) {
                    resolve({
                        enterprise: { code: 'defaultEnterprise', tenant: { code: 'default' } },
                        person: {
                            userGroups: [{ code: 'serviceAccountUserGroup', permissions: ['auth.internal.token.read'] }],
                            apiKeyScopes: []
                        }
                    });
                    return { catch: function () {} };
                }
            };
        }
    }
};
service.authorizeAPIKey({ apiKey: 'bootstrap-key' }, {}, {
    nextSuccess: function (request) {
        capturedAuthorizedRequest = request;
    },
    error: function (request, response, error) {
        throw error;
    }
});
assert.deepStrictEqual(capturedAuthorizedRequest.authData.permissions, ['auth.internal.token.read'],
    'API-key authorization should preserve group-derived permissions when apiKeyScopes is an empty array');
assert.deepStrictEqual(capturedAuthorizedRequest.authData.apiKeyScopes, [],
    'API-key scopes should remain separately visible for diagnostics and policy checks');

let accessGroupDenied = executeCheckAccess(createRequest({
    userGroups: ['runtimeApproverGroup'],
    accessGroups: ['runtimeAdminGroup'],
    permission: 'runtime.config.request.approve',
    permissions: ['runtime.config.request.approve']
}));
assert.strictEqual(accessGroupDenied.success, false, 'Access group mismatch should deny before permission check');
assert.strictEqual(accessGroupDenied.error.code, 'ERR_AUTH_00003');

console.log('Route action authorization validated');
