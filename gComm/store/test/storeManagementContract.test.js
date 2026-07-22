/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module store/test/storeManagementContract @description Validates bounded human Store management intents and access/service-token route separation. @layer test @owner store @override Extend when management resources, permissions, or projection policy change. */
const assert = require('assert');
const properties = require('../config/properties').store;
const routers = require('../src/router/routers').store;
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError };
global.CONFIG = { get: key => key === 'store' ? properties : undefined };
global.SERVICE = {};
SERVICE.DefaultStoreEnterpriseScopeService = require('../src/service/foundation/defaultStoreEnterpriseScopeService');
const calls = [];
SERVICE.DefaultStoreService = {
    get: async input => { calls.push({ operation: 'get', input }); return { result: [{ code: 'internal', storeCode: 'electronics',
        name: 'Electronics', type: 'ONLINE', status: 'ACTIVE', enterpriseCode: 'enterpriseA', secret: 'hidden' }] }; },
    save: async input => { calls.push({ operation: 'save', input }); return input.model; },
    update: async input => { calls.push({ operation: 'update', input }); return input.model; }
};
SERVICE.DefaultStoreWarehouseAssignmentService = SERVICE.DefaultStoreService;
const management = require('../src/service/management/defaultStoreManagementService');
const human = { tokenType: 'access', principalId: 'operatorA', enterprise: { code: 'enterpriseA' } };

(async () => {
    assert.deepStrictEqual(routers.management.list.authTokenTypes, ['access']);
    assert.strictEqual(routers.management.list.permission, 'store.backoffice.read');
    assert.strictEqual(routers.management.create.permission, 'store.backoffice.manage');
    assert.deepStrictEqual(routers.reference.resolve.authTokenTypes, ['service']);
    await assert.rejects(management.list({ authData: { tokenType: 'service', enterprise: { code: 'enterpriseA' } },
        params: { resource: 'stores' }, query: {} }), error => error.code === 'ERR_STORE_00012');
    await assert.rejects(management.list({ authData: human, params: { resource: 'unknown' }, query: {} }),
        error => error.code === 'ERR_STORE_00013');
    await assert.rejects(management.list({ authData: human, params: { resource: 'stores' }, query: { unsafe: true } }),
        error => error.code === 'ERR_STORE_00013');

    let list = await management.list({ tenant: 'tenantA', authData: human, params: { resource: 'stores' }, query: { limit: 10 } });
    assert.strictEqual(list.count, 1);
    assert.strictEqual(list.items[0].secret, undefined);
    assert.strictEqual(calls[0].input.query.enterpriseCode, 'enterpriseA');
    let created = await management.create({ tenant: 'tenantA', authData: human, params: { resource: 'stores' },
        body: { code: 'forged', enterpriseCode: 'enterpriseB', storeCode: 'apparel', name: 'Apparel' } });
    assert.strictEqual(created.operation, 'CREATED');
    assert.strictEqual(calls[1].input.model.code, undefined);
    assert.strictEqual(calls[1].input.model.enterpriseCode, undefined);
    let retired = await management.retire({ tenant: 'tenantA', authData: human, params: { resource: 'stores', businessCode: 'electronics' }, body: {} });
    assert.strictEqual(retired.operation, 'RETIRED');
    assert.deepStrictEqual(calls[2].input.query, { enterpriseCode: 'enterpriseA', storeCode: 'electronics' });
    assert.deepStrictEqual(calls[2].input.model, { status: 'RETIRED' });
    console.log('Store management contract validated');
})().catch(error => { console.error(error); process.exit(1); });
