/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
const authProperties = require('../../nAuth/config/properties');
const routerConfig = require('../src/router/routers');

const expectedRoutes = [
    { key: '/contexts', method: 'GET', controller: 'DefaultMediaStorageController', operation: 'listMediaContexts', secured: true, permission: 'media.context.view' },
    { key: '/storage/providers/summary', method: 'GET', controller: 'DefaultMediaStorageController', operation: 'summarizeStorageProviders', secured: true, permission: 'media.storage.policy.view' },
    { key: '/storage/policy', method: 'POST', controller: 'DefaultMediaStorageController', operation: 'resolveStoragePolicy', secured: true, permission: 'media.storage.policy.view' },
    { key: '/folders/policy', method: 'PUT', controller: 'DefaultMediaStorageController', operation: 'createFolderPolicy', secured: true, permission: 'media.folder.policy.manage' },
    { key: '/folders/policy/:folderCode', method: 'PATCH', controller: 'DefaultMediaStorageController', operation: 'saveFolderPolicy', secured: true, permission: 'media.folder.policy.manage' },
    { key: '/folders/policy/:folderCode/activate', method: 'POST', controller: 'DefaultMediaStorageController', operation: 'activateFolderPolicy', secured: true, permission: 'media.folder.policy.manage' },
    { key: '/folders/policy/:folderCode/deactivate', method: 'POST', controller: 'DefaultMediaStorageController', operation: 'deactivateFolderPolicy', secured: true, permission: 'media.folder.policy.manage' },
    { key: '/formats/policy', method: 'PUT', controller: 'DefaultMediaStorageController', operation: 'createFormatPolicy', secured: true, permission: 'media.format.policy.manage' },
    { key: '/formats/policy/:formatCode', method: 'PATCH', controller: 'DefaultMediaStorageController', operation: 'saveFormatPolicy', secured: true, permission: 'media.format.policy.manage' },
    { key: '/formats/policy/:formatCode/activate', method: 'POST', controller: 'DefaultMediaStorageController', operation: 'activateFormatPolicy', secured: true, permission: 'media.format.policy.manage' },
    { key: '/formats/policy/:formatCode/deactivate', method: 'POST', controller: 'DefaultMediaStorageController', operation: 'deactivateFormatPolicy', secured: true, permission: 'media.format.policy.manage' },
    { key: '/sets/:mediaSetCode/entries', method: 'POST', controller: 'DefaultMediaStorageController', operation: 'addMediaSetEntry', secured: true, permission: 'media.set.manage' },
    { key: '/sets/:mediaSetCode/entries/:entryCode', method: 'PATCH', controller: 'DefaultMediaStorageController', operation: 'updateMediaSetEntry', secured: true, permission: 'media.set.manage' },
    { key: '/sets/:mediaSetCode/entries/:entryCode', method: 'DELETE', controller: 'DefaultMediaStorageController', operation: 'removeMediaSetEntry', secured: true, permission: 'media.set.manage' },
    { key: '/sets/:mediaSetCode/entries/reorder', method: 'POST', controller: 'DefaultMediaStorageController', operation: 'reorderMediaSetEntries', secured: true, permission: 'media.set.manage' },
    { key: '/sets/:mediaSetCode/entries/:entryCode/primary', method: 'POST', controller: 'DefaultMediaStorageController', operation: 'setPrimaryMediaSetEntry', secured: true, permission: 'media.set.manage' },
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
assert.strictEqual(contentRoute.secured, true, 'inline content route must require authenticated media delivery');
assert.strictEqual(contentRoute.permission, 'media.content.read', 'inline content route must use governed media read permission');
assert.notStrictEqual(contentRoute.publicAccess, true, 'inline content route must not be anonymously public');
assert.strictEqual(downloadRoute.responseHandler, 'fileDownloadResponseHandler', 'download media content must reuse nRouter file-download response handler');
routes.forEach(route => {
    assert(['mediaManagement', 'moduleInternal'].includes(route.apiExposure), route.key + ' must be intentionally exposure-gated');
    assert.notStrictEqual(route.publicAccess, true, route.key + ' must not be public');
    if (route.permission) {
        assert(
            authProperties.identityGovernance.permissionCatalog.includes(route.permission),
            route.key + ' permission must be registered in the governed permission catalog'
        );
    }
});
console.log(`nMedia route contract validated: ${expectedRoutes.length} routes`);
