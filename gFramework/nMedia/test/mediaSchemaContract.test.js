/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nMedia/test/mediaSchemaContract
 * @description Validates nMedia schema ownership and required lifecycle fields.
 * @layer test
 * @owner nMedia
 * @override Later schema extensions must preserve these core fields.
 */

const assert = require('assert');
const schemas = require('../src/schemas/schemas');

const mediaSchemas = schemas.media;
['mediaFolder', 'mediaFormat', 'media', 'mediaSet', 'mediaSetEntry', 'mediaReference'].forEach(schemaName => {
    assert(mediaSchemas[schemaName], schemaName + ' schema must exist');
    assert.strictEqual(mediaSchemas[schemaName].super, 'base', schemaName + ' must inherit the base schema explicitly for generated contracts');
    assert.strictEqual(mediaSchemas[schemaName].model, true, schemaName + ' must be a persisted model');
    assert.strictEqual(mediaSchemas[schemaName].service.enabled, true, schemaName + ' must expose generated service behavior');
});
assert(!mediaSchemas.mediaContainer, 'nMedia must use mediaSet naming instead of copied mediaContainer terminology');
assert(!mediaSchemas.mediaContainerEntry, 'nMedia must use mediaSetEntry naming instead of copied mediaContainerEntry terminology');
assert(mediaSchemas.media.definition.providerCode.required, 'media.providerCode must identify the storage provider');
assert(mediaSchemas.media.definition.storageKey.required, 'media.storageKey must preserve provider-relative storage key');
assert(mediaSchemas.mediaSet.definition.mediaType.required, 'mediaSet.mediaType must classify the logical asset');
assert(mediaSchemas.mediaSetEntry.definition.mediaSetCode.required, 'mediaSetEntry.mediaSetCode must identify the owning media set');
assert(mediaSchemas.mediaSetEntry.definition.mediaCode.required, 'mediaSetEntry.mediaCode must identify the concrete media item');
assert(mediaSchemas.mediaReference.definition.ownerModule.required, 'mediaReference.ownerModule must identify caller ownership');
assert(mediaSchemas.mediaReference.definition.ownerSchema.required, 'mediaReference.ownerSchema must identify caller schema ownership');
assert(mediaSchemas.mediaReference.definition.mediaSetCode, 'mediaReference must be able to reference a media set');
console.log('nMedia schema contract validated');
