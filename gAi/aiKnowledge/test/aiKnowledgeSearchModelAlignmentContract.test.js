/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiKnowledge/test/AiKnowledgeSearchModelAlignmentContract
 * @description Prevents database, search, and active-version authority paths from diverging.
 * @layer test
 * @owner aiKnowledge
 */
const assert = require('assert');
const schemas = require('../src/schemas/schemas').aiKnowledge;
const indexes = require('../src/search/indexes').aiKnowledge;
const configuration = require('../config/properties').aiKnowledge;
const searchRequestService = require(
    '../../../gFramework/nSearch/search/src/service/query/defaultSearchRequestService'
);

assert.strictEqual(schemas.knowledgeChunk.model, true);
assert.strictEqual(schemas.knowledgeChunk.search.enabled, true);
assert.strictEqual(indexes.knowledgeChunk.schemaName, 'knowledgeChunk');
assert.deepStrictEqual(indexes.knowledgeChunk.capabilities.modes, ['LEXICAL']);
assert.strictEqual(configuration.retrieval.searchAuthority, 'nSearch');
assert.strictEqual(configuration.retrieval.defaultMode, 'INDEXED');
assert.deepStrictEqual(configuration.retrieval.allowedSearchModes, ['LEXICAL']);

const normalized = searchRequestService.normalize({
    mode: 'LEXICAL',
    text: 'provider gateway',
    filters: { tenantCode: 'default', indexVersion: 'v1' },
    size: 5
}, indexes.knowledgeChunk);
assert.strictEqual(normalized.mode, 'LEXICAL');
assert.strictEqual(normalized.filters.indexVersion, 'v1');
assert.deepStrictEqual(normalized.fields, ['title', 'content', 'section']);
assert.throws(() => searchRequestService.normalize({
    mode: 'VECTOR',
    vector: [0.1, 0.2]
}, indexes.knowledgeChunk), /not supported/);
assert.throws(() => searchRequestService.normalize({
    mode: 'LEXICAL',
    text: ''
}, indexes.knowledgeChunk), /require text/);

console.log('AI Knowledge item and search model alignment validated');
