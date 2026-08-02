/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module fulfillment/service/warehouse/DefaultWarehouseTaskService
 * @description Creates and transitions Fulfillment-owned warehouse pick, pack, and handoff task evidence.
 * @layer service
 * @owner fulfillment
 * @override Customer modules may replace task grouping, assignment, barcode/device integration, and warehouse workflow rules without mutating Inventory or Order directly.
 */
module.exports = {
    /** Initializes warehouse task orchestration. */
    init: function () { return Promise.resolve(true); },
    /** Completes warehouse task orchestration startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered fulfillment policy. */
    config: function () { return ((CONFIG.get('fulfillment') || {}).fulfillmentPolicy) || {}; },
    /** Creates a stable warehouse task error. */
    error: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, 'ERR_FUL_00005');
        let error = new Error(message);
        error.code = 'ERR_FUL_00005';
        return error;
    },
    /** Normalizes generated-service responses and preloaded arrays. */
    items: function (value) {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (Array.isArray(value.result)) return value.result;
        if (Array.isArray(value.items)) return value.items;
        return [value];
    },
    /** Loads one consignment by code unless already supplied. */
    loadConsignment: async function (request) {
        if (request.consignment) return request.consignment;
        if (!request.consignmentCode) throw this.error('Warehouse task requires consignmentCode');
        if (!SERVICE.DefaultFulfillmentConsignmentService || typeof SERVICE.DefaultFulfillmentConsignmentService.get !== 'function') {
            throw this.error('Fulfillment consignment generated service is unavailable');
        }
        let response = await SERVICE.DefaultFulfillmentConsignmentService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: { consignmentCode: request.consignmentCode },
            searchOptions: { limit: 2 },
        });
        let consignments = this.items(response);
        if (consignments.length > 1) throw this.error('Warehouse task resolved duplicate consignments');
        if (!consignments[0]) throw this.error('Warehouse task consignment was not found');
        return consignments[0];
    },
    /** Loads one task by task or idempotency identity. */
    loadTask: async function (request) {
        if (request.task) return request.task;
        if (!SERVICE.DefaultFulfillmentWarehouseTaskService || typeof SERVICE.DefaultFulfillmentWarehouseTaskService.get !== 'function') {
            throw this.error('Fulfillment warehouse task generated service is unavailable');
        }
        let query = request.taskCode ? { taskCode: request.taskCode } :
            request.idempotencyKey ? { idempotencyKey: request.idempotencyKey } : undefined;
        if (!query) throw this.error('Warehouse task requires taskCode or idempotencyKey');
        let response = await SERVICE.DefaultFulfillmentWarehouseTaskService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: query,
            searchOptions: { limit: 2 },
        });
        let tasks = this.items(response);
        if (tasks.length > 1) throw this.error('Warehouse task resolved duplicate records');
        return tasks[0];
    },
    /** Persists task evidence through the generated Fulfillment service. */
    saveTask: async function (request, task) {
        if (!SERVICE.DefaultFulfillmentWarehouseTaskService || typeof SERVICE.DefaultFulfillmentWarehouseTaskService.save !== 'function') {
            throw this.error('Fulfillment warehouse task generated service is unavailable');
        }
        let response = await SERVICE.DefaultFulfillmentWarehouseTaskService.save({
            tenant: request.tenant,
            authData: request.authData,
            model: task,
        });
        return this.items(response)[0] || response.result || task;
    },
    /** Persists consignment lifecycle evidence through the generated Fulfillment service. */
    saveConsignment: async function (request, consignment) {
        if (!SERVICE.DefaultFulfillmentConsignmentService || typeof SERVICE.DefaultFulfillmentConsignmentService.save !== 'function') {
            throw this.error('Fulfillment consignment generated service is unavailable');
        }
        let response = await SERVICE.DefaultFulfillmentConsignmentService.save({
            tenant: request.tenant,
            authData: request.authData,
            model: consignment,
        });
        return this.items(response)[0] || response.result || consignment;
    },
    /** Validates common request authority. */
    validateRequest: function (request) {
        if (!request || !request.tenant || !request.authData) throw this.error('Warehouse task requires tenant and auth');
    },
    /** Returns default task types from configuration. */
    defaultTaskTypes: function () {
        let taskTypes = ((this.config().warehouseTaskPolicy || {}).defaultTaskTypes) || ['PICK', 'PACK', 'HANDOFF'];
        return this.items(taskTypes);
    },
    /** Creates configured warehouse tasks idempotently for one consignment. */
    createTasks: async function (request) {
        this.validateRequest(request);
        if (SERVICE.DefaultFulfillmentPolicyService && typeof SERVICE.DefaultFulfillmentPolicyService.assertSafe === 'function') {
            SERVICE.DefaultFulfillmentPolicyService.assertSafe(request);
        }
        let consignment = await this.loadConsignment(request);
        if (!SERVICE.DefaultFulfillmentPolicyService || typeof SERVICE.DefaultFulfillmentPolicyService.buildWarehouseTaskDraft !== 'function') {
            throw this.error('Fulfillment policy service is unavailable');
        }
        let created = [];
        for (let taskType of this.items(request.taskTypes || this.defaultTaskTypes())) {
            let draft = SERVICE.DefaultFulfillmentPolicyService.buildWarehouseTaskDraft(request, consignment, taskType);
            let existing = await this.loadTask(Object.assign({}, request, { idempotencyKey: draft.idempotencyKey }));
            created.push(existing ? Object.assign({ idempotent: true }, existing) : await this.saveTask(request, draft));
        }
        let nextStatus = created.some((task) => task.taskType === 'PICK') ? 'PICKING' : consignment.status;
        let updatedConsignment = await this.saveConsignment(request, Object.assign({}, consignment, { status: nextStatus }));
        return {
            consignment: updatedConsignment,
            tasks: created,
            count: created.length,
        };
    },
    /** Applies a task transition through Fulfillment policy and generated service. */
    transitionTask: async function (request, targetStatus, patch) {
        this.validateRequest(request);
        let task = await this.loadTask(request);
        if (!task) throw this.error('Warehouse task was not found');
        if (!SERVICE.DefaultFulfillmentPolicyService || typeof SERVICE.DefaultFulfillmentPolicyService.transitionWarehouseTask !== 'function') {
            throw this.error('Fulfillment policy service is unavailable');
        }
        let transitioned = SERVICE.DefaultFulfillmentPolicyService.transitionWarehouseTask({
            model: task,
            targetStatus: targetStatus,
            patch: patch || {},
        });
        return this.saveTask(request, transitioned);
    },
    /** Marks a warehouse task in progress. */
    startTask: async function (request) {
        return this.transitionTask(request, 'IN_PROGRESS', {
            assignedTo: request.assignedTo,
            startedAt: request.startedAt || new Date(),
        });
    },
    /** Completes a warehouse task and updates consignment status when pack/handoff reaches completion. */
    completeTask: async function (request) {
        let task = await this.transitionTask(request, 'COMPLETED', {
            completedAt: request.completedAt || new Date(),
        });
        if (['PACK', 'HANDOFF'].includes(task.taskType)) {
            let consignment = await this.loadConsignment(Object.assign({}, request, { consignmentCode: task.consignmentCode }));
            let status = task.taskType === 'PACK' ? 'PACKED' : consignment.status;
            await this.saveConsignment(request, Object.assign({}, consignment, { status: status }));
        }
        return task;
    },
    /** Cancels a warehouse task through lifecycle evidence. */
    cancelTask: async function (request) {
        return this.transitionTask(request, 'CANCELLED', {
            failureCode: request.failureCode,
            failureMessage: request.failureMessage,
        });
    },
};
