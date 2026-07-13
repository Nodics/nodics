/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const tenantHeader = require(path.join(repoRoot, 'kickoff/kickoffEnvs/kickoffLocal/data/init/headers/enterprise/kickoffLocalTestTenantsHeader'));
const enterpriseHeader = require(path.join(repoRoot, 'kickoff/kickoffEnvs/kickoffLocal/data/init/headers/enterprise/kickoffLocalTestEnterpriseHeader'));
const tenants = require(path.join(repoRoot, 'kickoff/kickoffEnvs/kickoffLocal/data/init/data/enterprise/kickoffLocalTestTenantsData'));
const enterprises = require(path.join(repoRoot, 'kickoff/kickoffEnvs/kickoffLocal/data/init/data/enterprise/kickoffLocalTestEnterpriseData'));

// @nodics-capability-behavior @nodics-area testing
assert.strictEqual(tenantHeader.profile.kickoffLocalTestTenants.options.owningModule, 'kickoffLocal');
assert.strictEqual(tenantHeader.profile.kickoffLocalTestTenants.options.schemaName, 'tenant');
assert.deepStrictEqual(tenantHeader.profile.kickoffLocalTestTenants.options.tenants, ['default']);
assert.strictEqual(tenantHeader.profile.kickoffLocalTestTenants.options.dataFilePrefix, 'kickoffLocalTestTenantsData');

assert.strictEqual(enterpriseHeader.profile.kickoffLocalTestEnterprise.options.owningModule, 'kickoffLocal');
assert.strictEqual(enterpriseHeader.profile.kickoffLocalTestEnterprise.options.schemaName, 'enterprise');
assert.deepStrictEqual(enterpriseHeader.profile.kickoffLocalTestEnterprise.options.tenants, ['default']);
assert.strictEqual(enterpriseHeader.profile.kickoffLocalTestEnterprise.options.dataFilePrefix, 'kickoffLocalTestEnterpriseData');

assert.strictEqual(tenants.record0.code, 'nodicsTest');
assert.strictEqual(tenants.record0.active, true);

assert.strictEqual(enterprises.record0.code, 'nodicsTest');
assert.strictEqual(enterprises.record0.active, true);
assert.strictEqual(enterprises.record0.tenant, 'nodicsTest:true');

console.log('kickoffLocal dedicated test tenant init data validated');
