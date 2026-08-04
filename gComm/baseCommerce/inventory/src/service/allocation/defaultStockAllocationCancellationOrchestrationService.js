/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module inventory/service/allocation/DefaultStockAllocationCancellationOrchestrationService
 * @description Cancels exact unfulfilled allocation quantities through idempotent reservation-release checkpoints without changing on-hand stock.
 * @layer service
 * @owner inventory
 * @override Projects may replace assignment selection while preserving exact quantities, serial binding, durable checkpoints, and optimistic allocation revision guards.
 */
module.exports = {
    /**
     * Initializes the module artifact within the inventory-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    init: function () { return Promise.resolve(true); },
    /**
     * Completes initialization for the module artifact within the inventory-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    postInit: function () { return Promise.resolve(true); },
    /**
     * Executes the policy operation within the inventory-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    policy: function () { return ((((CONFIG.get('inventory') || {}).stockAllocation) || {}).cancellation) || {}; },
    /**
     * Authorizes internal mutation within the inventory-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    authorizeInternalMutation: function (request) {
        if (!request || request._stockAllocationCancellationMutationAuthorized !== true) return Promise.reject(new CLASSES.NodicsError('ERR_INV_00055', 'Allocation cancellation evidence can change only through orchestration'));
        return Promise.resolve(true);
    },
    /**
     * Rejects delete within the inventory-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    rejectDelete: function () { return Promise.reject(new CLASSES.NodicsError('ERR_INV_00055', 'Allocation cancellation evidence cannot be deleted')); },
    /**
     * Authorizes the module artifact within the inventory-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    authorize: function (request) {
        if (!request || !request.authData || request.authData.tokenType !== 'service') throw new CLASSES.NodicsError('ERR_INV_00042', 'Stock allocation cancellation requires an internal service identity');
    },
    /**
     * Executes the items operation within the inventory-owned layered contract.
     *
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    items: function (response) { return response && Array.isArray(response.result) ? response.result : Array.isArray(response) ? response : []; },
    /**
     * Executes the affected operation within the inventory-owned layered contract.
     *
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    affected: function (response) { let value = response && response.result !== undefined ? response.result : response;
        return Number(value && (value.modifiedCount !== undefined ? value.modifiedCount : value.nModified !== undefined ? value.nModified : value.n) || 0); },
    /**
     * Normalizes the module artifact within the inventory-owned layered contract.
     *
     * @param {*} quantity Value defined by the surrounding Nodics operation contract.
     * @param {*} scale Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    normalize: function (quantity, scale) { return SERVICE.DefaultExactUnitsService.multiplyRational(quantity, '1', '1', scale, 'UNNECESSARY'); },
    /**
     * Executes the negate operation within the inventory-owned layered contract.
     *
     * @param {*} quantity Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    negate: function (quantity) { let parsed = SERVICE.DefaultExactUnitsService.parse(quantity); return SERVICE.DefaultExactUnitsService.format(-parsed.unscaled, parsed.scale); },
    /**
     * Executes the add operation within the inventory-owned layered contract.
     *
     * @param {*} left Value defined by the surrounding Nodics operation contract.
     * @param {*} right Value defined by the surrounding Nodics operation contract.
     * @param {*} scale Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    add: function (left, right, scale) { return SERVICE.DefaultExactUnitsService.add(left, right, scale, 'UNNECESSARY'); },
    /**
     * Loads allocation within the inventory-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} input Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    loadAllocation: async function (request, input) {
        let response = await SERVICE.DefaultStockAllocationService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: request.enterpriseCode, code: input.allocationCode }, searchOptions: { limit: 2 } });
        let records = this.items(response); if (records.length !== 1) throw new CLASSES.NodicsError('ERR_INV_00055', 'Stock Allocation was not found or duplicated');
        return records[0];
    },
    /**
     * Loads operation within the inventory-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} cancellationCode Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    loadOperation: async function (request, cancellationCode) {
        let response = await SERVICE.DefaultStockAllocationCancellationService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: request.enterpriseCode, cancellationCode: cancellationCode }, searchOptions: { limit: 2 } });
        let records = this.items(response); if (records.length > 1) throw new CLASSES.NodicsError('ERR_INV_00057', 'Allocation cancellation identity is duplicated');
        return records[0];
    },
    /**
     * Transitions the module artifact within the inventory-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} operation Value defined by the surrounding Nodics operation contract.
     * @param {*} state Value defined by the surrounding Nodics operation contract.
     * @param {*} patch Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    transition: async function (request, operation, state, patch) {
        let response = await SERVICE.DefaultStockAllocationCancellationService.update({ tenant: request.tenant, authData: request.authData,
            _stockAllocationCancellationMutationAuthorized: true,
            query: { enterpriseCode: request.enterpriseCode, cancellationCode: operation.cancellationCode, revision: operation.revision },
            model: Object.assign({ state: state, revision: Number(operation.revision) + 1 }, patch || {}) });
        if (this.affected(response) !== 1) throw new CLASSES.NodicsError('ERR_INV_00057', 'Allocation cancellation checkpoint revision conflict');
        return Object.assign({}, operation, patch || {}, { state: state, revision: Number(operation.revision) + 1 });
    },
    /**
     * Executes the plan operation within the inventory-owned layered contract.
     *
     * @param {*} allocation Value defined by the surrounding Nodics operation contract.
     * @param {*} input Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    plan: function (allocation, input) {
        let scale = Number(allocation.scale); let requested = this.normalize(input.quantity, scale);
        if (input.unitCode !== allocation.unitCode || SERVICE.DefaultExactUnitsService.parse(requested).unscaled <= 0n) throw new CLASSES.NodicsError('ERR_INV_00055', 'Cancellation quantity or Unit is invalid');
        let zero = this.normalize('0', scale); let availableAssignments = (allocation.assignments || []).filter(value => value.state !== 'FULFILLED').map(value => {
            let quantity = this.normalize(value.quantity, scale); let released = this.normalize(value.releasedQuantity || '0', scale);
            let remaining = this.add(quantity, this.negate(released), scale);
            return Object.assign({}, value, { remainingQuantity: remaining });
        }).filter(value => SERVICE.DefaultExactUnitsService.parse(value.remainingQuantity).unscaled > 0n);
        let plan = []; let serials = [].concat(input.serialNumbers || []).filter(Boolean);
        if (serials.length) {
            if (scale !== 0 || requested !== String(serials.length)) throw new CLASSES.NodicsError('ERR_INV_00056', 'Serialized cancellation quantity must equal unique serial count');
            if (new Set(serials).size !== serials.length) throw new CLASSES.NodicsError('ERR_INV_00055', 'Serialized cancellation contains duplicate serials');
            let seen = new Set();
            serials.forEach(serial => {
                let assignment = availableAssignments.find(value => (value.serialNumbers || []).includes(serial));
                if (!assignment || seen.has(serial)) throw new CLASSES.NodicsError('ERR_INV_00056', 'Serialized cancellation does not match active allocation evidence');
                seen.add(serial); let existing = plan.find(value => value.reservationCode === assignment.reservationCode);
                if (existing) { existing.quantity = this.add(existing.quantity, '1', scale); existing.serialNumbers.push(serial); }
                else plan.push({ reservationCode: assignment.reservationCode, quantity: '1', serialNumbers: [serial] });
            });
        } else {
            let remaining = requested;
            availableAssignments.sort((left, right) => String(left.reservationCode).localeCompare(String(right.reservationCode))).forEach(assignment => {
                if (SERVICE.DefaultExactUnitsService.parse(remaining).unscaled <= 0n) return;
                let take = SERVICE.DefaultExactUnitsService.parse(assignment.remainingQuantity).unscaled <= SERVICE.DefaultExactUnitsService.parse(remaining).unscaled ? assignment.remainingQuantity : remaining;
                plan.push({ reservationCode: assignment.reservationCode, quantity: take, serialNumbers: [] });
                remaining = this.add(remaining, this.negate(take), scale);
            });
            if (SERVICE.DefaultExactUnitsService.parse(remaining).unscaled !== 0n) throw new CLASSES.NodicsError('ERR_INV_00056', 'Cancellation quantity exceeds unfulfilled allocated quantity');
        }
        if (!plan.length || plan.length > Number(this.policy().maximumAssignments || 100)) throw new CLASSES.NodicsError('ERR_INV_00055', 'Cancellation assignment plan is invalid');
        return { requested: requested, assignments: plan, zero: zero };
    },
    /**
     * Creates operation within the inventory-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} allocation Value defined by the surrounding Nodics operation contract.
     * @param {*} input Value defined by the surrounding Nodics operation contract.
     * @param {*} plan Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    createOperation: async function (request, allocation, input, plan) {
        let model = { active: true, enterpriseCode: request.enterpriseCode, cancellationCode: input.cancellationCode,
            allocationCode: allocation.code, demandCode: allocation.demandCode, demandLineCode: allocation.demandLineCode,
            requestVersion: Number(input.requestVersion), requestedQuantity: plan.requested, unitCode: allocation.unitCode,
            serialNumbers: input.serialNumbers || [], state: 'PENDING', revision: 0, assignmentPlan: plan.assignments,
            releasedAssignments: [], allocationRevision: Number(allocation.revision) };
        await SERVICE.DefaultStockAllocationCancellationService.save({ tenant: request.tenant, authData: request.authData,
            model: model, _stockAllocationCancellationMutationAuthorized: true });
        return model;
    },
    /**
     * Asserts replay within the inventory-owned layered contract.
     *
     * @param {*} operation Value defined by the surrounding Nodics operation contract.
     * @param {*} allocation Value defined by the surrounding Nodics operation contract.
     * @param {*} input Value defined by the surrounding Nodics operation contract.
     * @param {*} requested Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    assertReplay: function (operation, allocation, input, requested) {
        if (operation.allocationCode !== allocation.code || operation.requestVersion !== Number(input.requestVersion) || operation.requestedQuantity !== requested || operation.unitCode !== input.unitCode || JSON.stringify(operation.serialNumbers || []) !== JSON.stringify(input.serialNumbers || [])) {
            throw new CLASSES.NodicsError('ERR_INV_00056', 'Allocation cancellation idempotency conflict');
        }
    },
    /**
     * Applies allocation within the inventory-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} allocation Value defined by the surrounding Nodics operation contract.
     * @param {*} operation Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    applyAllocation: async function (request, allocation, operation) {
        let scale = Number(allocation.scale); let releaseByReservation = new Map(operation.assignmentPlan.map(value => [value.reservationCode, value.quantity]));
        let assignments = (allocation.assignments || []).map(value => {
            let releasedNow = releaseByReservation.get(value.reservationCode); if (!releasedNow) return value;
            let released = this.add(this.normalize(value.releasedQuantity || '0', scale), releasedNow, scale);
            let remaining = this.add(this.normalize(value.quantity, scale), this.negate(released), scale);
            return Object.assign({}, value, { releasedQuantity: released, remainingQuantity: remaining,
                state: SERVICE.DefaultExactUnitsService.parse(remaining).unscaled === 0n ? 'CANCELLED' : 'PARTIALLY_CANCELLED' });
        });
        let cancelledQuantity = this.add(this.normalize(allocation.cancelledQuantity || '0', scale), operation.requestedQuantity, scale);
        let remainingAllocated = this.add(this.normalize(allocation.allocatedQuantity, scale), this.negate(this.add(this.normalize(allocation.fulfilledQuantity || '0', scale), cancelledQuantity, scale)), scale);
        if (SERVICE.DefaultExactUnitsService.parse(remainingAllocated).unscaled < 0n) throw new CLASSES.NodicsError('ERR_INV_00057', 'Allocation cancellation totals require reconciliation');
        let state = SERVICE.DefaultExactUnitsService.parse(remainingAllocated).unscaled === 0n && SERVICE.DefaultExactUnitsService.parse(allocation.fulfilledQuantity || '0').unscaled === 0n ? 'CANCELLED' : 'PARTIALLY_CANCELLED';
        let response = await SERVICE.DefaultStockAllocationService.update({ tenant: request.tenant, authData: request.authData,
            _stockAllocationMutationAuthorized: true,
            query: { enterpriseCode: request.enterpriseCode, code: allocation.code, revision: operation.allocationRevision },
            model: { assignments: assignments, cancelledQuantity: cancelledQuantity, state: state,
                lastCancellationCode: operation.cancellationCode, revision: Number(operation.allocationRevision) + 1,
                terminalAt: state === 'CANCELLED' ? new Date() : undefined } });
        if (this.affected(response) !== 1) throw new CLASSES.NodicsError('ERR_INV_00057', 'Stock Allocation revision changed during cancellation');
        return { state: state, cancelledQuantity: cancelledQuantity, remainingAllocatedQuantity: remainingAllocated, assignments: assignments };
    },
    /**
     * Cancels the module artifact within the inventory-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    cancel: async function (request) {
        this.authorize(request); let input = request.body || request.cancellation || {};
        request.enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request);
        ['cancellationCode', 'allocationCode', 'requestVersion', 'quantity', 'unitCode'].forEach(field => { if (input[field] === undefined || input[field] === null || input[field] === '') throw new CLASSES.NodicsError('ERR_INV_00055', 'Allocation cancellation ' + field + ' is required'); });
        let allocation = await this.loadAllocation(request, input);
        let operation = await this.loadOperation(request, input.cancellationCode);
        if (operation) this.assertReplay(operation, allocation, input, this.normalize(input.quantity, allocation.scale));
        else operation = await this.createOperation(request, allocation, input, this.plan(allocation, input));
        if (operation.state === 'COMPLETED') return Object.assign({ idempotent: true }, operation);
        if (operation.state === 'RECONCILIATION_REQUIRED') throw new CLASSES.NodicsError('ERR_INV_00057', 'Allocation cancellation requires reconciliation');
        try {
            if (operation.state === 'PENDING') operation = await this.transition(request, operation, 'RELEASING_RESERVATIONS');
            let released = [];
            for (let assignment of operation.assignmentPlan) {
                let result = await SERVICE.DefaultStockReservationOrchestrationService.releaseQuantity(Object.assign({}, request, { reservation: {
                    code: assignment.reservationCode, quantity: assignment.quantity,
                    releaseKey: operation.cancellationCode + '::' + assignment.reservationCode } }));
                released.push({ reservationCode: assignment.reservationCode, quantity: assignment.quantity, state: result.state, serialNumbers: assignment.serialNumbers || [] });
            }
            operation = await this.transition(request, operation, 'RESERVATIONS_RELEASED', { releasedAssignments: released });
            let allocationResult;
            if (allocation.lastCancellationCode === operation.cancellationCode) {
                allocationResult = { state: allocation.state, cancelledQuantity: allocation.cancelledQuantity,
                    remainingAllocatedQuantity: this.add(this.normalize(allocation.allocatedQuantity, allocation.scale),
                        this.negate(this.add(this.normalize(allocation.fulfilledQuantity || '0', allocation.scale), this.normalize(allocation.cancelledQuantity || '0', allocation.scale), allocation.scale)), allocation.scale),
                    recovered: true };
            } else allocationResult = await this.applyAllocation(request, allocation, operation);
            operation = await this.transition(request, operation, 'COMPLETED', { allocationResult: allocationResult, completedAt: new Date() });
            return operation;
        } catch (error) {
            if (operation && !['COMPLETED', 'RECONCILIATION_REQUIRED'].includes(operation.state)) {
                try { operation = await this.transition(request, operation, 'RECONCILIATION_REQUIRED', { failureCode: error.code || 'ERR_INV_00057' }); } catch (ignored) { /* reconciliation uses cancellation identity */ }
            }
            throw error;
        }
    },
};
