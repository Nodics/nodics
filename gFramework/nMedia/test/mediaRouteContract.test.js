/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nMedia/test/mediaRouteContract
 * @description Validates nMedia route exposure and authorization metadata.
 * @layer test
 * @owner nMedia
 * @override Later route additions must remain secured and exposure-gated.
 */

const assert = require('assert');
const { assertRouteContracts } = require('../../nRouter/test/routerContractTestUtils');
const routerConfig = require('../src/router/routers');

const expectedRoutes = [
    { key: '/storage/policy', method: 'POST', controller: 'DefaultMediaStorageController', operation: 'resolveStoragePolicy', secured: true, permission: 'media.storage.policy.view' },
    { key: '/storage/location', method: 'POST', controller: 'DefaultMediaStorageController', operation: 'resolveStorageLocation', secured: true, permission: 'media.storage.location.resolve' },
    { key: '/storage/upload', method: 'POST', controller: 'DefaultMediaStorageController', operation: 'uploadMedia', secured: true, permission: 'media.upload.create' },
    { key: '/references/media/validate', method: 'POST', controller: 'DefaultMediaReferenceLookupController', operation: 'validate', secured: true, permissionConfig: 'authSecurity.internalToken.routePermission' }
];

const routes = assertRouteContracts(routerConfig, expectedRoutes);
routes.forEach(route => {
    assert(['mediaManagement', 'moduleInternal'].includes(route.apiExposure), route.key + ' must be intentionally exposure-gated');
    assert.notStrictEqual(route.publicAccess, true, route.key + ' must not be public');
});
console.log(`nMedia route contract validated: ${expectedRoutes.length} routes`);
