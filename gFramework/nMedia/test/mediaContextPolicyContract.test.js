/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nMedia/test/mediaContextPolicyContract
 * @description Validates backend-owned media source context metadata for Axis and other clients.
 * @layer test
 * @owner nMedia
 * @override Later project or customer layers may override `media.contexts` while preserving safe projection.
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
    global.CLASSES = { NodicsError };
    global.CONFIG = {
        get: function (key) {
            if (key !== 'media') {
                return undefined;
            }
            return mediaConfiguration;
        }
    };
    global.SERVICE = {
        DefaultMediaStoragePolicyService: policyService
    };
}

(async function () {
    installConfiguration(properties.media);

    const response = await facade.listMediaContexts();
    assert.strictEqual(response.code, 'SUC_MED_00006');
    assert(Array.isArray(response.data.contexts), 'media context response must include a context array');

    const contexts = response.data.contexts;
    const imports = contexts.find(context => context.code === 'dataImports');
    const exports = contexts.find(context => context.code === 'dataExports');
    const content = contexts.find(context => context.code === 'contentMedia');
    const utility = contexts.find(context => context.code === 'utilityMedia');

    assert(imports, 'data import context must be published');
    assert(exports, 'data export context must be published');
    assert(content, 'content media context must be published');
    assert(utility, 'utility media context must be published');

    assert.strictEqual(imports.label, 'Data imports');
    assert.strictEqual(imports.defaultFolderCode, 'importSources');
    assert.strictEqual(imports.defaultFormatCode, 'importFile');
    assert.strictEqual(imports.defaultModuleName, 'import');
    assert.strictEqual(imports.defaultSchemaName, 'mediaImport');
    assert.strictEqual(imports.targetRequired, true);
    assert.strictEqual(imports.manualUploadEnabled, true);
    assert.strictEqual(imports.allowedFolders[0].folderCode, 'importSources');
    assert.strictEqual(imports.allowedFolders[0].storagePrefix, 'data/import');
    assert.strictEqual(imports.allowedFolders[0].uploadPolicy.allowedExtensions.includes('csv'), true);

    assert.strictEqual(exports.defaultFolderCode, 'exportFiles');
    assert.strictEqual(exports.defaultFormatCode, 'exportFile');
    assert.strictEqual(exports.manualUploadEnabled, false, 'data exports must stay generated-only by default');
    assert.strictEqual(exports.storageRouteTemplate.includes('data/export'), true);

    assert.strictEqual(content.defaultFolderCode, 'cmsAssets');
    assert.strictEqual(content.allowedFolders[0].access, 'PUBLIC');
    assert.strictEqual(utility.allowedFolders[0].storagePrefix, 'media/utility');

    contexts.forEach(context => {
        assert.strictEqual(context.storageKey, undefined, 'context metadata must not expose storage keys');
        assert.strictEqual(context.fullPath, undefined, 'context metadata must not expose full paths');
        assert.strictEqual(context.provider, undefined, 'context metadata must not expose provider descriptors');
    });

    const customMedia = clone(properties.media);
    customMedia.contexts.businessDocuments = {
        code: 'businessDocuments',
        label: 'Business documents',
        description: 'Customer-owned business document media.',
        folderCodes: ['default'],
        defaultFolderCode: 'default',
        allowedFormatCodes: ['original'],
        defaultFormatCode: 'original',
        targetRequired: false,
        manualUploadEnabled: true,
        storageRouteTemplate: 'media/utility/{tenant}/{enterprise}/{schema}/{yyyy}/{mm}/{mediaCode}.{extension}'
    };
    installConfiguration(customMedia);

    const overriddenContexts = policyService.listMediaContexts();
    assert(
        overriddenContexts.some(context => context.code === 'businessDocuments' && context.label === 'Business documents'),
        'later configuration layers must be able to add media contexts without changing nMedia source'
    );

    console.log('nMedia context policy contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
