/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

/**
 * @module cache/test/cacheMutationSecurityContract
 * @description Verifies permissioned cache mutation routes, governed administrative permissions, and tenant/module-safe service boundaries.
 * @layer test
 * @owner cache
 * @override Projects may replace administrative groups or route definitions while preserving explicit permissions and tenant/module isolation.
 */

const routerDefinitions = require('../../../nRouter/src/router/routers');
const authProperties = require('../../../nAuth/config/properties');
const userGroupsData = require('../../../../gCore/profile/data/init/data/groups/defaultUserGroupsData');

const mutationRoutes = [
    routerDefinitions.common.flushCache.flushKey,
    routerDefinitions.common.flushCache.flushPrefix,
    routerDefinitions.common.flushCache.flushAPIAll,
    routerDefinitions.common.updateRouterCacheConfig.apiConfig,
    routerDefinitions.common.updateSchemaCacheConfig.itemConfig
];

mutationRoutes.slice(0, 3).forEach(route => {
    assert.strictEqual(route.method, 'DELETE', 'Cache flush routes must use DELETE');
    assert.strictEqual(route.permission, 'cache.flush');
});
assert.strictEqual(mutationRoutes[3].method, 'POST');
assert.strictEqual(mutationRoutes[3].permission, 'cache.configuration.router.update');
assert.strictEqual(mutationRoutes[4].method, 'POST');
assert.strictEqual(mutationRoutes[4].permission, 'cache.configuration.item.update');
mutationRoutes.forEach(route => {
    assert.deepStrictEqual(route.accessGroups, ['runtimeConfigAdminUserGroup']);
    assert.notStrictEqual(route.method, 'GET', 'Cache mutations must never be exposed as GET');
});

const cachePermissions = ['cache.flush', 'cache.configuration.router.update', 'cache.configuration.item.update'];
cachePermissions.forEach(permission => assert(authProperties.identityGovernance.permissionCatalog.includes(permission)));
const runtimeAdminGroup = Object.values(userGroupsData).find(group => group.code === 'runtimeConfigAdminUserGroup');
cachePermissions.forEach(permission => assert(runtimeAdminGroup.permissions.includes(permission)));
const migrationTarget = authProperties.identityGovernance.migration.groupTargets.runtimeConfigAdminUserGroup;
cachePermissions.forEach(permission => assert(migrationTarget.permissions.includes(permission)));

let routeActionAuthorization = { enabled: true, strict: true, groupPermissions: {} };
global.CONFIG = { get: key => key === 'routeActionAuthorization' ? routeActionAuthorization : key === 'nodeId' ? 'test-node' : undefined };
global.ENUMS = { TargetType: { MODULE_NODES: { key: 'MODULE_NODES' } } };
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) { super(message || code); this.code = code; }
    },
    CacheError: class CacheError extends Error {
        constructor(code, message) { super(message || code); this.code = code; }
    }
};

const authorizationService = require('../../../nRouter/src/service/request/defaultSecuredRequestPipelineService');
function authorize(permissions) {
    let result = {};
    authorizationService.checkAccess({
        authData: { userGroups: ['runtimeConfigAdminUserGroup'], permissions: permissions },
        router: mutationRoutes[0]
    }, {}, {
        nextSuccess: () => { result.allowed = true; },
        error: (_request, _response, error) => { result.error = error; }
    });
    return result;
}
assert.strictEqual(authorize(['cache.flush']).allowed, true);
assert.strictEqual(authorize(['runtime.config.cleanup.execute']).error.code, 'ERR_AUTH_00003');

global.NODICS = {
    getModules: () => ({ profile: { name: 'profile' } }),
    getModule: moduleName => moduleName === 'profile' ? { name: 'profile' } : undefined,
    getActiveTenants: () => ['tenant-a']
};
const cacheService = require('../src/service/cache/defaultCacheService');
const validRequest = {
    tenant: 'tenant-a',
    moduleName: 'profile',
    authData: { tenant: 'tenant-a' },
    httpRequest: { body: {} }
};
assert.strictEqual(cacheService.validateMutationScope(validRequest), true);
assert.throws(() => cacheService.validateMutationScope(Object.assign({}, validRequest, { tenant: 'tenant-b' })), error => error.code === 'ERR_CACHE_00007');
assert.throws(() => cacheService.validateMutationScope(Object.assign({}, validRequest, { moduleName: 'unknown' })), error => error.code === 'ERR_CACHE_00007');
assert.throws(() => cacheService.validateMutationScope(Object.assign({}, validRequest, { httpRequest: { body: { tenant: 'tenant-b' } } })), error => error.code === 'ERR_CACHE_00007');
assert.throws(() => cacheService.validateMutationScope(Object.assign({}, validRequest, { httpRequest: { body: { moduleName: 'system' } } })), error => error.code === 'ERR_CACHE_00007');
assert.throws(() => cacheService.validateMutationScope(Object.assign({}, validRequest, { config: { targetModuleName: 'system' } })), error => error.code === 'ERR_CACHE_00007');

let publishedEvent;
global.SERVICE = { DefaultEventService: { publish: event => { publishedEvent = event; return Promise.resolve(true); } } };
(async function () {
    await cacheService.publishCacheChangeEvent(validRequest, 'apiCacheChange');
    assert.strictEqual(publishedEvent.tenant, 'tenant-a');
    assert.strictEqual(publishedEvent.target, 'profile');
    console.log('Cache mutation security contracts validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
