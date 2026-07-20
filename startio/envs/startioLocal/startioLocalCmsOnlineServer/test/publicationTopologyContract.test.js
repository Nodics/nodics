/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module startioLocalCmsOnlineServer/test/publicationTopologyContract
 * @description Verifies separate versioned Staged and non-versioned Online CMS process contracts.
 * @layer test
 * @owner startioLocalCmsOnlineServer
 * @override Project topologies may use different names and endpoints while preserving role, database, versioning, and transport separation.
 */
const assert = require('assert');
const staged = require('../../startioLocalCmsServer/config/properties');
const online = require('../config/properties');
const stagedSchemas = require('../../startioLocalCmsServer/src/schemas/schemas').cms;
const onlineSchemas = require('../src/schemas/schemas').cms;

assert.strictEqual(staged.publishEnabled, true, 'Staged CMS must activate publish/version provider modules');
assert.strictEqual(staged.cms.publication.runtimeRole, 'STAGED');
assert.strictEqual(staged.cms.publication.target.moduleName, 'cmsOnline');
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

console.log('Startio CMS Staged-to-Online topology contract validated');
