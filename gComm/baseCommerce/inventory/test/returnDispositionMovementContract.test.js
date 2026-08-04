/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module inventory/test/returnDispositionMovementContract
 * @description Protects Inventory-owned execution of Fulfillment return disposition intent through Stock Movement evidence.
 * @layer test
 * @owner inventory
 * @override Project modules may customize disposition-to-stock mapping while preserving Inventory Stock Movement authority.
 */
const assert = require('assert');

const inventory = require('../config/properties').inventory;
const units = require('../../../../gCore/units/config/properties').units;
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }

global.CLASSES = { NodicsError };
global.CONFIG = { get: key => key === 'inventory' ? inventory : key === 'units' ? units : undefined };
global.SERVICE = {};

SERVICE.DefaultInventoryEnterpriseScopeService = require('../src/service/foundation/defaultInventoryEnterpriseScopeService');
SERVICE.DefaultExactUnitsService = require('../../../../gCore/units/src/service/exact/defaultExactUnitsService');
SERVICE.DefaultUnitsConversionPolicyService = require('../../../../gCore/units/src/service/conversion/defaultUnitsConversionPolicyService');
SERVICE.DefaultStockRepositoryService = require('../src/service/stock/defaultStockRepositoryService');
SERVICE.DefaultStockMovementService = require('../src/service/stock/defaultStockMovementService');
const dispositionService = require('../src/service/return/defaultReturnDispositionMovementService');

let balances = [];
let movements = [];
let allocations = [];
const match = (item, query) => Object.keys(query || {}).every(key => item[key] === query[key]);

SERVICE.DefaultWarehouseService = { get: async () => ({ result: [{ warehouseCode: 'central', status: 'ACTIVE' }] }) };
SERVICE.DefaultWarehouseLocationService = { get: async () => ({ result: [{ locationCode: 'returns', status: 'ACTIVE' }] }) };
SERVICE.DefaultInventoryUnitsReferenceProviderService = {
    convert: async (request, input) => ({
        quantity: SERVICE.DefaultExactUnitsService.multiplyRational(input.quantity, '1', '1', input.targetScale, input.roundingMode),
        fromUnit: { unitCode: input.fromUnitCode, dimensionVector: { COUNT: 1 } },
        toUnit: { unitCode: input.toUnitCode, dimensionVector: { COUNT: 1 } },
        conversion: null,
    }),
};
SERVICE.DefaultStockBalanceService = {
    get: async request => ({ result: balances.filter(item => match(item, request.query)) }),
    save: async request => {
        if (balances.some(item => item.code === request.model.code)) throw new Error('duplicate balance');
        balances.push(Object.assign({}, request.model));
        return { result: [request.model] };
    },
    update: async request => {
        let item = balances.find(value => match(value, request.query));
        if (!item) return { result: { modifiedCount: 0 } };
        Object.assign(item, request.model);
        return { result: { modifiedCount: 1 } };
    },
};
SERVICE.DefaultStockMovementRecordService = {
    get: async request => ({ result: movements.filter(item => match(item, request.query)) }),
    save: async request => {
        if (movements.some(item => item.code === request.model.code)) throw new Error('duplicate movement');
        movements.push(Object.assign({}, request.model));
        return { result: [request.model] };
    },
    update: async request => {
        let item = movements.find(value => match(value, request.query));
        if (!item) return { result: { modifiedCount: 0 } };
        Object.assign(item, request.model);
        return { result: { modifiedCount: 1 } };
    },
};
SERVICE.DefaultStockAllocationService = {
    get: async request => ({ result: allocations.filter(item => match(item, request.query)) }),
};

const authData = { tokenType: 'service', enterprise: { code: 'enterpriseA' }, principalId: 'workflow' };
const sourceStock = {
    warehouseCode: 'central',
    locationCode: 'returns',
    itemType: 'SKU',
    itemCode: 'phone',
    conditionCode: 'SELLABLE',
    unitCode: 'EA',
    scale: 3,
};
const stockCode = SERVICE.DefaultStockMovementService.stockCode('enterpriseA', sourceStock);
balances.push({
    code: stockCode,
    active: true,
    enterpriseCode: 'enterpriseA',
    warehouseCode: 'central',
    locationCode: 'returns',
    itemType: 'SKU',
    itemCode: 'phone',
    conditionCode: 'SELLABLE',
    unitCode: 'EA',
    dimensionVector: { COUNT: 1 },
    quantity: '4.000',
    reservedQuantity: '0.000',
    scale: 3,
    revision: 7,
});
allocations.push({
    code: 'enterpriseA::allocation::order-allocation-1',
    enterpriseCode: 'enterpriseA',
    allocationCode: 'order-allocation-1',
    itemType: 'SKU',
    itemCode: 'phone',
    unitCode: 'EA',
    scale: 3,
    assignments: [{ reservationCode: 'reservation-1', warehouseCode: 'central', stockCode, quantity: '1.000', state: 'FULFILLED' }],
});
allocations.push({
    code: 'enterpriseA::allocation::order-allocation-scrap', enterpriseCode: 'enterpriseA', allocationCode: 'order-allocation-scrap', itemType: 'SKU', itemCode: 'phone', unitCode: 'EA', scale: 3,
    assignments: [{ reservationCode: 'reservation-scrap', warehouseCode: 'central', stockCode, quantity: '1.000', state: 'FULFILLED' }],
});
allocations.push({
    code: 'enterpriseA::allocation::order-allocation-rtv', enterpriseCode: 'enterpriseA', allocationCode: 'order-allocation-rtv', itemType: 'SKU', itemCode: 'phone', unitCode: 'EA', scale: 3,
    assignments: [{ reservationCode: 'reservation-rtv', warehouseCode: 'central', stockCode, quantity: '1.000', state: 'FULFILLED' }],
});

