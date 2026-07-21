/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** Validates Stock Sourcing intent routing, service-token security, bounds, safe projection, and controller delegation. */
const assert = require('assert');
const route = require('../src/router/routers').inventory.stockSourcingIntent.evaluate;
const inventory = require('../config/properties').inventory;
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError };
global.CONFIG = { get: key => key === 'inventory' ? inventory : undefined };
global.SERVICE = {};
global.FACADE = {};
SERVICE.DefaultInventoryEnterpriseScopeService = require('../src/service/foundation/defaultInventoryEnterpriseScopeService');
const intent = require('../src/service/sourcing/defaultStockSourcingIntentService');
const controller = require('../src/controller/defaultStockSourcingIntentController');

assert.strictEqual(route.secured, true);
assert.strictEqual(route.permissionConfig, 'authSecurity.internalToken.routePermission');
assert.strictEqual(route.apiExposure, 'moduleInternal');
assert.strictEqual(route.method, 'POST');
assert.strictEqual(route.key, '/references/stock-sourcing/evaluate');
assert.strictEqual(route.requestBody.content['application/json'].schema.additionalProperties, false);

const serviceAuth = { tokenType: 'service', enterprise: { code: 'enterpriseA' } };
SERVICE.DefaultStockSourcingCacheService = { evaluate: async request => ({ enterpriseCode: request.authData.enterprise.code,
    poolCodes: ['uae'], matchedRuleCodes: ['uae-web'], evaluatedAt: '2026-07-21T00:00:00.000Z', privatePolicy: { secret: true } }) };

(async () => {
    let response = await intent.evaluate({ tenant: 'tenantA', authData: serviceAuth, correlationId: 'correlation-1',
        body: { context: { countryCode: 'AE', channelCode: ['WEB', 'APP'] }, at: '2026-07-21T00:00:00.000Z' } });
    assert.strictEqual(response.code, 'SUC_INV_00002');
    assert.deepStrictEqual(Object.keys(response.data).sort(), ['correlationId', 'enterpriseCode', 'evaluatedAt', 'matchedRuleCodes', 'poolCodes'].sort());
    assert.strictEqual(response.data.privatePolicy, undefined); assert.strictEqual(response.data.correlationId, 'correlation-1');

    await assert.rejects(intent.evaluate({ authData: { tokenType: 'access', enterprise: { code: 'enterpriseA' } }, body: { context: {} } }),
        error => error.code === 'ERR_INV_00026');
    await assert.rejects(intent.evaluate({ authData: serviceAuth, body: { context: { unknown: 'x' } } }),
        error => error.code === 'ERR_INV_00027');
    await assert.rejects(intent.evaluate({ authData: serviceAuth, body: { context: { channelCode: new Array(51).fill('WEB') } } }),
        error => error.code === 'ERR_INV_00027');
    await assert.rejects(intent.evaluate({ authData: serviceAuth, body: { context: {}, at: 'invalid' } }),
        error => error.code === 'ERR_INV_00027');
    await assert.rejects(intent.evaluate({ authData: { tokenType: 'service' }, body: { context: {} } }),
        error => error.code === 'ERR_INV_00001');

    inventory.stockSourcingIntent.maximumResultCount = 0;
    SERVICE.DefaultStockSourcingCacheService.evaluate = async () => ({ enterpriseCode: 'enterpriseA', poolCodes: ['one'],
        matchedRuleCodes: [], evaluatedAt: '2026-07-21T00:00:00.000Z' });
    inventory.stockSourcingIntent.maximumResultCount = 0;
    let original = intent.policy;
    intent.policy = () => Object.assign({}, inventory.stockSourcingIntent, { maximumResultCount: -1 });
    await assert.rejects(intent.evaluate({ authData: serviceAuth, body: { context: {} } }), error => error.code === 'ERR_INV_00028');
    intent.policy = original; inventory.stockSourcingIntent.maximumResultCount = 100;

    FACADE.DefaultStockSourcingIntentFacade = { evaluate: async request => ({ code: 'SUC_INV_00002', data: request.body }) };
    let delegated = await controller.evaluate({ body: { context: {} } }); assert.strictEqual(delegated.code, 'SUC_INV_00002');
    console.log('Inventory Stock Sourcing intent contract validated');
})().catch(error => { console.error(error); process.exit(1); });
