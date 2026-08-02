/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const registry = require('../src/schemas/schemas');
const repositorySource = fs.readFileSync(path.resolve(__dirname,
    '../src/service/token/defaultAiTokenLedgerRepositoryService.js'), 'utf8');

const expected = [
    'aiTokenBudget',
    'aiTokenReservation',
    'aiTokenUsageRecord',
    'aiTokenRepairRun',
    'aiTokenRepairFinding'
];

assert.deepStrictEqual(Object.keys(registry), ['aiProviders'],
    'AI schemas must be contributed under their owning Nodics module');
expected.forEach(schemaName => {
    const schema = registry.aiProviders[schemaName];
    assert(schema, 'Missing aiProviders-owned schema: ' + schemaName);
    assert.strictEqual(schema.model, true);
    assert.strictEqual(schema.service.enabled, true);
    const serviceName = 'Default' + schemaName.charAt(0).toUpperCase() +
        schemaName.slice(1) + 'Service.js';
    assert(fs.existsSync(path.resolve(__dirname,
        '../../../gFramework/nService/src/service/gen', serviceName)),
    'Missing generated service for aiProviders schema: ' + serviceName);
});

assert.strictEqual(registry.aiProviders.aiTokenBudget.transaction.enabled, true);
assert.strictEqual(registry.aiProviders.aiTokenBudget.transaction.sideEffects, 'none');
assert.strictEqual(registry.aiProviders.aiTokenBudget.cache.enabled, false);
assert.strictEqual(registry.aiProviders.aiTokenBudget.event.enabled, false);
assert(!/require\s*\(\s*['"](?:mongodb|mongoose)['"]\s*\)/.test(repositorySource),
    'AI ledger persistence orchestration must not import a database driver');
assert(!repositorySource.includes('Database-specific replacements'),
    'AI repository extension must not claim database-adapter ownership');
[
    'DefaultAiTokenBudgetService',
    'DefaultAiTokenReservationService',
    'DefaultAiTokenUsageRecordService'
].forEach(serviceName => {
    assert(repositorySource.includes('SERVICE.' + serviceName),
        'AI repository must use generated Nodics service: ' + serviceName);
});

console.log('AI schema framework ownership and generated-service contract validated');
