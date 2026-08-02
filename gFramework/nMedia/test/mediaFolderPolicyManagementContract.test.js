/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nMedia/test/mediaFolderPolicyManagementContract
 * @description Validates nMedia-owned media folder policy management, runtime
 * configuration customization, and upload-policy enforcement.
 * @layer test
 * @owner nMedia
 * @override Later project/customer modules may override folder policy through
 * layered configuration or nMedia-owned policy services, but must preserve
 * validation, secret/path safety, and inactive-folder upload rejection.
 */

const assert = require('assert');

const properties = require('../config/properties');
const facade = require('../src/facade/storage/defaultMediaStorageFacade');
const policyService = require('../src/service/storage/defaultMediaStoragePolicyService');

class NodicsError extends Error {
    constructor(code, message) {
        super(message || code);
        this.code = code;
    }
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function installConfiguration(mediaConfiguration) {
    const rootProperties = { media: mediaConfiguration };
    global.CLASSES = { NodicsError };
    global.CONFIG = {
        properties: rootProperties,
        getProperties: function () {
            return this.properties;
        },
        setProperties: function (next) {
            this.properties = next;
        },
        get: function (key) {
            return this.properties[key];
        }
    };
    global.SERVICE = {
        DefaultMediaStoragePolicyService: policyService
    };
}

(async function () {
    installConfiguration(clone(properties.media));

    const created = await facade.saveFolderPolicy({
        create: true,
        code: 'businessDocuments',
        name: 'Business documents',
        description: 'Customer-owned document media.',
        storagePrefix: 'media/business',
        access: 'PRIVATE',
        allowedExtensions: ['pdf'],
        allowedMimeTypes: ['application/pdf'],
        maximumFileSizeBytes: 1024,
        retentionDays: 90
    });
    assert.strictEqual(created.code, 'SUC_MED_00007');
    assert.strictEqual(created.data.folderCode, 'businessDocuments');
    assert.strictEqual(created.data.storagePrefix, 'media/business');
    assert.strictEqual(created.data.status, 'ACTIVE');
    assert.deepStrictEqual(created.data.uploadPolicy.allowedExtensions, ['pdf']);

    const updated = await facade.saveFolderPolicy({
        folderCode: 'businessDocuments',
        access: 'SIGNED',
        maximumFileSizeBytes: 2048,
        retentionDays: 120
    });
    assert.strictEqual(updated.data.access, 'SIGNED');
    assert.strictEqual(updated.data.uploadPolicy.maximumFileSizeBytes, 2048);
    assert.strictEqual(updated.data.retentionDays, 120);

    const validDescriptor = policyService.validateDescriptor({
        folderCode: 'businessDocuments',
        fileName: 'contract.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 2048
    });
    assert.strictEqual(validDescriptor.folder.code, 'businessDocuments');
    assert.strictEqual(validDescriptor.folder.access, 'SIGNED');
    assert.strictEqual(validDescriptor.uploadPolicy.maximumFileSizeBytes, 2048);

    assert.throws(() => policyService.validateDescriptor({
        folderCode: 'businessDocuments',
        fileName: 'contract.exe',
        mimeType: 'application/octet-stream',
        sizeBytes: 1
    }), /Media file extension is not allowed/);

    await facade.deactivateFolderPolicy({ folderCode: 'businessDocuments' });
    assert.throws(() => policyService.validateDescriptor({
        folderCode: 'businessDocuments',
        fileName: 'contract.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1
    }), /Inactive media folder/);

    await facade.activateFolderPolicy({ folderCode: 'businessDocuments' });
    assert.strictEqual(policyService.getFolderPolicy('businessDocuments').status, 'ACTIVE');

    assert.throws(() => facade.saveFolderPolicy({
        create: true,
        code: 'unsafeFolder',
        storagePrefix: '../escape',
        access: 'PRIVATE'
    }), /Invalid media folder storage prefix/);

    assert.throws(() => facade.saveFolderPolicy({
        create: true,
        code: 'urlFolder',
        storagePrefix: 'https://bucket.example/private',
        access: 'PRIVATE'
    }), /Invalid media folder storage prefix/);

    const customizedMedia = clone(properties.media);
    customizedMedia.folders.customerKyc = {
        code: 'customerKyc',
        name: 'Customer KYC',
        storagePrefix: 'media/kyc',
        access: 'PRIVATE',
        allowedExtensions: ['pdf'],
        allowedMimeTypes: ['application/pdf'],
        maximumFileSizeBytes: 4096,
        retentionDays: 365,
        status: 'ACTIVE'
    };
    installConfiguration(customizedMedia);
    const customized = policyService.projectFolderPolicy('customerKyc');
    assert.strictEqual(customized.folderCode, 'customerKyc');
    assert.strictEqual(customized.storagePrefix, 'media/kyc');
    assert.strictEqual(customized.uploadPolicy.maximumFileSizeBytes, 4096);
    assert(
        customized.uploadPolicy.allowedMimeTypes.includes('application/pdf'),
        'customer/project folder policy override must affect upload policy without framework edits'
    );

    console.log('nMedia folder policy management contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
