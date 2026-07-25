/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
const metadata = require('../package.json').nodics;
const schemas = require('../src/schemas/schemas').aiProviders;
const routers = require('../src/router/routers').aiProviders.aiTokenLedgerOperations;

assert.strictEqual(metadata.runtime.router, true);
assert(metadata.owns.includes('router'));
assert(metadata.owns.includes('controller'));
assert.strictEqual(schemas.aiTokenBudget.router.enabled, false);
assert.strictEqual(schemas.aiTokenReservation.router.enabled, false);
assert.strictEqual(schemas.aiTokenUsageRecord.router.enabled, false);
assert.strictEqual(schemas.aiTokenRepairRun.router.enabled, false);
assert.strictEqual(schemas.aiTokenRepairFinding.router.enabled, false);
assert.strictEqual(schemas.aiTokenUsageRecord.indexes.individual.reservationCode.options.unique, true);
assert.strictEqual(routers.budgets.permission, 'ai.ledger.read');
assert.strictEqual(routers.providerDiagnostics.permission, 'ai.ledger.read');
assert.strictEqual(routers.providerDiagnostics.controller, 'DefaultAiProviderOperationsController');
assert.strictEqual(routers.reservations.permission, 'ai.ledger.read');
assert.strictEqual(routers.usage.permission, 'ai.ledger.read');
assert.strictEqual(routers.updateBudget.permission, 'ai.ledger.manage');
assert.strictEqual(routers.expire.apiExposure, 'moduleInternal');
assert.strictEqual(routers.expire.permissionConfig, 'authSecurity.internalToken.routePermission');
assert.strictEqual(routers.repairScan.permissionConfig, 'authSecurity.internalToken.routePermission');
assert.strictEqual(routers.reconcileUncertain.permissionConfig, 'authSecurity.internalToken.routePermission');
assert.strictEqual(routers.applyRepairFinding.permissionConfig, 'authSecurity.internalToken.routePermission');
assert.strictEqual(routers.approveRepairFinding.permission, 'ai.ledger.repair.approve');
assert.strictEqual(routers.repairRuns.permission, 'ai.ledger.read');
assert.strictEqual(routers.repairFindings.permission, 'ai.ledger.read');
assert.strictEqual(routers.metrics.permission, 'ai.ledger.read');
Object.values(routers).forEach(router => assert.strictEqual(router.secured, true));

console.log('AI token ledger API and persistence boundary validated');
