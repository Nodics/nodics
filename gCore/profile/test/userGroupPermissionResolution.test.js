const assert = require('assert');

// @nodics-capability-behavior @nodics-area profile
global.CONFIG = {
    get: function () {
        return undefined;
    }
};

const commonUtils = require('../../../gFramework/nCommon/src/utils/utils');
global.UTILS = Object.assign({}, commonUtils, {
    isObject: function (value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }
});

const userGroupsData = require('../data/init/data/groups/defaultUserGroupsData');
const employeeData = require('../data/init/data/user/defaultEmployeeData');

let groupTree = [{
    code: 'runtimeConfigAdminUserGroup',
    permissions: ['runtime.config.cleanup.execute'],
    parentGroups: [{
        code: 'runtimeConfigOperatorUserGroup',
        permissions: [
            'runtime.config.request.activate',
            'runtime.config.rollback',
            'runtime.config.cleanup.preview'
        ],
        parentGroups: [{
            code: 'runtimeConfigRequesterUserGroup',
            permissions: [
                'runtime.config.preview',
                'runtime.config.request.create'
            ],
            parentGroups: [{
                code: 'runtimeConfigViewerUserGroup',
                permissions: [
                    'runtime.config.history.view',
                    'runtime.config.summary.view',
                    'runtime.config.request.view',
                    'system.contract.openapi.view'
                ]
            }]
        }]
    }, {
        code: 'runtimeConfigApproverUserGroup',
        permissions: [
            'runtime.config.request.approve',
            'runtime.config.request.reject'
        ]
    }]
}];

let permissions = global.UTILS.getUserGroupPermissions(groupTree);
assert(permissions.includes('runtime.config.cleanup.execute'));
assert(permissions.includes('runtime.config.cleanup.preview'));
assert(permissions.includes('runtime.config.preview'));
assert(permissions.includes('runtime.config.request.view'));
assert(permissions.includes('system.contract.openapi.view'));
assert(permissions.includes('runtime.config.request.approve'));
assert.strictEqual(permissions.filter(permission => permission === 'runtime.config.request.view').length, 1);

let runtimeAdminGroup = Object.values(userGroupsData).find(group => group.code === 'runtimeConfigAdminUserGroup');
let runtimeViewerGroup = Object.values(userGroupsData).find(group => group.code === 'runtimeConfigViewerUserGroup');
assert(runtimeAdminGroup, 'Default runtime config admin group should be seeded');
assert(runtimeViewerGroup.permissions.includes('system.contract.openapi.view'));
assert(runtimeAdminGroup.permissions.includes('runtime.config.cleanup.execute'));
assert(!runtimeAdminGroup.permissions.includes('*'), 'Runtime admin data should avoid broad wildcard permissions');

let adminEmployee = employeeData.record0;
let apiAdminEmployee = employeeData.record1;
assert(adminEmployee.userGroups.includes('runtimeConfigAdminUserGroup'));
assert(adminEmployee.userGroups.includes('adminGroup'));
assert(apiAdminEmployee.userGroups.includes('serviceAccountUserGroup'));
assert(!apiAdminEmployee.userGroups.includes('runtimeConfigAdminUserGroup'));
assert.strictEqual(apiAdminEmployee.principalType, 'service');

let baseUserGroup = Object.values(userGroupsData).find(group => group.code === 'userGroup');
let adminGroup = Object.values(userGroupsData).find(group => group.code === 'adminGroup');
assert(!baseUserGroup.parentGroups, 'Base userGroup must not inherit administrative groups');
assert(adminGroup.parentGroups.includes('userGroup'), 'Administrative groups should inherit the base user capability');

let inactiveGroup = { code: 'inactive', active: false, permissions: ['forbidden.permission'] };
assert.deepStrictEqual(global.UTILS.getUserGroupPermissions([inactiveGroup]), []);

console.log('Profile user group permission resolution validated');
