/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nMedia/test/mediaReferenceLookupContract
 * @description Validates secured nMedia media item and media set reference lookup boundaries.
 * @layer test
 * @owner nMedia
 * @override Later lookup projections may add safe fields but must not expose storage authority to caller modules.
 */

const assert = require('assert');
const properties = require('../config/properties');
const service = require('../src/service/reference/defaultMediaReferenceLookupService');

class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }

const mediaItems = [
    { code: 'phone-primary-file', folderCode: 'productAssets', formatCode: 'original', providerCode: 'local', storageKey: 'private/key', url: '/do-not-project-as-authority', access: 'PUBLIC', mimeType: 'image/png', extension: 'png', status: 'READY' },
    { code: 'draft-upload', folderCode: 'productAssets', formatCode: 'original', providerCode: 'local', storageKey: 'private/draft', access: 'PRIVATE', status: 'UPLOADED' }
];
const mediaSets = [
    { code: 'phone-primary-set', mediaType: 'IMAGE', businessPurpose: 'product-gallery', status: 'ACTIVE' },
    { code: 'retired-set', mediaType: 'IMAGE', businessPurpose: 'product-gallery', status: 'RETIRED' }
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
    DefaultMediaSetService: { get: async request => ({ result: mediaSets.filter(item => matches(item, request.query)) }) }
};

(async () => {
    let media = await service.validateInternal({ tenant: 't1', authData: { tokenType: 'access' }, body: { referenceType: 'MEDIA', referenceCode: 'phone-primary-file' } });
    assert.strictEqual(media.referenceType, 'MEDIA');
    assert.strictEqual(media.code, 'phone-primary-file');
    assert.strictEqual(media.storageKey, undefined, 'lookup must not expose provider storage keys');
    assert.strictEqual(media.url, undefined, 'lookup must not expose delivery URLs as Product authority');

    let set = await service.validateInternal({ tenant: 't1', authData: {}, body: { referenceType: 'MEDIA_SET', referenceCode: 'phone-primary-set' } });
    assert.strictEqual(set.referenceType, 'MEDIA_SET');
    assert.strictEqual(set.businessPurpose, 'product-gallery');

    await assert.rejects(service.validateInternal({ tenant: 't1', authData: {}, body: { referenceType: 'MEDIA', referenceCode: 'draft-upload' } }), error => error.code === 'ERR_MED_00008');
    await assert.rejects(service.validateInternal({ tenant: 't1', authData: {}, body: { referenceType: 'MEDIA_SET', referenceCode: 'retired-set' } }), error => error.code === 'ERR_MED_00008');
    await assert.rejects(service.validate({ tenant: 't1', authData: { tokenType: 'access' }, body: { referenceType: 'MEDIA', referenceCode: 'phone-primary-file' } }), error => error.code === 'ERR_MED_00007');

    let remote = await service.validate({ tenant: 't1', authData: { tokenType: 'service' }, body: { referenceType: 'MEDIA_SET', referenceCode: 'phone-primary-set' } });
    assert.strictEqual(remote.code, 'SUC_MED_00003');
    assert.strictEqual(remote.data.code, 'phone-primary-set');
    console.log('nMedia reference lookup contract validated');
})().catch(error => { console.error(error); process.exit(1); });
