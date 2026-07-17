/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
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

console.log('startioLocal dedicated test tenant init data validated');
