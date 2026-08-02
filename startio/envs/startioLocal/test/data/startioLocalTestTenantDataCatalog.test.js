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

/**
 * @module startio/envs/startioLocal/test/data/startioLocalTestTenantDataCatalog
 * @description Verifies startioLocal environment-owned init data headers and records for dedicated test tenant bootstrap.
 * @layer test
 * @owner startioLocal
 * @override Environment modules may add focused data-catalog tests beside this file while preserving init-data ownership.
 */

const repoRoot = path.resolve(__dirname, '../../../../..');
const tenantHeader = require(path.join(repoRoot, 'startio/envs/startioLocal/data/init/headers/enterprise/startioLocalTestTenantsHeader'));
const enterpriseHeader = require(path.join(repoRoot, 'startio/envs/startioLocal/data/init/headers/enterprise/startioLocalTestEnterpriseHeader'));
const tenants = require(path.join(repoRoot, 'startio/envs/startioLocal/data/init/data/enterprise/startioLocalTestTenantsData'));
const enterprises = require(path.join(repoRoot, 'startio/envs/startioLocal/data/init/data/enterprise/startioLocalTestEnterpriseData'));
const assistantPolicy = require(path.join(repoRoot, 'gAi/aiAssistant/data/init/data/assistant/defaultAssistantToolPolicyData'));

// @nodics-capability-behavior @nodics-area testing
assert.strictEqual(tenantHeader.profile.startioLocalTestTenants.options.owningModule, 'startioLocal');
assert.strictEqual(tenantHeader.profile.startioLocalTestTenants.options.schemaName, 'tenant');
assert.deepStrictEqual(tenantHeader.profile.startioLocalTestTenants.options.tenants, ['default']);
assert.strictEqual(tenantHeader.profile.startioLocalTestTenants.options.dataFilePrefix, 'startioLocalTestTenantsData');

assert.strictEqual(enterpriseHeader.profile.startioLocalTestEnterprise.options.owningModule, 'startioLocal');
assert.strictEqual(enterpriseHeader.profile.startioLocalTestEnterprise.options.schemaName, 'enterprise');
assert.deepStrictEqual(enterpriseHeader.profile.startioLocalTestEnterprise.options.tenants, ['default']);
assert.strictEqual(enterpriseHeader.profile.startioLocalTestEnterprise.options.dataFilePrefix, 'startioLocalTestEnterpriseData');

assert.strictEqual(tenants.record0.code, 'nodicsTest');
assert.strictEqual(tenants.record0.active, true);

assert.strictEqual(enterprises.record0.code, 'nodicsTest');
assert.strictEqual(enterprises.record0.active, true);
assert.strictEqual(enterprises.record0.tenant, 'nodicsTest:true');

// @nodics-capability-behavior @nodics-area runtime-governance
assert.strictEqual(assistantPolicy.record0.policyCode, 'axisAssistantReadOnly');
assert.strictEqual(assistantPolicy.record0.enabled, true);
assert.strictEqual(
    fs.existsSync(path.join(repoRoot, 'startio/envs/startioLocal/monoServer/data/init/manifest.json')),
    false,
    'monoServer must not duplicate owner-module Assistant policy init data'
);

console.log('startioLocal dedicated test tenant init data validated');
