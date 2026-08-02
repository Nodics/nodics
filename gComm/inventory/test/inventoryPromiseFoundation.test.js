/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** Validates Inventory Promise schema, preorder/backorder/overbooking policy, payment hooks, operational projection, and persistence guards. */
const assert = require('assert');
const inventoryProperties = require('../config/properties').inventory;
const schemas = require('../src/schemas/schemas').inventory;
const interceptors = require('../src/interceptors/interceptors');
const operationsService = require('../src/service/operations/defaultInventoryOperationsService');
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError };
global.CONFIG = { get: key => key === 'inventory' ? inventoryProperties : key === 'units' ? { maximumScale: 18 } : undefined };
global.SERVICE = {};
SERVICE.DefaultInventoryEnterpriseScopeService = require('../src/service/foundation/defaultInventoryEnterpriseScopeService');
SERVICE.DefaultExactUnitsService = require('../../../gCore/units/src/service/exact/defaultExactUnitsService');
const promiseService = require('../src/service/promise/defaultInventoryPromisePolicyService');
const promiseOrchestrationService = require('../src/service/promise/defaultInventoryPromiseReservationOrchestrationService');
SERVICE.DefaultInventoryPromisePolicyService = promiseService;
SERVICE.DefaultInventoryPromiseReservationOrchestrationService = promiseOrchestrationService;
const authData = { tokenType: 'service', enterprise: { code: 'enterpriseA' } };
let promises = []; let reservations = [];
const match = (item, query) => Object.keys(query || {}).every(key => item[key] === query[key]);
SERVICE.DefaultInventoryPromiseService = {
    get: async request => ({ result: promises.filter(item => match(item, request.query)) }),
    update: async request => {
        let item = promises.find(value => match(value, request.query));
        if (!item) return { result: { modifiedCount: 0 } };
        Object.assign(item, request.model);
        return { result: { modifiedCount: 1 } };
    }
};
SERVICE.DefaultInventoryPromiseReservationService = {
    get: async request => ({ result: reservations.filter(item => match(item, request.query)) }),
    save: async request => {
        let model = await promiseService.preparePromiseReservationSave(request);
        reservations.push(JSON.parse(JSON.stringify(model)));
        return { result: [model] };
    },
    update: async request => {
        let item = reservations.find(value => match(value, request.query));
        if (!item) return { result: { modifiedCount: 0 } };
        Object.assign(item, request.model);
        return { result: { modifiedCount: 1 } };
    }
};

const basePromise = Object.freeze({
    enterpriseCode: 'enterpriseA', promiseCode: 'phone-preorder', promiseType: 'PRE_ORDER',
    itemType: 'SKU', itemCode: 'phone', unitCode: 'EA', scale: 0,
    promisedQuantity: '100', reservedQuantity: '100', overbookingAllowed: true,
    overbookingQuantity: '20', overbookedQuantity: '19', commercialPolicyCode: 'preorderAdvancePolicy',
    state: 'ACTIVE'
});

