/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nMedia/test/mediaSetEntryManagementContract
 * @description Validates nMedia-owned media set entry operations without Product/CMS ownership leakage.
 * @layer test
 * @owner nMedia
 * @override Customer modules may override set-entry selection but must preserve media-set ownership boundaries.
 */

const assert = require('assert');

const facade = require('../src/facade/storage/defaultMediaStorageFacade');
const setEntryManagementService = require('../src/service/set/defaultMediaSetEntryManagementService');

class NodicsError extends Error {
    constructor(code, message) {
        super(message || code);
        this.code = code;
    }
}

function installServices() {
    const mediaSets = [{ code: 'heroSet', name: 'Hero set', status: 'ACTIVE' }];
    const entries = [];
    global.CLASSES = { NodicsError };
    global.SERVICE = {
        DefaultMediaSetEntryManagementService: setEntryManagementService,
        DefaultMediaSetService: {
            records: mediaSets
        },
        DefaultMediaSetEntryService: {
            records: entries
        }
    };
    return { mediaSets, entries };
}

(async function () {
    const state = installServices();

    const desktop = await facade.addMediaSetEntry({
        code: 'heroDesktopEntry',
        mediaSetCode: 'heroSet',
        mediaCode: 'heroDesktopMedia',
        formatCode: 'desktop',
        variantRole: 'hero',
        localeCode: 'en',
        channelCode: 'web',
        deviceCode: 'desktop',
        breakpointCode: 'lg',
        position: 2
    });
    assert.strictEqual(desktop.code, 'SUC_MED_00013');
    assert.strictEqual(desktop.data.mediaSetCode, 'heroSet');
    assert.strictEqual(desktop.data.deviceCode, 'desktop');

    await facade.addMediaSetEntry({
        code: 'heroMobileEntry',
        mediaSetCode: 'heroSet',
        mediaCode: 'heroMobileMedia',
        formatCode: 'mobile',
        variantRole: 'hero',
        localeCode: 'en',
        channelCode: 'web',
        deviceCode: 'mobile',
        breakpointCode: 'sm',
        position: 1,
        primary: true
    });

    const reordered = await facade.reorderMediaSetEntries({
        mediaSetCode: 'heroSet',
        entryCodes: ['heroDesktopEntry', 'heroMobileEntry']
    });
    assert.deepStrictEqual(
        reordered.data.entries.map(entry => ({ code: entry.code, position: entry.position })),
        [
            { code: 'heroDesktopEntry', position: 1 },
            { code: 'heroMobileEntry', position: 2 }
        ]
    );

    const primary = await facade.setPrimaryMediaSetEntry({
        mediaSetCode: 'heroSet',
        entryCode: 'heroDesktopEntry'
    });
    assert.strictEqual(primary.code, 'SUC_MED_00017');
    assert.strictEqual(state.entries.find(entry => entry.code === 'heroDesktopEntry').primary, true);
    assert.strictEqual(state.entries.find(entry => entry.code === 'heroMobileEntry').primary, false);

    const updated = await facade.updateMediaSetEntry({
        mediaSetCode: 'heroSet',
        entryCode: 'heroDesktopEntry',
        fallbackEntryCode: 'heroMobileEntry',
        status: 'ACTIVE'
    });
    assert.strictEqual(updated.data.fallbackEntryCode, 'heroMobileEntry');
    assert.strictEqual(updated.data.mediaCode, 'heroDesktopMedia');

    const removed = await facade.removeMediaSetEntry({
        mediaSetCode: 'heroSet',
        entryCode: 'heroMobileEntry'
    });
    assert.strictEqual(removed.code, 'SUC_MED_00015');
    assert.strictEqual(removed.data.removed, true);

    assert.throws(() => setEntryManagementService.addEntry({
        code: 'badOwnerEntry',
        mediaSetCode: 'missingSet',
        mediaCode: 'mediaOne'
    }), /Invalid media set/);
    const productBoundInput = setEntryManagementService.addEntry({
        code: 'productBoundEntry',
        mediaSetCode: 'heroSet',
        mediaCode: 'mediaOne',
        ownerModule: 'product',
        ownerCode: 'sku-1'
    });
    assert.strictEqual(productBoundInput.code, 'productBoundEntry');
    assert.strictEqual(productBoundInput.ownerModule, undefined);
    assert.strictEqual(productBoundInput.ownerCode, undefined);

    assert(
        !state.entries.some(entry => Object.prototype.hasOwnProperty.call(entry, 'ownerModule')),
        'media set entries must not persist Product/CMS owner mutation fields'
    );

    console.log('nMedia media set entry management contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
