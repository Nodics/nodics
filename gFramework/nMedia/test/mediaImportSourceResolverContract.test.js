/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nMedia/test/mediaImportSourceResolverContract
 * @description Validates backend-only media import source resolution for nImport.
 * @layer test
 * @owner nMedia
 * @override Later provider implementations must preserve import-source policy and avoid public storage authority leakage.
 */

const assert = require('assert');
const properties = require('../config/properties');
const service = require('../src/service/storage/defaultMediaImportSourceResolverService');

class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }

const mediaItems = [
    {
        code: 'tenant-upload',
        folderCode: 'importSources',
        formatCode: 'importFile',
        providerCode: 'local',
        storageKey: 'default/default/imports/2026/07/tenant-upload.xlsx',
        originalFileName: 'tenant-upload.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        extension: 'xlsx',
        sizeBytes: 42,
        checksum: 'abc',
        checksumAlgorithm: 'sha256',
        status: 'READY'
    },
    {
        code: 'product-image',
        folderCode: 'productAssets',
        formatCode: 'original',
        providerCode: 'local',
        storageKey: 'default/default/products/2026/07/product-image.png',
        originalFileName: 'product-image.png',
        extension: 'png',
        status: 'READY'
    },
    {
        code: 'draft-upload',
        folderCode: 'importSources',
        formatCode: 'importFile',
        providerCode: 'local',
        storageKey: 'default/default/imports/2026/07/draft-upload.xlsx',
        originalFileName: 'draft-upload.xlsx',
        extension: 'xlsx',
        status: 'UPLOADED'
    }
];

const matches = (item, query) => Object.keys(query || {}).every(key => {
    let expected = query[key];
    if (expected && expected.$in) return expected.$in.includes(item[key]);
    return item[key] === expected;
});

global.CLASSES = { NodicsError };
global.CONFIG = { get: key => properties[key] };
global.SERVICE = {
    DefaultMediaService: { get: async request => ({ result: mediaItems.filter(item => matches(item, request.query)) }) },
    DefaultMediaStorageProviderRegistryService: {
        resolveImportSource: request => ({
            providerCode: request.providerCode,
            storageKey: request.storageKey,
            absolutePath: '/server-owned/media/' + request.storageKey,
            fileName: request.originalFileName,
            mimeType: request.mimeType,
            extension: request.extension,
            sizeBytes: request.sizeBytes,
            checksum: request.checksum,
            checksumAlgorithm: request.checksumAlgorithm
        })
    }
};

(async () => {
    let descriptor = await service.resolve({ tenant: 'default', mediaCode: 'tenant-upload' });
    assert.strictEqual(descriptor.mediaCode, 'tenant-upload');
    assert.strictEqual(descriptor.folderCode, 'importSources');
    assert.strictEqual(descriptor.formatCode, 'importFile');
    assert.strictEqual(descriptor.source.absolutePath, '/server-owned/media/default/default/imports/2026/07/tenant-upload.xlsx');

    await assert.rejects(service.resolve({ tenant: 'default', mediaCode: 'product-image' }), error => error.code === 'ERR_MED_00011');
    await assert.rejects(service.resolve({ tenant: 'default', mediaCode: 'draft-upload' }), error => error.code === 'ERR_MED_00011');
    await assert.rejects(service.resolve({ tenant: 'default' }), error => error.code === 'ERR_MED_00011');

    console.log('nMedia import source resolver contract validated');
})().catch(error => { console.error(error); process.exit(1); });
