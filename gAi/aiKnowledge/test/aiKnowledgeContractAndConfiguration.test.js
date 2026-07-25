/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
const properties = require('../config/properties').aiKnowledge;
const contracts = require('../src/schemas/apiContracts');
const service = require('../src/service/config/defaultAiKnowledgeConfigurationService');

assert.strictEqual(service.validate(properties), true);
assert.strictEqual(properties.enabled, false, 'Knowledge must be disabled until source and embedding providers are governed');
assert.strictEqual(properties.retrieval.searchAuthority, 'nSearch');
assert.strictEqual(properties.sourcePolicy.excludeTemporaryRootDocs, true);
assert.strictEqual(properties.sourcePolicy.requireExplicitModelProjection, true);
assert.strictEqual(properties.security.allowWritesFromRetrieval, false);
assert.strictEqual(contracts.contractVersion, 1);
assert.deepStrictEqual(contracts.retrievalRequest.properties.mode.enum, ['INDEXED', 'LIVE', 'HYBRID']);

const configured = JSON.parse(JSON.stringify(properties));
configured.embeddingProfile = 'projectKnowledgeEmbedding';
const snapshot = service.snapshot(configured, { embeddingProfile: 'partnerProject' });
assert(Object.isFrozen(snapshot));
assert.strictEqual(snapshot.effective.embeddingProfile, 'projectKnowledgeEmbedding');
assert.strictEqual(snapshot.origins.embeddingProfile, 'partnerProject');

const unknown = JSON.parse(JSON.stringify(properties));
unknown.searchEngine = 'parallel-engine';
assert.throws(() => service.validate(unknown), /Unknown Knowledge configuration keys/);

const unsafe = JSON.parse(JSON.stringify(properties));
unsafe.embeddingAccessToken = 'must-not-be-here';
assert.throws(() => service.validate(unsafe), /Unknown Knowledge configuration keys|forbidden inline secret/);

const weakened = JSON.parse(JSON.stringify(properties));
weakened.sourcePolicy.allowGenericSchemaDiscovery = true;
assert.throws(() => service.validate(weakened), /source-authority invariants/);

const citationLoss = JSON.parse(JSON.stringify(properties));
citationLoss.evidenceOptimization.preserveCitations = false;
assert.throws(() => service.validate(citationLoss), /preserve citations/);

console.log('Knowledge contract and configuration tests passed');
