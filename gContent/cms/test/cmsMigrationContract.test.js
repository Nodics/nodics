/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** Verifies CMS migration preview, idempotency, explicit-route safety, and authority reuse. */
const assert = require('assert');
const migration = require('../src/service/migration/defaultCmsMigrationService');

global.CONFIG = { get: key => key === 'cms' ? { migration: { version: 1, rendererMappings: { 'view/home.html': 'page.home' }, routeMappings: [] } } : undefined };

let state = {
    types: [{ code: 'pageType' }, { code: 'componentType', kind: 'COMPONENT', contractVersion: 1 }],
    renderers: [{ code: 'pageType', renderer: 'view/home.html' }],
    pages: [{ code: 'home', typeCode: 'pageType' }],
    components: [{ code: 'hero', typeCode: 'componentType' }],
    associations: [{ code: 'homeHero', source: 'home', target: 'hero', index: 4 }],
    routes: []
};
let preview = migration.buildPreview(state);
assert(preview.changes.some(change => change.schema === 'cmsTypeCode' && change.to.kind === 'PAGE'));
assert(preview.changes.some(change => change.schema === 'cmsTypeCode2Renderer' && change.to.renderer === 'page.home'));
assert(preview.changes.some(change => change.schema === 'cmsComponentDetail' && change.to.slot === 'default' && change.to.index === 0));
assert(preview.manualActions.some(action => action.reason === 'ROUTE_MAPPING_REQUIRED'));
assert(!preview.changes.some(change => change.schema === 'cmsPageRoute'), 'routes must never be inferred from page codes');

let migrated = {
    types: [{ code: 'pageType', kind: 'PAGE', contractVersion: 1 }, { code: 'componentType', kind: 'COMPONENT', contractVersion: 1 }],
    renderers: [{ code: 'pageType', renderer: 'page.home', contractVersion: 1 }],
    pages: state.pages,
    components: state.components,
    associations: [{ code: 'homeHero', source: 'home', target: 'hero', slot: 'default', index: 0 }],
    routes: [{ code: 'homeRoute', site: 'site', path: '/home', locale: 'default', channel: 'web', page: 'home' }]
};
assert.strictEqual(migration.buildPreview(migrated).idempotent, true);

let customized = Object.assign({}, migration, { buildTypeChanges: () => [{ schema: 'cmsTypeCode', operation: 'UPDATE', code: 'custom', from: {}, to: { kind: 'PAGE' } }] });
assert(customized.buildPreview({ types: [], renderers: [], pages: [], components: [], associations: [], routes: [] }).changes.some(change => change.code === 'custom'));
console.log('CMS migration contract validated');
