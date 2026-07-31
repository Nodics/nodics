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
    { key: '/contexts', method: 'GET', controller: 'DefaultMediaStorageController', operation: 'listMediaContexts', secured: true, permission: 'media.context.view' },
    { key: '/storage/policy', method: 'POST', controller: 'DefaultMediaStorageController', operation: 'resolveStoragePolicy', secured: true, permission: 'media.storage.policy.view' },
    { key: '/folders/policy', method: 'PUT', controller: 'DefaultMediaStorageController', operation: 'createFolderPolicy', secured: true, permission: 'media.folder.policy.manage' },
    { key: '/folders/policy/:folderCode', method: 'PATCH', controller: 'DefaultMediaStorageController', operation: 'saveFolderPolicy', secured: true, permission: 'media.folder.policy.manage' },
    { key: '/folders/policy/:folderCode/activate', method: 'POST', controller: 'DefaultMediaStorageController', operation: 'activateFolderPolicy', secured: true, permission: 'media.folder.policy.manage' },
    { key: '/folders/policy/:folderCode/deactivate', method: 'POST', controller: 'DefaultMediaStorageController', operation: 'deactivateFolderPolicy', secured: true, permission: 'media.folder.policy.manage' },
    { key: '/storage/location', method: 'POST', controller: 'DefaultMediaStorageController', operation: 'resolveStorageLocation', secured: true, permission: 'media.storage.location.resolve' },
    { key: '/storage/upload', method: 'POST', controller: 'DefaultMediaStorageController', operation: 'uploadMedia', secured: true, permission: 'media.upload.create' },
    { key: '/download/:mediaCode', method: 'GET', controller: 'DefaultMediaStorageController', operation: 'downloadMediaContent', secured: true, permission: 'media.content.download' },
    { key: '/references/media/validate', method: 'POST', controller: 'DefaultMediaReferenceLookupController', operation: 'validate', secured: true, permissionConfig: 'authSecurity.internalToken.routePermission' }
];

const routes = assertRouteContracts(routerConfig, expectedRoutes);
const contentRoute = routes.find(route => route.key === '/content/:mediaCode');
const downloadRoute = routes.find(route => route.key === '/download/:mediaCode');
assert(contentRoute, 'nMedia content route must be registered');
assert(downloadRoute, 'nMedia download route must be registered');
assert.strictEqual(contentRoute.responseHandler, 'mediaContentResponseHandler', 'inline media content must remain on nMedia content handler');
assert.strictEqual(downloadRoute.responseHandler, 'fileDownloadResponseHandler', 'download media content must reuse nRouter file-download response handler');
routes.forEach(route => {
    assert(['mediaManagement', 'moduleInternal'].includes(route.apiExposure), route.key + ' must be intentionally exposure-gated');
    if (route.key !== '/content/:mediaCode') {
        assert.notStrictEqual(route.publicAccess, true, route.key + ' must not be public');
    }
});
console.log(`nMedia route contract validated: ${expectedRoutes.length} routes`);
