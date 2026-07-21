/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** Validates Stock Pool schemas, enterprise identity, Warehouse membership, lifecycle, dependency, boundary, and customization contracts. */
const assert = require('assert');
const inventory = require('../config/properties').inventory;
const schemas = require('../src/schemas/schemas').inventory;
const interceptors = require('../src/interceptors/interceptors');
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError };
global.CONFIG = { get: key => key === 'inventory' ? inventory : undefined };
global.SERVICE = {};
SERVICE.DefaultInventoryEnterpriseScopeService = require('../src/service/foundation/defaultInventoryEnterpriseScopeService');
const poolService = require('../src/service/pool/defaultStockPoolFoundationService');
const memberService = require('../src/service/pool/defaultStockPoolMemberFoundationService');

['stockPool', 'stockPoolMember'].forEach(name => {
    assert.strictEqual(schemas[name].super, 'base'); assert.strictEqual(schemas[name].router.enabled, false);
});
['stockPoolPreSave', 'stockPoolPreGet', 'stockPoolPreUpdate', 'stockPoolPreRemove',
    'stockPoolMemberPreSave', 'stockPoolMemberPreGet', 'stockPoolMemberPreUpdate', 'stockPoolMemberPreRemove']
    .forEach(name => assert(interceptors[name]));

let pools = []; let members = [];
const matches = (item, query) => Object.keys(query || {}).every(key => query[key] && query[key].$ne !== undefined ? item[key] !== query[key].$ne : item[key] === query[key]);
SERVICE.DefaultStockPoolService = { get: async request => ({ result: pools.filter(item => matches(item, request.query)) }) };
SERVICE.DefaultStockPoolMemberService = { get: async request => ({ result: members.filter(item => matches(item, request.query)) }) };
SERVICE.DefaultWarehouseService = { get: async request => ({ result: request.query.warehouseCode === 'central' ? [{
    enterpriseCode: request.query.enterpriseCode, warehouseCode: 'central', status: 'ACTIVE'
}] : [] }) };
const authData = { enterprise: { code: 'enterpriseA' } };

(async () => {
    let poolRequest = { tenant: 'tenantA', authData: authData, model: { poolCode: 'default', name: 'Default Pool' } };
    await poolService.preparePoolSave(poolRequest);
    assert.strictEqual(poolRequest.model.code, 'enterpriseA::stockPool::default');
    assert.strictEqual(poolRequest.model.type, 'GENERAL'); assert.strictEqual(poolRequest.model.status, 'DRAFT');
    pools.push(Object.assign({}, poolRequest.model));

    let memberRequest = { tenant: 'tenantA', authData: authData, model: { poolCode: 'default', warehouseCode: 'central' } };
    await memberService.prepareMemberSave(memberRequest);
    assert.strictEqual(memberRequest.model.code, 'enterpriseA::stockPoolMember::default::central');
    assert.strictEqual(memberRequest.model.priority, 100); members.push(Object.assign({}, memberRequest.model));

    assert.throws(() => poolService.validateTransition('DRAFT', 'SUSPENDED'), error => error.code === 'ERR_INV_00017');
    await assert.rejects(memberService.prepareMemberSave({ tenant: 'tenantA', authData: authData,
        model: { poolCode: 'default', warehouseCode: 'missing' } }), error => error.code === 'ERR_INV_00019');

    await assert.rejects(memberService.prepareMemberSave({ tenant: 'tenantA', authData: authData,
        model: { poolCode: 'default', warehouseCode: 'central', status: 'ACTIVE' } }), error => error.code === 'ERR_INV_00019');
    pools[0].status = 'ACTIVE';
    await memberService.prepareMemberUpdate({ tenant: 'tenantA', authData: authData,
        query: { code: members[0].code }, model: { status: 'ACTIVE', priority: 10 } });
    members[0].status = 'ACTIVE'; members[0].priority = 10;

    await assert.rejects(memberService.prepareMemberUpdate({ tenant: 'tenantA', authData: authData,
        query: { code: members[0].code }, model: { warehouseCode: 'other' } }), error => error.code === 'ERR_INV_00018');
    await assert.rejects(memberService.prepareMemberUpdate({ tenant: 'tenantA', authData: authData,
        query: { code: members[0].code }, model: { priority: inventory.stockPoolMember.maximumPriority + 1 } }), error => error.code === 'ERR_INV_00016');
    await assert.rejects(poolService.preparePoolUpdate({ tenant: 'tenantA', authData: authData,
        query: { code: pools[0].code }, model: { status: 'RETIRED' } }), error => error.code === 'ERR_INV_00019');

    members[0].status = 'RETIRED';
    await poolService.preparePoolUpdate({ tenant: 'tenantA', authData: authData,
        query: { code: pools[0].code }, model: { status: 'RETIRED' } });

    inventory.stockPool.types.push('PROJECT_CUSTOM');
    poolService.validateModel({ type: 'PROJECT_CUSTOM', status: 'DRAFT' });
    inventory.stockPool.types.pop();
    assert.throws(() => poolService.preparePoolSave({ tenant: 'tenantA', authData: authData,
        model: { enterpriseCode: 'enterpriseB', poolCode: 'bad', name: 'Bad' } }), error => error.code === 'ERR_INV_00002');
    await assert.rejects(poolService.rejectHardDelete(), error => error.code === 'ERR_INV_00020');
    await assert.rejects(memberService.rejectHardDelete(), error => error.code === 'ERR_INV_00020');
    console.log('Inventory Stock Pool foundation validated');
})().catch(error => { console.error(error); process.exit(1); });