(async () => {
    assert.strictEqual(inventory.stockAllocation.returnDisposition.conditionCodeByDisposition.RESTOCK, 'SELLABLE');
    assert.strictEqual(inventory.stockAllocation.returnDisposition.conditionCodeByDisposition.RETURN_TO_VENDOR, 'RETURN_TO_VENDOR');
    await assert.rejects(
        () => dispositionService.execute({
            tenant: 'tenantA',
            authData: { tokenType: 'access', enterprise: { code: 'enterpriseA' } },
            dispositionIntent: { sourceCode: 'return-1', dispositionCode: 'RESTOCK', inventoryAllocationCodes: ['order-allocation-1'] },
        }),
        error => error.code === 'ERR_INV_00054'
    );

    const executed = await dispositionService.execute({
        tenant: 'tenantA',
        authData,
        dispositionIntent: {
            sourceType: 'FULFILLMENT_RETURN',
            sourceCode: 'return-1',
            dispositionCode: 'RESTOCK',
            inventoryAllocationCodes: ['order-allocation-1'],
        },
    });
    assert.strictEqual(executed.status, 'INVENTORY_DISPOSITION_APPLIED');
    assert.strictEqual(executed.movements.length, 1);
    assert.strictEqual(executed.movements[0].state, 'APPLIED');
    assert.strictEqual(executed.movements[0].movementType, 'RETURN');
    assert.strictEqual(executed.movements[0].sourceType, 'FULFILLMENT_RETURN');
    assert.strictEqual(balances[0].quantity, '5.000');
    assert.strictEqual(balances[0].revision, 8);

    const replay = await dispositionService.execute({
        tenant: 'tenantA',
        authData,
        dispositionIntent: {
            sourceType: 'FULFILLMENT_RETURN',
            sourceCode: 'return-1',
            dispositionCode: 'RESTOCK',
            inventoryAllocationCodes: ['order-allocation-1'],
        },
    });
    assert.strictEqual(replay.movements[0].state, 'APPLIED');
    assert.strictEqual(balances[0].quantity, '5.000');

    const recoveryReview = await dispositionService.reviewDispositionRecovery({
        tenant: 'tenantA',
        authData,
        dispositionIntent: {
            sourceType: 'FULFILLMENT_RETURN',
            sourceCode: 'return-1',
            dispositionCode: 'RESTOCK',
            inventoryAllocationCodes: ['order-allocation-1'],
        },
    });
    assert.strictEqual(recoveryReview.recoveryOwner, 'inventory');
    assert.strictEqual(recoveryReview.recoveryAction, 'REVIEW_DISPOSITION_MOVEMENT');
    assert.strictEqual(recoveryReview.recoveryStatus, 'MOVEMENT_FOUND');
    assert.strictEqual(recoveryReview.recovered, true);
    assert.deepStrictEqual(recoveryReview.movementCodes, ['enterpriseA::movement::return-1-RESTOCK-reservation-1']);

    const missingRecoveryReview = await dispositionService.reviewDispositionRecovery({
        tenant: 'tenantA',
        authData,
        dispositionIntent: {
            sourceType: 'FULFILLMENT_RETURN',
            sourceCode: 'return-missing',
            dispositionCode: 'RESTOCK',
            inventoryAllocationCodes: ['order-allocation-1'],
        },
    });
    assert.strictEqual(missingRecoveryReview.recoveryStatus, 'MOVEMENT_REVIEW_REQUIRED');
    assert.strictEqual(missingRecoveryReview.recovered, false);
    assert.deepStrictEqual(missingRecoveryReview.nextActions, ['REVIEW_DISPOSITION_MOVEMENT', 'ADJUST_THROUGH_STOCK_MOVEMENT']);

    const inspectOnly = await dispositionService.execute({
        tenant: 'tenantA',
        authData,
        dispositionIntent: {
            sourceCode: 'return-2',
            dispositionCode: 'INSPECT',
            movementType: 'RETURN',
            inventoryAllocationCodes: [],
        },
    });
    assert.strictEqual(inspectOnly.status, 'NO_INVENTORY_DISPOSITION_REQUIRED');

    const scrapped = await dispositionService.execute({
        tenant: 'tenantA', authData,
        dispositionIntent: { sourceType: 'FULFILLMENT_RETURN', sourceCode: 'return-scrap', dispositionCode: 'SCRAP', inventoryAllocationCodes: ['order-allocation-scrap'] },
    });
    assert.strictEqual(scrapped.status, 'INVENTORY_DISPOSITION_APPLIED');
    assert.strictEqual(scrapped.movements[0].movementType, 'DAMAGE');
    assert(balances.some(value => value.conditionCode === 'DAMAGED' && value.quantity === '1.000'));

    const returnedToVendor = await dispositionService.execute({
        tenant: 'tenantA', authData,
        dispositionIntent: { sourceType: 'FULFILLMENT_RETURN', sourceCode: 'return-rtv', dispositionCode: 'RETURN_TO_VENDOR', inventoryAllocationCodes: ['order-allocation-rtv'] },
    });
    assert.strictEqual(returnedToVendor.status, 'INVENTORY_DISPOSITION_APPLIED');
    assert.strictEqual(returnedToVendor.movements[0].movementType, 'RETURN');
    assert(balances.some(value => value.conditionCode === 'RETURN_TO_VENDOR' && value.quantity === '1.000'));

    console.log('Inventory return disposition movement contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
