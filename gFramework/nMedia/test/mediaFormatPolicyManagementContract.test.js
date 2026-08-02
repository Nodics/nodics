/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nMedia/test/mediaFormatPolicyManagementContract
 * @description Validates nMedia-owned media format policy management and upload-policy enforcement.
 * @layer test
 * @owner nMedia
 * @override Later project/customer modules may override media formats through layered configuration or policy services.
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

    const created = await facade.saveFormatPolicy({
        create: true,
        code: 'heroDesktop',
        name: 'Hero desktop',
        description: 'Customer desktop hero image.',
        purpose: 'content-hero',
        width: 1440,
        height: 600,
        formatFamily: 'RESPONSIVE'
    });
    assert.strictEqual(created.code, 'SUC_MED_00010');
    assert.strictEqual(created.data.formatCode, 'heroDesktop');
    assert.strictEqual(created.data.status, 'ACTIVE');
    assert.strictEqual(created.data.formatFamily, 'RESPONSIVE');

    const descriptor = policyService.validateDescriptor({
        folderCode: 'cmsAssets',
        formatCode: 'heroDesktop',
        fileName: 'hero.png',
        mimeType: 'image/png',
        sizeBytes: 1
    });
    assert.strictEqual(descriptor.format.code, 'heroDesktop');
    assert.strictEqual(descriptor.formatCode, 'heroDesktop');

    const updated = await facade.saveFormatPolicy({
        formatCode: 'heroDesktop',
        width: 1600,
        height: 700
    });
    assert.strictEqual(updated.data.width, 1600);
    assert.strictEqual(updated.data.height, 700);

    await facade.deactivateFormatPolicy({ formatCode: 'heroDesktop' });
    assert.throws(() => policyService.validateDescriptor({
        folderCode: 'cmsAssets',
        formatCode: 'heroDesktop',
        fileName: 'hero.png',
        mimeType: 'image/png',
        sizeBytes: 1
    }), /Inactive media format/);

    await facade.activateFormatPolicy({ formatCode: 'heroDesktop' });
    assert.strictEqual(policyService.getFormatPolicy('heroDesktop').status, 'ACTIVE');

    assert.throws(() => facade.saveFormatPolicy({
        create: true,
        code: 'badFormat',
        formatFamily: 'PRODUCT_ONLY'
    }), /Invalid media format family/);

    const customizedMedia = clone(properties.media);
    customizedMedia.formats.partnerSquare = {
        code: 'partnerSquare',
        name: 'Partner square',
        description: 'Partner-owned square image variant.',
        purpose: 'partner-content',
        width: 800,
        height: 800,
        formatFamily: 'CUSTOM',
        status: 'ACTIVE'
    };
    installConfiguration(customizedMedia);
    const customized = policyService.projectFormatPolicy('partnerSquare');
    assert.strictEqual(customized.formatCode, 'partnerSquare');
    assert.strictEqual(customized.width, 800);
    assert.strictEqual(
        policyService.validateDescriptor({
            folderCode: 'cmsAssets',
            formatCode: 'partnerSquare',
            fileName: 'partner.png',
            mimeType: 'image/png',
            sizeBytes: 1
        }).format.code,
        'partnerSquare',
        'customer/project format override must affect upload policy without framework edits'
    );

    console.log('nMedia format policy management contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
