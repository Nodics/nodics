/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const service = require('../src/service/storage/defaultMediaLifecycleCoordinationService');
describe('nMedia lifecycle coordination contract', function () {
    let media; let removed; let updates;
    beforeEach(function () { removed = 0; updates = []; media = { code: 'media-1', providerCode: 'local', storageKey: 'safe/key', businessPurpose: 'kycDocuments', ownerReference: 'subject-1', reusable: false, retentionUntil: new Date(Date.now() - 1000), legalHold: false, status: 'READY', version: 2 }; global.SERVICE = { DefaultMediaService: { get: async () => ({ result: [media] }), update: async input => { updates.push(input); return { modifiedCount: 1 }; } }, DefaultMediaStorageProviderRegistryService: { remove: async () => { removed += 1; return { removed: true }; } } }; });
    it('binds immutable purpose and scoped retention metadata', async function () { const result = await service.bind({ tenant: 't1', mediaCode: 'media-1', businessPurpose: 'kycDocuments', ownerType: 'KYC_SUBJECT', ownerReference: 'subject-1', retentionUntil: new Date(), legalHold: false }); assert.strictEqual(result.mediaCode, 'media-1'); assert.strictEqual(updates[0].query.version, 2); });
    it('blocks held deletion and deletes elapsed storage through nMedia', async function () { media.legalHold = true; await assert.rejects(() => service.deleteExpired({ tenant: 't1', mediaCode: 'media-1' }), error => error.code === 'ERR_MED_00019'); media.legalHold = false; const result = await service.deleteExpired({ tenant: 't1', mediaCode: 'media-1' }); assert.strictEqual(result.deleted, true); assert.strictEqual(removed, 1); assert.strictEqual(updates[0].model.$set.status, 'DELETED'); });
});
