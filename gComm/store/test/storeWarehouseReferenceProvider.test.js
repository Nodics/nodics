/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** Validates consolidated and modular Warehouse reference resolution, security headers, boundaries, and fail-closed behavior. */
const assert = require('assert');
const properties = require('../config/properties').store;
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError };
global.CONFIG = { get: key => key === 'store' ? properties : key === 'defaultContentType' ? 'application/json' : undefined };
global.SERVICE = {};
global.NODICS = { getInternalAuthToken: tenant => tenant === 'tenantA' ? 'service-token' : undefined };
const scope = require('../src/service/foundation/defaultStoreEnterpriseScopeService');
const provider = require('../src/service/reference/defaultStoreWarehouseReferenceProviderService');
SERVICE.DefaultStoreEnterpriseScopeService = scope;
const request = { tenant: 'tenantA', authData: { enterprise: { code: 'enterpriseA' } } };

(async () => {
    SERVICE.DefaultWarehouseService = { get: async () => ({ result: [{ enterpriseCode: 'enterpriseA', warehouseCode: 'central', status: 'ACTIVE' }] }) };
    let local = await provider.resolve(request, 'central');
    assert.strictEqual(local.warehouseCode, 'central');

    SERVICE.DefaultWarehouseService = undefined;
    let captured;
    SERVICE.DefaultModuleService = {
        buildRequest: options => { captured = options; return options; },
        fetch: async () => ({ code: 'SUC_INV_00001', data: { enterpriseCode: 'enterpriseA', warehouseCode: 'central', status: 'ACTIVE' } })
    };
    let remote = await provider.resolve(request, 'central');
    assert.strictEqual(remote.warehouseCode, 'central');
    assert.strictEqual(captured.moduleName, 'inventory');
    assert.strictEqual(captured.methodName, 'POST');
    assert.strictEqual(captured.header.Authorization, 'Bearer service-token');
    assert.strictEqual(captured.header['x-enterprise-code'], 'enterpriseA');
    assert.strictEqual(captured.requestBody.warehouseCode, 'central');

    SERVICE.DefaultModuleService.fetch = async () => ({ data: { enterpriseCode: 'enterpriseB', warehouseCode: 'central', status: 'ACTIVE' } });
    await assert.rejects(provider.resolve(request, 'central'), error => error.code === 'ERR_STORE_00005');
    SERVICE.DefaultModuleService.fetch = async () => { throw new Error('timeout'); };
    await assert.rejects(provider.resolve(request, 'central'), error => error.code === 'ERR_STORE_00005');
    NODICS.getInternalAuthToken = () => undefined;
    await assert.rejects(provider.resolve(request, 'central'), error => error.code === 'ERR_STORE_00005');
    console.log('Store Warehouse reference provider validated');
})().catch(error => { console.error(error); process.exit(1); });
