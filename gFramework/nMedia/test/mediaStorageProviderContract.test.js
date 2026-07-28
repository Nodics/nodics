/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
    global.CLASSES = { NodicsError };
    global.NODICS = {
        getNodicsHome: function () {
            return workspace;
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
        mediaCode: 'upload-1'
    };

    const location = registryService.resolveLocation(descriptor);
    assert.strictEqual(location.providerCode, 'local');
    assert.strictEqual(location.folderCode, 'importSources');
    assert.strictEqual(location.extension, 'xlsx');
    assert.strictEqual(location.absolutePath, undefined, 'public descriptors must not expose absolute filesystem paths');
    assert.strictEqual(location.storageKey, 'default/default/imports/2026/07/upload-1.xlsx');
    assert.strictEqual(location.url, '/nodics/media/v0/content/default/default/imports/2026/07/upload-1.xlsx');

    const stored = await registryService.store(Object.assign({}, descriptor, {
        buffer: Buffer.from('tenant,data\n')
    }));
    assert.strictEqual(stored.sizeBytes, 12);
    assert.strictEqual(fs.existsSync(stored.internalAbsolutePath), true);

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

