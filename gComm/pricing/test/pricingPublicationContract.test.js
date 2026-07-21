/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert'), all = require('../config/properties'), properties = all.pricing;
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError }; global.CONFIG = { get: key => key === 'pricing' ? properties : key === 'publishEnabled' ? false : undefined }; global.SERVICE = {};
assert.strictEqual(all.publish.providers.domainAdapters.pricing, 'DefaultPricingPublicationAdapterService'); assert.strictEqual(all.publish.providers.versionProviders.pricing, 'DefaultPricingPublicationVersionProviderService');
const schemas = require('../src/schemas/schemas').pricing; assert.strictEqual(schemas.pricePublicationManifest.router.enabled, false); assert.strictEqual(schemas.priceOnlinePointer.router.enabled, false);
const adapter = require('../src/service/publication/defaultPricingPublicationAdapterService'); assert.deepStrictEqual(adapter.latestByCode([{ code: 'a', versionId: 1 }, { code: 'a', versionId: 3 }, { code: 'b', versionId: 2 }]).map(item => item.versionId), [3, 2]);
let manifest = { code: 'release_1', dependencies: [], snapshot: { contractVersion: 1, enterpriseCode: 'entA', priceListCode: 'retail', records: [] } };
SERVICE.DefaultPricePublicationManifestService = { get: async () => ({ result: [] }), save: async request => ({ result: [request.model] }) };
const manifests = require('../src/service/publication/defaultPricingPublicationManifestService'); SERVICE.DefaultPricingPublicationManifestService = manifests; manifest.contentHash = manifests.hash(manifest.dependencies, manifest.snapshot); assert.strictEqual(manifests.verify(manifest), true); assert.throws(() => manifests.verify(Object.assign({}, manifest, { contentHash: 'tampered' })), error => error.code === 'ERR_PRICE_00058');
const provider = require('../src/service/publication/defaultPricingPublicationVersionProviderService'); properties.publication.runtimeRole = 'ONLINE'; assert.throws(() => provider.assertStaged(), error => error.code === 'ERR_PRICE_00052'); properties.publication.runtimeRole = 'UNASSIGNED';
const routers = require('../src/router/routers').pricing; ['deploy', 'status', 'rollback'].forEach(key => assert.strictEqual(routers.publicationTarget[key].permissionConfig, 'authSecurity.internalToken.routePermission'));
console.log('Pricing publication boundary contract validated');
