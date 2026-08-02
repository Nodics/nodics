/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nMedia/test/mediaStorageProviderContract
 * @description Validates provider-neutral media storage resolution and local provider safety.
 * @layer test
 * @owner nMedia
 * @override Later provider implementations must preserve this safety contract.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const properties = require('../config/properties');
const policyService = require('../src/service/storage/defaultMediaStoragePolicyService');
const keyService = require('../src/service/storage/defaultMediaStorageKeyService');
const rootResolverService = require('../src/service/storage/defaultMediaStorageRootResolverService');
const keyStrategyRegistryService = require('../src/service/storage/defaultMediaStorageKeyStrategyRegistryService');
const tenantEnterpriseSchemaDateMediaKeyStrategyService = require('../src/service/storage/strategy/defaultTenantEnterpriseSchemaDateMediaKeyStrategyService');
const registryService = require('../src/service/storage/defaultMediaStorageProviderRegistryService');
const localProviderService = require('../src/service/storage/provider/defaultLocalMediaStorageProviderService');

class NodicsError extends Error {
    constructor(code, message) {
        super(message || code);
        this.code = code;
    }
}

(async function () {
    const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-media-contract-'));
    const serverPath = path.join(workspace, 'startio/envs/startioLocal/monoServer');
    global.CLASSES = { NodicsError };
    global.NODICS = {
        getNodicsHome: function () {
            return workspace;
        },
        getServerPath: function () {
            return serverPath;
        }
    };
    global.CONFIG = {
        get: function (key) {
            return properties[key];
        }
    };
    global.SERVICE = {
        DefaultMediaStoragePolicyService: policyService,
        DefaultMediaStorageKeyService: keyService,
        DefaultMediaStorageRootResolverService: rootResolverService,
        DefaultMediaStorageKeyStrategyRegistryService: keyStrategyRegistryService,
        DefaultTenantEnterpriseSchemaDateMediaKeyStrategyService: tenantEnterpriseSchemaDateMediaKeyStrategyService,
        DefaultMediaStorageProviderRegistryService: registryService,
        DefaultLocalMediaStorageProviderService: localProviderService
    };

    const descriptor = {
        tenant: 'default',
        enterpriseCode: 'default',
        folderCode: 'importSources',
        fileName: 'Tenant Upload.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        sizeBytes: 128,
        date: new Date(Date.UTC(2026, 6, 28)),
        schemaName: 'tenant',
        mediaCode: 'upload-1'
    };

    const location = registryService.resolveLocation(descriptor);
    assert.strictEqual(location.providerCode, 'local');
    assert.strictEqual(location.folderCode, 'importSources');
    assert.strictEqual(location.extension, 'xlsx');
    assert.strictEqual(location.absolutePath, undefined, 'public descriptors must not expose absolute filesystem paths');
    assert.strictEqual(location.storageKey, 'data/import/default/default/tenant/2026/07/upload-1.xlsx');
    assert.strictEqual(location.relativePath, 'data/import/default/default/tenant/2026/07/upload-1.xlsx');
    assert.strictEqual(location.url, '/nodics/media/v0/content/upload-1');
    assert.strictEqual(location.accessUrl, '/nodics/media/v0/content/upload-1');

    const stored = await registryService.store(Object.assign({}, descriptor, {
        buffer: Buffer.from('tenant,data\n')
    }));
    assert.strictEqual(stored.sizeBytes, 12);
    assert.strictEqual(stored.relativePath, stored.storageKey);
    assert.strictEqual(stored.fullPath, stored.internalAbsolutePath);
    assert.strictEqual(fs.existsSync(stored.internalAbsolutePath), true);
    assert.strictEqual(
        stored.internalAbsolutePath.startsWith(path.join(NODICS.getServerPath(), 'temp/media') + path.sep),
        true,
        'relative local media storage must resolve under the active server runtime path'
    );
    assert.strictEqual(
        rootResolverService.resolveLocalRoot({ provider: { basePath: path.join(workspace, 'configured-media-root') } }),
        path.join(workspace, 'configured-media-root'),
        'configured absolute local media root must win over server fallback'
    );
    assert.strictEqual(
        rootResolverService.resolveLocalRoot({ provider: { basePath: 'custom/media' } }),
        path.join(NODICS.getServerPath(), 'custom/media'),
        'configured relative local media root must resolve under active server path'
    );

    const exportLocation = registryService.resolveLocation(Object.assign({}, descriptor, {
        folderCode: 'exportFiles',
        formatCode: 'exportFile',
        fileName: 'tenant-export.csv',
        mimeType: 'text/csv',
        mediaCode: 'export-1'
    }));
    assert.strictEqual(exportLocation.folderCode, 'exportFiles');
    assert.strictEqual(exportLocation.access, 'PRIVATE');
    assert.strictEqual(exportLocation.storageKey, 'data/export/default/default/tenant/2026/07/export-1.csv');

    const contentLocation = registryService.resolveLocation(Object.assign({}, descriptor, {
        folderCode: 'cmsAssets',
        formatCode: 'desktop',
        fileName: 'home-banner.png',
        mimeType: 'image/png',
        schemaName: 'cmsComponent',
        mediaCode: 'home-banner'
    }));
    assert.strictEqual(contentLocation.folderCode, 'cmsAssets');
    assert.strictEqual(contentLocation.access, 'PUBLIC');
    assert.strictEqual(contentLocation.storageKey, 'media/content/default/default/cmsComponent/2026/07/home-banner.png');

    const productLocation = registryService.resolveLocation(Object.assign({}, descriptor, {
        folderCode: 'productAssets',
        formatCode: 'original',
        fileName: 'iphone-gallery.webp',
        mimeType: 'image/webp',
        enterpriseCode: 'electronics',
        schemaName: 'product',
        mediaCode: 'iphone-gallery'
    }));
    assert.strictEqual(productLocation.folderCode, 'productAssets');
    assert.strictEqual(productLocation.access, 'PUBLIC');
    assert.strictEqual(productLocation.storageKey, 'media/product/default/electronics/product/2026/07/iphone-gallery.webp');

    const utilityLocation = registryService.resolveLocation(Object.assign({}, descriptor, {
        folderCode: 'default',
        formatCode: 'original',
        fileName: 'kyc-proof.pdf',
        mimeType: 'application/pdf',
        schemaName: 'document',
        mediaCode: 'kyc-proof'
    }));
    assert.strictEqual(utilityLocation.folderCode, 'default');
    assert.strictEqual(utilityLocation.access, 'PRIVATE');
    assert.strictEqual(utilityLocation.storageKey, 'media/utility/default/default/document/2026/07/kyc-proof.pdf');

    assert.throws(() => keyService.assertSafeStorageKey('../escape.xlsx'), /Unsafe media storage key/);
    assert.throws(() => registryService.resolveLocation(Object.assign({}, descriptor, {
        storageKey: '../../server.js',
        trustedStorageKey: true
    })), /Unsafe media storage key/);
    assert.throws(() => registryService.resolveLocation(Object.assign({}, descriptor, {
        fileName: 'tenant.exe'
    })), /Media file extension is not allowed/);
    assert.throws(() => registryService.resolveLocation(Object.assign({}, descriptor, {
        sizeBytes: properties.media.folders.importSources.maximumFileSizeBytes + 1
    })), /Media file size exceeds folder policy/);

    fs.rmSync(workspace, { recursive: true, force: true });
    console.log('nMedia provider-neutral storage contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
