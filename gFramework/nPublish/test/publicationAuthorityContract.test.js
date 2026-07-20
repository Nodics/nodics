/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** Verifies the generic nPublish authority contract remains domain-neutral and non-duplicative. */
const assert = require('assert');
const properties = require('../config/properties');
const schemas = require('../src/schemas/schemas');
const states = require('../src/utils/enums').PublicationState;
assert(schemas.publish.publicationRequest.model);
assert(schemas.publish.publicationAudit.model);
assert.strictEqual(schemas.publish.publicationRequest.isVersionedEnabled, false);
assert.strictEqual(schemas.publish.publicationAudit.isVersionedEnabled, false);
assert.strictEqual(schemas.publish.publicationRequest.router.enabled, false);
assert(states.definition.includes('STAGED'));
assert(states.definition.includes('ONLINE'));
assert.strictEqual(properties.publish.lifecycle.initialState, 'STAGED');
assert(properties.publish.lifecycle.transitions.APPROVED.includes('ACTIVATING'));
assert(properties.publish.lifecycle.transitions.ACTIVATING.includes('ONLINE'));
assert.strictEqual(properties.publish.providers.versionProvider, null, 'nPublish must not embed a storage provider');
assert.deepStrictEqual(properties.publish.providers.domainAdapters, {}, 'business adapters must be contributed by owning modules');
let source = require('fs').readFileSync(require('path').join(__dirname, '../src/schemas/schemas.js'), 'utf8');
assert(!/cms|wcms|catalog/i.test(source), 'generic publication schemas must not embed a business domain');
console.log('nPublish authority contract validated');
