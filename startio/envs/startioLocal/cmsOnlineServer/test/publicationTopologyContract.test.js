/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cmsOnlineServer/test/publicationTopologyContract
 * @description Verifies separate versioned Staged and non-versioned Online CMS process contracts.
 * @layer test
 * @owner cmsOnlineServer
 * @override Project topologies may use different names and endpoints while preserving role, database, versioning, and transport separation.
 */
const assert = require('assert');
const staged = require('../../cmsStagedServer/config/properties');
const online = require('../config/properties');
const stagedSchemas = require('../../cmsStagedServer/src/schemas/schemas').cms;
const onlineSchemas = require('../src/schemas/schemas').cms;
const stagedPricingSchemas = require('../../cmsStagedServer/src/schemas/schemas').pricing;
const onlinePricingSchemas = require('../src/schemas/schemas').pricing;
const stagedProductSchemas = require('../../cmsStagedServer/src/schemas/schemas').product;
const onlineProductSchemas = require('../src/schemas/schemas').product;

assert.strictEqual(staged.publishEnabled, true, 'Staged CMS must activate publish/version provider modules');
assert.strictEqual(staged.cms.publication.runtimeRole, 'STAGED');
assert.strictEqual(staged.cms.publication.target.moduleName, 'cms');
assert.strictEqual(staged.cms.publication.targetTransportProvider, 'DefaultCmsPublicationModuleTransportService');
assert(staged.activeModules.modules.includes('workflow'), 'Staged CMS must activate the existing workflow authority');
assert(staged.activeModules.modules.includes('wcms'), 'Staged CMS must activate WCMS approval definitions');

assert.strictEqual(online.publishEnabled, false, 'Online CMS must not activate version provider variants');
assert.strictEqual(online.cms.publication.runtimeRole, 'ONLINE');
assert(!online.activeModules.modules.includes('wcms'), 'Online CMS must not run authoring approval workflows');
assert.notStrictEqual(staged.database.default.mongodb.master.databaseName,
    online.database.default.mongodb.master.databaseName, 'Staged and Online must use separate database authorities');
assert.notStrictEqual(staged.servers.cmsOnline.endpoint.httpPort,
    staged.servers.default.endpoint.httpPort, 'Online target must resolve to a distinct process endpoint');

Object.keys(stagedSchemas).forEach(schemaName => {
    assert.strictEqual(stagedSchemas[schemaName].isVersionedEnabled, true,
        'Staged CMS schema must enable versioning: ' + schemaName);
});
Object.keys(onlineSchemas).forEach(schemaName => {
    assert.strictEqual(onlineSchemas[schemaName].isVersionedEnabled, false,
        'Online CMS schema must remain non-versioned: ' + schemaName);
});

assert(staged.activeModules.modules.includes('pricing'), 'Staged publishing runtime must activate Pricing');
assert(online.activeModules.modules.includes('pricing'), 'Online publishing runtime must activate Pricing');
assert.strictEqual(staged.pricing.publication.runtimeRole, 'STAGED');
assert.strictEqual(staged.pricing.publication.target.moduleName, 'pricing');
assert.strictEqual(staged.pricing.publication.target.connectionName, 'pricingOnline');
assert.strictEqual(staged.pricing.publication.targetTransportProvider, 'DefaultPricingPublicationModuleTransportService');
assert.strictEqual(online.pricing.publication.runtimeRole, 'ONLINE');
assert.notStrictEqual(staged.servers.pricingOnline.endpoint.httpPort, staged.servers.default.endpoint.httpPort,
    'Online Pricing target must use the distinct Online publishing process');
Object.keys(stagedPricingSchemas).forEach(schemaName => assert.strictEqual(stagedPricingSchemas[schemaName].isVersionedEnabled, true,
    'Staged Pricing schema must enable versioning: ' + schemaName));
Object.keys(onlinePricingSchemas).forEach(schemaName => assert.strictEqual(onlinePricingSchemas[schemaName].isVersionedEnabled, false,
    'Online Pricing schema must remain non-versioned: ' + schemaName));

assert(staged.activeModules.modules.includes('product'), 'Staged publishing runtime must activate Product');
assert(online.activeModules.modules.includes('product'), 'Online publishing runtime must activate Product');
assert.strictEqual(staged.product.publication.runtimeRole, 'STAGED');
assert.strictEqual(staged.product.publication.target.moduleName, 'product');
assert.strictEqual(staged.product.publication.target.connectionName, 'productOnline');
assert.strictEqual(staged.product.publication.targetTransportProvider, 'DefaultProductPublicationModuleTransportService');
assert.strictEqual(online.product.publication.runtimeRole, 'ONLINE');
assert.notStrictEqual(staged.servers.productOnline.endpoint.httpPort, staged.servers.default.endpoint.httpPort,
    'Online Product target must use the distinct Online publishing process');
Object.keys(stagedProductSchemas).forEach(schemaName => assert.strictEqual(stagedProductSchemas[schemaName].isVersionedEnabled, true,
    'Staged Product schema must enable versioning: ' + schemaName));
Object.keys(onlineProductSchemas).forEach(schemaName => assert.strictEqual(onlineProductSchemas[schemaName].isVersionedEnabled, false,
    'Online Product schema must remain non-versioned: ' + schemaName));

console.log('Startio CMS Staged-to-Online topology contract validated');
