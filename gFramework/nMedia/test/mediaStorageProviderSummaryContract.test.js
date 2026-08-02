/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nMedia/test/mediaStorageProviderSummaryContract
 * @description Validates safe provider summary metadata for Media Management operations.
 * @layer test
 * @owner nMedia
 * @override Provider/customer modules may publish richer safe health details without exposing secrets or raw paths.
 */

const assert = require('assert');

const properties = require('../config/properties');
const facade = require('../src/facade/storage/defaultMediaStorageFacade');
const registry = require('../src/service/storage/defaultMediaStorageProviderRegistryService');
const policyService = require('../src/service/storage/defaultMediaStoragePolicyService');
const localProvider = require('../src/service/storage/provider/defaultLocalMediaStorageProviderService');

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

global.CONFIG = {
    media: clone(properties.media),
    get: function (key) {
        if (key === 'media') {
            return this.media;
        }
        return undefined;
    }
};
global.SERVICE = {
    DefaultMediaStoragePolicyService: policyService,
    DefaultMediaStorageProviderRegistryService: registry,
    DefaultLocalMediaStorageProviderService: localProvider
};

(async function () {
    const response = await facade.summarizeStorageProviders({});
    assert.strictEqual(response.code, 'SUC_MED_00018');
    assert.strictEqual(response.data.activeProviderCode, 'local');
    assert.strictEqual(response.data.keyStrategyName, 'tenantEnterpriseSchemaDateMedia');
    assert.strictEqual(response.data.delivery.enabled, true);
    assert.strictEqual(response.data.delivery.publicAccessEnabled, true);

    const local = response.data.providers.find(provider => provider.providerCode === 'local');
    assert(local, 'local provider summary must be present');
    assert.strictEqual(local.providerType, 'LOCAL_FILESYSTEM');
    assert.strictEqual(local.enabled, true);
    assert.strictEqual(local.active, true);
    assert.strictEqual(local.health.status, 'AVAILABLE');
    assert.strictEqual(local.health.pathExposed, false);
    assert.strictEqual(local.rawPathsHidden, true);
    assert.strictEqual(local.secretsHidden, true);

    const serialized = JSON.stringify(response.data);
    assert(!serialized.includes('temp/media'), 'provider summary must not expose fallback path');
    assert(!serialized.includes('/mnt/nodics-media'), 'provider summary must not expose NAS path');
    assert(!serialized.includes('bucket'), 'provider summary must not expose bucket fields');
    assert(!serialized.includes('baseUrl'), 'provider summary must not expose provider URL config');

    console.log('nMedia storage provider summary contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
