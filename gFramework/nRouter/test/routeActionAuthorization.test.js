/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
let identityGovernance = {
    migration: {
        groupTargets: {}
    }
};

global.CONFIG = {
    get: function (key) {
        if (key === 'routeActionAuthorization') {
            return routeActionAuthorization;
        }
        if (key === 'identityGovernance') {
            return identityGovernance;
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
            tokenType: options.tokenType,
            userGroups: options.userGroups || ['userGroup'],
            permissions: options.permissions
        },
        router: {
            accessGroups: options.accessGroups || ['userGroup'],
            permission: options.permission,
            authTokenTypes: options.authTokenTypes
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

routeActionAuthorization = {
    enabled: true,
    strict: true,
    groupPermissions: {}
};
identityGovernance = {
    migration: {
        groupTargets: {
            runtimeConfigAdminUserGroup: {
                permissions: ['media.content.download'],
                parentGroups: ['runtimeConfigOperatorUserGroup']
            },
            runtimeConfigOperatorUserGroup: {
                permissions: ['system.health.readiness.view'],
                parentGroups: []
            }
        }
    }
};
let governedGroupPermissionGranted = executeCheckAccess(createRequest({
    userGroups: ['runtimeConfigAdminUserGroup'],
    accessGroups: ['runtimeConfigAdminUserGroup'],
    permission: 'media.content.download',
    permissions: []
}));
assert.strictEqual(governedGroupPermissionGranted.success, true,
    'Identity-governed group permission should authorize a matching route action without router-local duplication');

let tokenUserGroupPermissionGranted = executeCheckAccess({
    authData: {
        entCode: 'defaultEnterprise',
        tenant: 'default',
        userGroups: ['runtimeConfigAdminUserGroup'],
        userGroupPermissions: ['media.content.download']
    },
    router: {
        accessGroups: ['runtimeConfigAdminUserGroup'],
        permission: 'media.content.download'
    }
});
assert.strictEqual(tokenUserGroupPermissionGranted.success, true,
    'Token userGroupPermissions should authorize route actions without requiring duplicated permissions claims');

let governedParentGroupPermissionGranted = executeCheckAccess(createRequest({
    userGroups: ['runtimeConfigAdminUserGroup'],
    accessGroups: ['runtimeConfigAdminUserGroup'],
    permission: 'system.health.readiness.view',
    permissions: []
}));
assert.strictEqual(governedParentGroupPermissionGranted.success, true,
    'Identity-governed parent group permission should authorize inherited route actions');

let governedParentAccessGroupGranted = executeCheckAccess(createRequest({
    userGroups: ['runtimeConfigAdminUserGroup'],
    accessGroups: ['runtimeConfigOperatorUserGroup'],
    permission: 'system.health.readiness.view',
    permissions: []
}));
assert.strictEqual(governedParentAccessGroupGranted.success, true,
    'Identity-governed parent groups should satisfy inherited route access groups');

let unownedGovernedPermissionDenied = executeCheckAccess(createRequest({
    userGroups: ['runtimeConfigAdminUserGroup'],
    accessGroups: ['runtimeConfigAdminUserGroup'],
    permission: 'export.run',
    permissions: []
}));
assert.strictEqual(unownedGovernedPermissionDenied.success, false,
    'Identity-governed group resolution must not grant unrelated route permissions');
assert.strictEqual(unownedGovernedPermissionDenied.error.code, 'ERR_AUTH_00003');

routeActionAuthorization = {
    enabled: true,
    strict: true,
    groupPermissions: {
        runtimeApproverGroup: ['runtime.config.request.approve']
    }
};

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

let serviceTokenGranted = executeCheckAccess(createRequest({
    authTokenTypes: ['service'], tokenType: 'service', permissions: []
}));
assert.strictEqual(serviceTokenGranted.success, true, 'Service-only routes should accept service tokens');

let humanTokenDenied = executeCheckAccess(createRequest({
    authTokenTypes: ['service'], tokenType: 'access', permissions: ['*']
}));
assert.strictEqual(humanTokenDenied.success, false, 'Human tokens must not impersonate module service tokens');
assert.strictEqual(humanTokenDenied.error.code, 'ERR_AUTH_00003');

let missingTokenTypeDenied = executeCheckAccess(createRequest({
    authTokenTypes: ['service'], permissions: ['*']
}));
assert.strictEqual(missingTokenTypeDenied.success, false, 'Service-only routes must fail closed when token type is absent');

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
