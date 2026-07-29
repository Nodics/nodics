/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nMedia/test/MediaUploadContract
 * @description Validates nMedia upload ownership after nMedia has parsed multipart data.
 * @layer test
 * @owner nMedia
 * @override Upload extensions must preserve provider-neutral storage and generated media metadata persistence.
 */

const assert = require('assert');
const crypto = require('crypto');
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
const uploadService = require('../src/service/storage/defaultMediaUploadService');
const localProviderService = require('../src/service/storage/provider/defaultLocalMediaStorageProviderService');

class NodicsError extends Error {
    constructor(code, message) {
        super(message || code);
        this.code = code;
    }
}

(async function () {
    const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-media-upload-contract-'));
    const serverPath = path.join(workspace, 'startio/envs/startioLocal/monoServer');
    let savedMedia;
    global.CLASSES = { NodicsError };
    global.NODICS = {
        getNodicsHome: () => workspace,
        getServerPath: () => serverPath
    };
    global.CONFIG = {
        get: key => properties[key]
    };
    global.SERVICE = {
        DefaultMediaStoragePolicyService: policyService,
        DefaultMediaStorageKeyService: keyService,
        DefaultMediaStorageRootResolverService: rootResolverService,
        DefaultMediaStorageKeyStrategyRegistryService: keyStrategyRegistryService,
        DefaultTenantEnterpriseSchemaDateMediaKeyStrategyService: tenantEnterpriseSchemaDateMediaKeyStrategyService,
        DefaultMediaStorageProviderRegistryService: registryService,
        DefaultLocalMediaStorageProviderService: localProviderService,
        DefaultMediaUploadService: uploadService,
        DefaultMediaService: {
            save: async request => {
                savedMedia = request.model;
                return { result: [request.model] };
            }
        }
    };

    const buffer = Buffer.from('code,name\n');
    const expectedChecksum = crypto.createHash('sha256').update(buffer).digest('hex');
    const media = await uploadService.upload({
        tenant: 'default',
        enterpriseCode: 'default',
        authData: { tokenType: 'access', principalId: 'admin' },
        schemaName: 'tenant',
        folderCode: 'importSources',
        formatCode: 'importFile',
        files: [{
            fieldName: 'file',
            originalFileName: 'tenant.csv',
            mimeType: 'text/csv',
            buffer: buffer,
            sizeBytes: buffer.length
        }]
    });

    assert.strictEqual(media.folderCode, 'importSources');
    assert.strictEqual(media.formatCode, 'importFile');
    assert.strictEqual(media.status, 'READY');
    assert.strictEqual(media.checksum, expectedChecksum);
    assert.strictEqual(savedMedia.originalFileName, 'tenant.csv');
    assert.strictEqual(savedMedia.storageKey.endsWith('.csv'), true);
    assert.strictEqual(savedMedia.relativePath, savedMedia.storageKey);
    assert.strictEqual(savedMedia.storageKey.startsWith('data/import/default/default/tenant/'), true);
    assert.strictEqual(savedMedia.fullPath, path.join(NODICS.getServerPath(), 'temp/media', savedMedia.storageKey));
    assert.strictEqual(savedMedia.accessUrl, '/nodics/media/v0/content/' + savedMedia.code);
    assert.strictEqual(savedMedia.accessUrl, savedMedia.url);
    assert.strictEqual(
        fs.existsSync(path.join(NODICS.getServerPath(), 'temp/media', savedMedia.storageKey)),
        true
    );

    await assert.rejects(uploadService.upload({ tenant: 'default', files: [] }), error => error.code === 'ERR_MED_00001');
    delete global.SERVICE.DefaultMediaService;
    await assert.rejects(uploadService.upload({
        tenant: 'default',
        folderCode: 'importSources',
        files: [{ fieldName: 'file', originalFileName: 'tenant.csv', mimeType: 'text/csv', buffer: buffer, sizeBytes: buffer.length }]
    }), error => error.code === 'ERR_MED_00009');

    fs.rmSync(workspace, { recursive: true, force: true });
    console.log('nMedia upload contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
