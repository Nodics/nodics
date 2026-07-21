/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/**
 * @module inventory/service/allocation/DefaultStockAllocationOrchestrationService
 * @description Owns idempotent demand-to-reservation allocation evidence while Order retains demand authority.
 * @layer service
 * @owner inventory
 * @override Projects may extend ranking while preserving exact quantities, reservation references, and demand reference-only ownership.
 */
module.exports = {
    /** Initializes allocation orchestration. */ init: function () { return Promise.resolve(true); },
    /** Completes allocation initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns allocation policy. */ policy: function () { return ((CONFIG.get('inventory') || {}).stockAllocation) || {}; },
    /** Allows allocation persistence only through orchestration. */ authorizeInternalMutation: function (request) {
        if (!request || request._stockAllocationMutationAuthorized !== true) return Promise.reject(new CLASSES.NodicsError('ERR_INV_00038', 'Allocation state can change only through orchestration'));
        return Promise.resolve(true);
    },
    /** Rejects allocation evidence deletion. */ rejectDelete: function () { return Promise.reject(new CLASSES.NodicsError('ERR_INV_00038', 'Allocation evidence cannot be deleted')); },
    /** Extracts result items. */ items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Extracts affected count. */ affected: function (response) { let value = response && response.result !== undefined ? response.result : response;
        return value && (value.modifiedCount !== undefined ? value.modifiedCount : value.nModified !== undefined ? value.nModified : value.n) || 0; },
    /** Negates an exact canonical quantity. */ negate: function (quantity) { let parsed = SERVICE.DefaultExactUnitsService.parse(quantity);
        return SERVICE.DefaultExactUnitsService.format(-parsed.unscaled, parsed.scale); },
    /** Loads an allocation by code. */ get: async function (code, request) { let response = await SERVICE.DefaultStockAllocationService.get({ tenant: request.tenant,
        authData: request.authData, query: { enterpriseCode: request.enterpriseCode, code }, searchOptions: { limit: 1 } }); return this.items(response)[0]; },
    /** Verifies idempotent replay intent. */ assertIntent: function (existing, model) {
        if (existing && existing.demandType === model.demandType && existing.demandCode === model.demandCode &&
            existing.demandLineCode === model.demandLineCode && existing.itemType === model.itemType && existing.itemCode === model.itemCode &&
            existing.requestedQuantity === model.requestedQuantity && existing.unitCode === model.unitCode &&
            JSON.stringify(existing.assignments) === JSON.stringify(model.assignments)) return existing;
        throw new CLASSES.NodicsError('ERR_INV_00039', 'Idempotency key belongs to another Stock Allocation');
    },
    /** Creates a multi-reservation allocation and explicit backorder remainder. */
    allocate: async function (request) {
        request = request || {}; let input = request.allocation || {}; let policy = this.policy();
        request.enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request);
        ['idempotencyKey', 'demandType', 'demandCode', 'demandLineCode', 'itemType', 'itemCode', 'requestedQuantity', 'unitCode', 'reasonCode']
            .forEach(field => { if (!input[field]) throw new CLASSES.NodicsError('ERR_INV_00038', 'Allocation ' + field + ' is required'); });
        if (!Array.isArray(input.assignments) || input.assignments.length > Number(policy.maximumAssignments || 100)) throw new CLASSES.NodicsError('ERR_INV_00038', 'Allocation assignments are invalid');
        let scale = Number(input.scale === undefined ? 6 : input.scale); let zero = SERVICE.DefaultExactUnitsService.multiplyRational('0', '1', '1', scale, 'UNNECESSARY');
        let requested = SERVICE.DefaultExactUnitsService.multiplyRational(input.requestedQuantity, '1', '1', scale, 'UNNECESSARY');
        if (SERVICE.DefaultExactUnitsService.parse(requested).unscaled <= 0n) throw new CLASSES.NodicsError('ERR_INV_00038', 'Requested quantity must be positive');
        let codes = input.assignments.map(value => value.reservationCode);
        if (new Set(codes).size !== codes.length || input.assignments.some(value => !value.reservationCode || !value.quantity)) throw new CLASSES.NodicsError('ERR_INV_00038', 'Assignment references must be unique');
        let reservationResponse = codes.length ? await SERVICE.DefaultStockReservationService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: request.enterpriseCode, code: { $in: codes } } }) : { result: [] };
        let reservations = new Map(this.items(reservationResponse).map(value => [value.code, value])); let allocated = zero;
        let assignments = input.assignments.map(value => {
            let reservation = reservations.get(value.reservationCode);
            let quantity = SERVICE.DefaultExactUnitsService.multiplyRational(value.quantity, '1', '1', scale, 'UNNECESSARY');
            if (!reservation || reservation.state !== 'ACTIVE' || reservation.itemType !== input.itemType || reservation.itemCode !== input.itemCode ||
                reservation.unitCode !== input.unitCode || quantity !== SERVICE.DefaultExactUnitsService.multiplyRational(reservation.quantity, '1', '1', scale, 'UNNECESSARY')) {
                throw new CLASSES.NodicsError('ERR_INV_00038', 'Assignment must match one ACTIVE reservation exactly');
            }
            allocated = SERVICE.DefaultExactUnitsService.add(allocated, quantity, scale, 'UNNECESSARY');
            return { reservationCode: reservation.code, warehouseCode: reservation.warehouseCode, stockCode: reservation.stockCode,
                quantity, state: 'ALLOCATED', movementCode: null };
        });
        let backordered = SERVICE.DefaultExactUnitsService.add(requested, this.negate(allocated), scale, 'UNNECESSARY');
        if (SERVICE.DefaultExactUnitsService.parse(backordered).unscaled < 0n || policy.allowPartial === false && backordered !== zero) throw new CLASSES.NodicsError('ERR_INV_00038', 'Allocation exceeds demand or partial allocation is disabled');
        let state = allocated === zero ? 'BACKORDERED' : backordered === zero ? 'ALLOCATED' : 'PARTIALLY_ALLOCATED';
        let code = SERVICE.DefaultInventoryEnterpriseScopeService.buildIdentity(request.enterpriseCode, 'allocation', [input.idempotencyKey]);
        let model = { code, active: true, enterpriseCode: request.enterpriseCode, allocationCode: input.idempotencyKey,
            idempotencyKey: input.idempotencyKey, demandType: input.demandType, demandCode: input.demandCode,
            demandLineCode: input.demandLineCode, itemType: input.itemType, itemCode: input.itemCode, requestedQuantity: requested,
            allocatedQuantity: allocated, backorderedQuantity: backordered, fulfilledQuantity: zero, unitCode: input.unitCode,
            scale, state, assignments, revision: 0, reasonCode: input.reasonCode, correlationId: input.correlationId };
        let existing = await this.get(code, request); if (existing) return this.assertIntent(existing, model);
        try { await SERVICE.DefaultStockAllocationService.save({ tenant: request.tenant, authData: request.authData,
            model, _stockAllocationMutationAuthorized: true }); }
        catch (error) { existing = await this.get(code, request); if (!existing) throw error; return this.assertIntent(existing, model); }
        return this.get(code, request) || model;
    },
    /** Cancels or releases an allocation and releases every still-active reservation. */
    close: async function (request, state) {
        request.enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request); let input = request.allocation || {};
        if (!input.code && !input.idempotencyKey) throw new CLASSES.NodicsError('ERR_INV_00038', 'Allocation code is required');
        let code = input.code || SERVICE.DefaultInventoryEnterpriseScopeService.buildIdentity(request.enterpriseCode, 'allocation', [input.idempotencyKey]);
        let allocation = await this.get(code, request); if (!allocation) throw new CLASSES.NodicsError('ERR_INV_00038', 'Allocation was not found');
        if (['RELEASED', 'CANCELLED'].includes(allocation.state)) return allocation;
        if (allocation.state === 'FULFILLED') throw new CLASSES.NodicsError('ERR_INV_00040', 'Fulfilled allocation cannot be released');
        for (let assignment of allocation.assignments.filter(value => value.state !== 'FULFILLED')) await SERVICE.DefaultStockReservationOrchestrationService.release(
            Object.assign({}, request, { reservation: { code: assignment.reservationCode } }), state === 'CANCELLED' ? 'CANCELLED' : 'RELEASED');
        let response = await SERVICE.DefaultStockAllocationService.update({ tenant: request.tenant, authData: request.authData,
            _stockAllocationMutationAuthorized: true, query: { code, enterpriseCode: request.enterpriseCode, revision: allocation.revision },
            model: { state, revision: Number(allocation.revision) + 1, terminalAt: new Date() } });
        if (this.affected(response) !== 1) throw new CLASSES.NodicsError('ERR_INV_00041', 'Allocation close requires reconciliation');
        return Object.assign({}, allocation, { state, revision: Number(allocation.revision) + 1 });
    },
    /** Reconciles fulfillment from APPLIED reservation-linked ISSUE movements. */
    fulfill: async function (request) {
        request.enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request); let input = request.allocation || {};
        let code = input.code || SERVICE.DefaultInventoryEnterpriseScopeService.buildIdentity(request.enterpriseCode, 'allocation', [input.idempotencyKey]);
        let allocation = await this.get(code, request); if (!allocation) throw new CLASSES.NodicsError('ERR_INV_00038', 'Allocation was not found');
        let reservationCodes = allocation.assignments.map(value => value.reservationCode);
        let movements = this.items(await SERVICE.DefaultStockMovementRecordService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: request.enterpriseCode, sourceType: 'STOCK_RESERVATION', sourceCode: { $in: reservationCodes }, state: 'APPLIED' } }));
        let movementByReservation = new Map(movements.map(value => [value.sourceCode, value])); let fulfilled = SERVICE.DefaultExactUnitsService.multiplyRational('0', '1', '1', allocation.scale, 'UNNECESSARY');
        let assignments = allocation.assignments.map(value => { let movement = movementByReservation.get(value.reservationCode);
            if (!movement) return value; fulfilled = SERVICE.DefaultExactUnitsService.add(fulfilled, value.quantity, allocation.scale, 'UNNECESSARY');
            return Object.assign({}, value, { state: 'FULFILLED', movementCode: movement.code }); });
        let state = fulfilled === allocation.allocatedQuantity && allocation.backorderedQuantity === SERVICE.DefaultExactUnitsService.multiplyRational('0', '1', '1', allocation.scale, 'UNNECESSARY') ?
            'FULFILLED' : fulfilled === SERVICE.DefaultExactUnitsService.multiplyRational('0', '1', '1', allocation.scale, 'UNNECESSARY') ? allocation.state : 'PARTIALLY_FULFILLED';
        let response = await SERVICE.DefaultStockAllocationService.update({ tenant: request.tenant, authData: request.authData,
            _stockAllocationMutationAuthorized: true, query: { code, enterpriseCode: request.enterpriseCode, revision: allocation.revision },
            model: { assignments, fulfilledQuantity: fulfilled, state, revision: Number(allocation.revision) + 1,
                terminalAt: state === 'FULFILLED' ? new Date() : undefined } });
        if (this.affected(response) !== 1) throw new CLASSES.NodicsError('ERR_INV_00041', 'Allocation fulfillment revision conflict');
        return Object.assign({}, allocation, { assignments, fulfilledQuantity: fulfilled, state, revision: Number(allocation.revision) + 1 });
    }
};
