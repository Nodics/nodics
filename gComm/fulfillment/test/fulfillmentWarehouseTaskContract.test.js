/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module fulfillment/test/fulfillmentWarehouseTaskContract
 * @description Protects Fulfillment-owned warehouse pick, pack, and handoff task evidence.
 * @layer test
 * @owner fulfillment
 * @override Customer modules may replace warehouse execution rules while preserving Fulfillment evidence and Inventory/Order boundaries.
 */
const assert = require('assert');

const properties = require('../config/properties');
const policyService = require('../src/service/policy/defaultFulfillmentPolicyService');
const warehouseTaskService = require('../src/service/warehouse/defaultWarehouseTaskService');

global.CONFIG = {
    get: (key) => key === 'fulfillment' ? properties.fulfillment : undefined,
};
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(message, cause, code) {
            super(String(message));
            this.cause = cause;
            this.code = code;
        }
    },
};

const clone = (value) => JSON.parse(JSON.stringify(value));
let consignments = [
    {
        enterpriseCode: 'enterpriseA',
        consignmentCode: 'consignment-home',
        idempotencyKey: 'checkout-1::order-1::home::fulfillmentRelease',
        orderCode: 'order-1',
        deliveryGroupCode: 'home',
        allocationCodes: ['delivery-a1'],
        inventoryAllocationCodes: ['stock-allocation-1'],
        warehouseCode: 'warehouse-a',
        status: 'RELEASED',
    },
];
let tasks = [];

global.SERVICE = {
    DefaultFulfillmentPolicyService: policyService,
    DefaultFulfillmentConsignmentService: {
        get: async (request) => ({ result: consignments.filter((item) => item.consignmentCode === request.query.consignmentCode) }),
        save: async (request) => {
            let existingIndex = consignments.findIndex((item) => item.consignmentCode === request.model.consignmentCode);
            if (existingIndex >= 0) consignments[existingIndex] = clone(request.model);
            else consignments.push(clone(request.model));
            return { result: [clone(request.model)] };
        },
    },
    DefaultFulfillmentWarehouseTaskService: {
        get: async (request) => ({
            result: tasks.filter((item) =>
                request.query.taskCode ? item.taskCode === request.query.taskCode : item.idempotencyKey === request.query.idempotencyKey),
        }),
        save: async (request) => {
            let existingIndex = tasks.findIndex((item) => item.taskCode === request.model.taskCode);
            if (existingIndex >= 0) tasks[existingIndex] = clone(request.model);
            else tasks.push(clone(request.model));
            return { result: [clone(request.model)] };
        },
    },
};

const request = {
    tenant: 'default',
    authData: { tokenType: 'service', principalId: 'workflow' },
    entCode: 'enterpriseA',
    consignmentCode: 'consignment-home',
};

(async () => {
    const created = await warehouseTaskService.createTasks(clone(request));
    assert.strictEqual(created.count, 3);
    assert.deepStrictEqual(created.tasks.map((task) => task.taskType), ['PICK', 'PACK', 'HANDOFF']);
    assert.strictEqual(created.tasks[0].status, 'OPEN');
    assert.strictEqual(created.tasks[0].warehouseCode, 'warehouse-a');
    assert.deepStrictEqual(created.tasks[0].allocationCodes, ['delivery-a1']);
    assert.strictEqual(created.consignment.status, 'PICKING');

    const replay = await warehouseTaskService.createTasks(clone(request));
    assert.strictEqual(replay.tasks[0].idempotent, true);
    assert.strictEqual(tasks.length, 3);

    const pick = created.tasks.find((task) => task.taskType === 'PICK');
    const pack = created.tasks.find((task) => task.taskType === 'PACK');
    const handoff = created.tasks.find((task) => task.taskType === 'HANDOFF');

    const started = await warehouseTaskService.startTask(Object.assign(clone(request), {
        taskCode: pick.taskCode,
        assignedTo: 'picker-1',
    }));
    assert.strictEqual(started.status, 'IN_PROGRESS');
    assert.strictEqual(started.assignedTo, 'picker-1');

    const completedPick = await warehouseTaskService.completeTask(Object.assign(clone(request), { taskCode: pick.taskCode }));
    assert.strictEqual(completedPick.status, 'COMPLETED');

    const completedPack = await warehouseTaskService.completeTask(Object.assign(clone(request), { taskCode: pack.taskCode }));
    assert.strictEqual(completedPack.status, 'COMPLETED');
    assert.strictEqual(consignments[0].status, 'PACKED');

    const completedHandoff = await warehouseTaskService.completeTask(Object.assign(clone(request), { taskCode: handoff.taskCode }));
    assert.strictEqual(completedHandoff.status, 'COMPLETED');
    assert.strictEqual(consignments[0].status, 'PACKED');

    await assert.rejects(
        () => warehouseTaskService.startTask(Object.assign(clone(request), { taskCode: pack.taskCode })),
        (error) => error.code === 'ERR_FUL_00001' && error.message.includes('transition from COMPLETED to IN_PROGRESS')
    );

    await assert.rejects(
        () => warehouseTaskService.createTasks(Object.assign(clone(request), { deviceSecret: 'never-store' })),
        (error) => error.code === 'ERR_FUL_00001' && error.message.includes('must not store provider secrets')
    );

    console.log('Fulfillment warehouse task contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
