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

let accessGroupDenied = executeCheckAccess(createRequest({
    userGroups: ['runtimeApproverGroup'],
    accessGroups: ['runtimeAdminGroup'],
    permission: 'runtime.config.request.approve',
    permissions: ['runtime.config.request.approve']
}));
assert.strictEqual(accessGroupDenied.success, false, 'Access group mismatch should deny before permission check');
assert.strictEqual(accessGroupDenied.error.code, 'ERR_AUTH_00003');

console.log('Route action authorization validated');