(async () => {
    assert(schemas.inventoryPromise, 'Inventory Promise schema must be implemented');
    assert(schemas.inventoryPromiseReservation, 'Inventory Promise Reservation schema must be implemented');
    assert.strictEqual(schemas.inventoryPromise.service.enabled, true);
    assert.strictEqual(schemas.inventoryPromise.router.enabled, false);
    assert.strictEqual(schemas.inventoryPromiseReservation.service.enabled, true);
    assert.strictEqual(schemas.inventoryPromiseReservation.router.enabled, false);
    assert.strictEqual(schemas.inventoryPromiseReservation.refSchema.promiseCode.schema, 'inventoryPromise');
    assert.strictEqual(schemas.inventoryPromiseReservation.refSchema.promiseCode.property, 'promiseCode');
    assert.strictEqual(schemas.inventoryPromiseReservation.refSchema.promiseCode.onDelete, 'restrict');
    ['STOCK', 'PRE_ORDER', 'BACKORDER', 'PERPETUAL', 'DROP_SHIP', 'MADE_TO_ORDER', 'DIGITAL'].forEach(type => {
        assert(inventoryProperties.inventoryPromise.promiseTypes.includes(type), type + ' must be configuration-backed');
    });
    assert.strictEqual(inventoryProperties.inventoryPromise.overbookingPaymentRequirement, 'ADVANCE');
    assert.strictEqual(interceptors.inventoryPromisePreGet.handler, 'DefaultInventoryEnterpriseScopeService.scopeQuery');
    assert.strictEqual(interceptors.inventoryPromisePreSave.handler, 'DefaultInventoryPromisePolicyService.preparePromiseSave');
    assert.strictEqual(interceptors.inventoryPromisePreRemove.handler, 'DefaultInventoryPromisePolicyService.rejectDelete');
    assert.strictEqual(interceptors.inventoryPromiseReservationPreSave.handler, 'DefaultInventoryPromisePolicyService.preparePromiseReservationSave');

    let standard = promiseService.evaluatePromiseBucket(Object.assign({}, basePromise, { reservedQuantity: '99', overbookedQuantity: '0' }), '1');
    assert.strictEqual(standard.bucket, 'STANDARD');
    assert.strictEqual(standard.paymentRequirement, 'NONE');
    let overbooked = promiseService.evaluatePromiseBucket(basePromise, '1');
    assert.strictEqual(overbooked.bucket, 'OVERBOOKED');
    assert.strictEqual(overbooked.paymentRequirement, 'ADVANCE');
    assert.strictEqual(overbooked.commercialPolicyCode, 'preorderAdvancePolicy');
    await assert.rejects(() => Promise.resolve().then(() => promiseService.evaluatePromiseBucket(basePromise, '2')), error => error.code === 'ERR_INV_00047');
    await assert.rejects(() => Promise.resolve().then(() => promiseService.evaluatePromiseBucket(basePromise, '1.5')), error => error.code === 'ERR_INV_00047');
    await assert.rejects(() => Promise.resolve().then(() => promiseService.validatePromise(Object.assign({}, basePromise, { overbookedQuantity: '21' }))), error => error.code === 'ERR_INV_00047');
    await assert.rejects(() => Promise.resolve().then(() => promiseService.validatePromise(Object.assign({}, basePromise, { overbookingAllowed: false, overbookedQuantity: '1' }))), error => error.code === 'ERR_INV_00047');
    let reservation = promiseService.buildReservationDraft(basePromise, {
        idempotencyKey: 'cart1-line1-overbook-1', demandType: 'CART', demandCode: 'cart1', demandLineCode: 'line1',
        checkoutAllocationCode: 'deliveryAllocation1', quantity: '1', reasonCode: 'PREORDER_OVERBOOK'
    });
    assert.strictEqual(reservation.promiseBucket, 'OVERBOOKED');
    assert.strictEqual(reservation.paymentRequirement, 'ADVANCE');
    assert.strictEqual(reservation.commercialPolicyCode, 'preorderAdvancePolicy');
    assert.strictEqual(reservation.checkoutAllocationCode, 'deliveryAllocation1');
    await assert.rejects(() => Promise.resolve().then(() => promiseService.validateReservationAgainstPromise(basePromise, Object.assign({}, reservation, { paymentRequirement: 'NONE' }))), error => error.code === 'ERR_INV_00047');

    let prepared = await promiseService.preparePromiseSave({ tenant: 'tenantA', authData, model: Object.assign({}, basePromise) });
    assert.strictEqual(prepared.enterpriseCode, 'enterpriseA');
    assert.strictEqual(prepared.code, 'enterpriseA::promise::phone-preorder');
    await assert.rejects(() => Promise.resolve().then(() => promiseService.preparePromiseReservationSave({ tenant: 'tenantA', authData, model: reservation })), error => error.code === 'ERR_INV_00047');
    let preparedReservation = await promiseService.preparePromiseReservationSave({ tenant: 'tenantA', authData, model: reservation, _inventoryPromiseMutationAuthorized: true });
    assert.strictEqual(preparedReservation.code, 'enterpriseA::promiseReservation::cart1-line1-overbook-1');
    await assert.rejects(promiseService.authorizeMutation({}), error => error.code === 'ERR_INV_00047');
    await assert.rejects(promiseService.rejectDelete(), error => error.code === 'ERR_INV_00047');

    promises = [Object.assign({ code: 'enterpriseA::promise::phone-preorder', revision: 0 }, basePromise)];
    reservations = [];
    let activeReservation = await promiseOrchestrationService.reserve({ tenant: 'tenantA', authData, promiseReservation: {
        idempotencyKey: 'cart1-line1-overbook-1', promiseCode: 'phone-preorder', demandType: 'CART',
        demandCode: 'cart1', demandLineCode: 'line1', checkoutAllocationCode: 'deliveryAllocation1',
        quantity: '1', reasonCode: 'PREORDER_OVERBOOK'
    } });
    assert.strictEqual(activeReservation.state, 'ACTIVE');
    assert.strictEqual(activeReservation.promiseBucket, 'OVERBOOKED');
    assert.strictEqual(promises[0].overbookedQuantity, '20');
    assert.strictEqual(promises[0].revision, 1);
    let replayed = await promiseOrchestrationService.reserve({ tenant: 'tenantA', authData, promiseReservation: {
        idempotencyKey: 'cart1-line1-overbook-1', promiseCode: 'phone-preorder', demandType: 'CART',
        demandCode: 'cart1', demandLineCode: 'line1', quantity: '1'
    } });
    assert.strictEqual(replayed.code, activeReservation.code);
    assert.strictEqual(promises[0].overbookedQuantity, '20', 'idempotent replay must not double-count overbooking');
    let released = await promiseOrchestrationService.release({ tenant: 'tenantA', authData, promiseReservation: { code: activeReservation.code, reasonCode: 'CART_CANCELLED' } });
    assert.strictEqual(released.state, 'RELEASED');
    assert.strictEqual(promises[0].overbookedQuantity, '19');
    await assert.rejects(promiseOrchestrationService.reserve({ tenant: 'tenantA', authData: { enterprise: { code: 'enterpriseA' } }, promiseReservation: {
        idempotencyKey: 'cart1-line1-overbook-2', promiseCode: 'phone-preorder', demandType: 'CART',
        demandCode: 'cart1', demandLineCode: 'line1', quantity: '2'
    } }), error => error.code === 'ERR_INV_00047');

    let resources = operationsService.resources();
    assert.strictEqual(resources.promises.service, 'DefaultInventoryPromiseService');
    assert(resources.promises.filters.includes('promiseType'));
    assert.strictEqual(resources.promiseReservations.service, 'DefaultInventoryPromiseReservationService');
    assert(resources.promiseReservations.fields.includes('paymentRequirement'));
    console.log('Inventory Promise foundation validated');
})().catch(error => { console.error(error); process.exit(1); });
