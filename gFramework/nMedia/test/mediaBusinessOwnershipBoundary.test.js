/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nMedia/test/mediaBusinessOwnershipBoundary
 * @description Ensures nMedia owns reusable media sets while caller modules own product, CMS, import, and documentation meaning.
 * @layer test
 * @owner nMedia
 * @override Later product or CMS modules may add business assignments without moving storage authority out of nMedia.
 */

const assert = require('assert');

const schemas = require('../src/schemas/schemas').media;
const properties = require('../config/properties').media;

assert(schemas.mediaSet, 'nMedia must expose reusable mediaSet for logical assets with variants');
assert(schemas.mediaSetEntry, 'nMedia must expose mediaSetEntry for concrete variants inside a media set');
assert(schemas.mediaReference, 'nMedia must expose generic mediaReference for caller-owned business objects');

[
    'productMediaAssignment',
    'productGalleryImage',
    'productPrimaryImage',
    'cmsComponentMediaAssignment',
    'importSourceExecution'
].forEach(schemaName => {
    assert(!schemas[schemaName], 'nMedia must not own caller-specific business schema `' + schemaName + '`');
});

['original', 'thumbnail', 'small', 'medium', 'large', 'zoom', 'desktop', 'mobile', 'importFile'].forEach(formatCode => {
    assert(properties.formats[formatCode], 'nMedia must provide generic format `' + formatCode + '`');
});

assert(properties.folders.productAssets, 'nMedia may provide a reusable productAssets folder policy');
assert.strictEqual(schemas.mediaReference.definition.ownerModule.required, true,
    'Generic references must preserve caller module ownership');
assert.strictEqual(schemas.mediaReference.definition.ownerSchema.required, true,
    'Generic references must preserve caller schema ownership');

console.log('nMedia business ownership boundary validated');
