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
['mediaFolder', 'mediaFormat', 'media', 'mediaSet', 'mediaSetEntry', 'mediaReference'].forEach((schemaName) => {
    assert(mediaSchemas[schemaName], schemaName + ' schema must exist');
    assert.strictEqual(mediaSchemas[schemaName].super, 'base', schemaName + ' must inherit the base schema explicitly for generated contracts');
    assert.strictEqual(mediaSchemas[schemaName].model, true, schemaName + ' must be a persisted model');
    assert.strictEqual(mediaSchemas[schemaName].service.enabled, true, schemaName + ' must expose generated service behavior');
});
assert(!mediaSchemas.mediaContainer, 'nMedia must use mediaSet naming instead of copied mediaContainer terminology');
assert(!mediaSchemas.mediaContainerEntry, 'nMedia must use mediaSetEntry naming instead of copied mediaContainerEntry terminology');
assert(mediaSchemas.media.definition.providerCode.required, 'media.providerCode must identify the storage provider');
assert.deepStrictEqual(mediaSchemas.mediaFolder.definition.status.enum, ['ACTIVE', 'INACTIVE'], 'mediaFolder.status must support activate/deactivate policy');
assert.strictEqual(mediaSchemas.mediaFolder.definition.status.searchOptions.enabled, true, 'mediaFolder.status must be searchable through Schema Workbench');
assert.deepStrictEqual(mediaSchemas.mediaFormat.definition.status.enum, ['ACTIVE', 'INACTIVE'], 'mediaFormat.status must support activate/deactivate policy');
assert(Array.isArray(mediaSchemas.mediaFormat.definition.formatFamily.enum), 'mediaFormat.formatFamily must be enum-filterable through Schema Workbench');
assert.strictEqual(mediaSchemas.mediaFormat.definition.status.searchOptions.enabled, true, 'mediaFormat.status must be searchable through Schema Workbench');
assert(mediaSchemas.media.definition.storageKey.required, 'media.storageKey must preserve provider-relative storage key');
assert(mediaSchemas.media.definition.originalFileName, 'media.originalFileName must preserve the uploaded filename');
assert(mediaSchemas.media.definition.storedFileName, 'media.storedFileName must preserve the provider stored filename');
assert(mediaSchemas.media.definition.relativePath, 'media.relativePath must preserve the readable provider-relative path');
assert(mediaSchemas.media.definition.fullPath, 'media.fullPath must preserve backend-resolved storage location for governed processing');
assert(mediaSchemas.media.definition.accessUrl, 'media.accessUrl must preserve the provider-resolved access URL when available');
['storageKey', 'storedFileName', 'relativePath', 'fullPath', 'url', 'accessUrl'].forEach((fieldName) => {
    assert(mediaSchemas.media.backoffice.excludedFields.includes(fieldName), 'media Workbench contract must exclude raw storage field `' + fieldName + '`');
});
['code', 'name', 'description', 'folderCode', 'formatCode', 'providerCode', 'originalFileName', 'mimeType', 'extension'].forEach((fieldName) => {
    assert.strictEqual(mediaSchemas.media.definition[fieldName].searchOptions.enabled, true, 'media.' + fieldName + ' must be searchable through Schema Workbench');
});
['access', 'status'].forEach((fieldName) => {
    assert(Array.isArray(mediaSchemas.media.definition[fieldName].enum), 'media.' + fieldName + ' must remain enum-filterable through Schema Workbench');
});
assert(mediaSchemas.mediaSet.definition.mediaType.required, 'mediaSet.mediaType must classify the logical asset');
assert(mediaSchemas.mediaSetEntry.definition.mediaSetCode.required, 'mediaSetEntry.mediaSetCode must identify the owning media set');
assert(mediaSchemas.mediaSetEntry.definition.mediaCode.required, 'mediaSetEntry.mediaCode must identify the concrete media item');
['channelCode', 'deviceCode', 'breakpointCode', 'fallbackEntryCode', 'primary'].forEach((fieldName) => {
    assert(mediaSchemas.mediaSetEntry.definition[fieldName], 'mediaSetEntry.' + fieldName + ' must support reusable variant selection');
});
assert(mediaSchemas.mediaReference.definition.ownerModule.required, 'mediaReference.ownerModule must identify caller ownership');
assert(mediaSchemas.mediaReference.definition.ownerSchema.required, 'mediaReference.ownerSchema must identify caller schema ownership');
assert(mediaSchemas.mediaReference.definition.mediaSetCode, 'mediaReference must be able to reference a media set');
['ownerModule', 'ownerSchema', 'ownerCode', 'mediaCode', 'mediaSetCode', 'relationType'].forEach((fieldName) => {
    assert.strictEqual(
        mediaSchemas.mediaReference.definition[fieldName].searchOptions.enabled,
        true,
        'mediaReference.' + fieldName + ' must be searchable through Schema Workbench',
    );
});
console.log('nMedia schema contract validated');
