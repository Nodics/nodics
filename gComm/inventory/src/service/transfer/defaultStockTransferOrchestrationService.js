/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/service/transfer/DefaultStockTransferOrchestrationService @description Coordinates paired source and destination Stock Movements with recoverable transfer evidence. @layer service @owner inventory */
module.exports = {
    /** Initializes transfers. */ init: function () { return Promise.resolve(true); }, /** Completes initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Allows only orchestration writes. */ authorizeInternalMutation: function (request) { return request && request._stockTransferMutationAuthorized === true ? Promise.resolve(true) : Promise.reject(new CLASSES.NodicsError('ERR_INV_00043', 'Transfer state can change only through orchestration')); },
    /** Rejects deletion. */ rejectDelete: function () { return Promise.reject(new CLASSES.NodicsError('ERR_INV_00043', 'Transfer evidence cannot be deleted')); },
    /** Extracts items. */ items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Extracts affected count. */ affected: function (response) { let value = response && response.result !== undefined ? response.result : response; return value && (value.modifiedCount !== undefined ? value.modifiedCount : value.nModified !== undefined ? value.nModified : value.n) || 0; },
    /** Negates exact quantity. */ negate: function (value) { let parsed = SERVICE.DefaultExactUnitsService.parse(value); return SERVICE.DefaultExactUnitsService.format(-parsed.unscaled, parsed.scale); },
    /** Loads one transfer. */ get: async function (code, request) { return this.items(await SERVICE.DefaultStockTransferService.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: request.enterpriseCode, code }, searchOptions: { limit: 1 } }))[0]; },
    /** Creates an immutable transfer intent. */ create: async function (request) {
        request.enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request); let input = request.transfer || {};
        ['idempotencyKey', 'itemType', 'itemCode', 'unitCode', 'requestedQuantity', 'sourceStockCode', 'destinationStockCode', 'sourceWarehouseCode', 'destinationWarehouseCode', 'reasonCode'].forEach(field => { if (!input[field]) throw new CLASSES.NodicsError('ERR_INV_00043', 'Transfer ' + field + ' is required'); });
        if (input.sourceStockCode === input.destinationStockCode || input.sourceWarehouseCode === input.destinationWarehouseCode) throw new CLASSES.NodicsError('ERR_INV_00043', 'Transfer source and destination must differ');
        let scale = Number(input.scale === undefined ? 6 : input.scale); let quantity = SERVICE.DefaultExactUnitsService.multiplyRational(input.requestedQuantity, '1', '1', scale, 'UNNECESSARY');
        if (SERVICE.DefaultExactUnitsService.parse(quantity).unscaled <= 0n) throw new CLASSES.NodicsError('ERR_INV_00043', 'Transfer quantity must be positive');
        let code = SERVICE.DefaultInventoryEnterpriseScopeService.buildIdentity(request.enterpriseCode, 'transfer', [input.idempotencyKey]); let existing = await this.get(code, request);
        if (existing) { if (existing.sourceStockCode === input.sourceStockCode && existing.destinationStockCode === input.destinationStockCode && existing.requestedQuantity === quantity) return existing; throw new CLASSES.NodicsError('ERR_INV_00044', 'Transfer idempotency conflict'); }
        let zero = SERVICE.DefaultExactUnitsService.multiplyRational('0', '1', '1', scale, 'UNNECESSARY'); let model = Object.assign({}, input, { code, active: true, enterpriseCode: request.enterpriseCode, transferCode: input.idempotencyKey, requestedQuantity: quantity, dispatchedQuantity: zero, receivedQuantity: zero, damagedQuantity: zero, lostQuantity: zero, scale, state: 'DRAFT', operations: [], revision: 0 });
        await SERVICE.DefaultStockTransferService.save({ tenant: request.tenant, authData: request.authData, model, _stockTransferMutationAuthorized: true }); return this.get(code, request) || model;
    },
    /** Persists one transfer revision after its idempotent movement completes. */ update: async function (transfer, patch, request) { let response = await SERVICE.DefaultStockTransferService.update({ tenant: request.tenant, authData: request.authData, _stockTransferMutationAuthorized: true, query: { code: transfer.code, enterpriseCode: request.enterpriseCode, revision: transfer.revision }, model: Object.assign({}, patch, { revision: Number(transfer.revision) + 1 }) }); if (this.affected(response) !== 1) throw new CLASSES.NodicsError('ERR_INV_00046', 'Transfer revision conflict'); return Object.assign({}, transfer, patch, { revision: Number(transfer.revision) + 1 }); },
    /** Dispatches an exact partial or complete quantity through TRANSFER_OUT. */ dispatch: async function (request) { return this.move(request, 'DISPATCH'); },
    /** Receives an exact partial or complete quantity through TRANSFER_IN. */ receive: async function (request) { return this.move(request, 'RECEIVE'); },
    /** Applies one idempotent transfer leg through Stock Movement. */ move: async function (request, operationType) {
        request.enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request); let input = request.transfer || {}; let transfer = await this.get(input.code, request);
        if (!transfer || !input.operationKey || !input.quantity || !Number.isInteger(Number(input.expectedRevision))) throw new CLASSES.NodicsError('ERR_INV_00043', 'Transfer operation is invalid');
        let prior = transfer.operations.find(value => value.operationKey === input.operationKey); if (prior) return transfer;
        if (transfer.operations.length >= Number((((CONFIG.get('inventory') || {}).stockTransfer || {}).maximumOperations || 1000))) throw new CLASSES.NodicsError('ERR_INV_00046', 'Transfer operation boundary exceeded');
        let quantity = SERVICE.DefaultExactUnitsService.multiplyRational(input.quantity, '1', '1', transfer.scale, 'UNNECESSARY'); if (SERVICE.DefaultExactUnitsService.parse(quantity).unscaled <= 0n) throw new CLASSES.NodicsError('ERR_INV_00043', 'Operation quantity must be positive');
        let dispatched = transfer.dispatchedQuantity; let received = transfer.receivedQuantity; let stockCode; let warehouseCode; let movementType; let delta;
        if (operationType === 'DISPATCH') { if (!['DRAFT', 'IN_TRANSIT'].includes(transfer.state)) throw new CLASSES.NodicsError('ERR_INV_00045', 'Transfer cannot dispatch'); dispatched = SERVICE.DefaultExactUnitsService.add(dispatched, quantity, transfer.scale, 'UNNECESSARY'); if (SERVICE.DefaultExactUnitsService.parse(SERVICE.DefaultExactUnitsService.add(transfer.requestedQuantity, this.negate(dispatched), transfer.scale, 'UNNECESSARY')).unscaled < 0n) throw new CLASSES.NodicsError('ERR_INV_00045', 'Dispatch exceeds request'); stockCode = transfer.sourceStockCode; warehouseCode = transfer.sourceWarehouseCode; movementType = 'TRANSFER_OUT'; delta = this.negate(quantity); }
        else { if (!['IN_TRANSIT', 'PARTIALLY_RECEIVED'].includes(transfer.state)) throw new CLASSES.NodicsError('ERR_INV_00045', 'Transfer cannot receive'); received = SERVICE.DefaultExactUnitsService.add(received, quantity, transfer.scale, 'UNNECESSARY'); if (SERVICE.DefaultExactUnitsService.parse(SERVICE.DefaultExactUnitsService.add(dispatched, this.negate(received), transfer.scale, 'UNNECESSARY')).unscaled < 0n) throw new CLASSES.NodicsError('ERR_INV_00045', 'Receipt exceeds dispatch'); stockCode = transfer.destinationStockCode; warehouseCode = transfer.destinationWarehouseCode; movementType = 'TRANSFER_IN'; delta = quantity; }
        let movement = await SERVICE.DefaultStockMovementService.apply({ tenant: request.tenant, authData: request.authData, stock: { warehouseCode, itemType: transfer.itemType, itemCode: transfer.itemCode, unitCode: transfer.unitCode, scale: transfer.scale }, movement: { idempotencyKey: transfer.transferCode + ':' + input.operationKey, movementType, quantity: delta, expectedRevision: Number(input.expectedRevision), reasonCode: transfer.reasonCode, sourceType: 'STOCK_TRANSFER', sourceCode: transfer.code, correlationId: transfer.correlationId } });
        let operations = transfer.operations.concat([{ operationKey: input.operationKey, type: operationType, quantity, movementCode: movement.code }]); let state = operationType === 'DISPATCH' ? 'IN_TRANSIT' : received === transfer.requestedQuantity ? 'RECEIVED' : 'PARTIALLY_RECEIVED';
        return this.update(transfer, { dispatchedQuantity: dispatched, receivedQuantity: received, operations, state, terminalAt: state === 'RECEIVED' ? new Date() : undefined }, request);
    },
    /** Cancels only an undispatched transfer. */ cancel: async function (request) { request.enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request); let transfer = await this.get((request.transfer || {}).code, request); if (!transfer || transfer.state !== 'DRAFT') throw new CLASSES.NodicsError('ERR_INV_00045', 'Only undispatched DRAFT transfer can be cancelled'); return this.update(transfer, { state: 'CANCELLED', terminalAt: new Date() }, request); },
    /** Records bounded damage, loss, or rejected-receipt evidence without fabricating Stock movement. */
    discrepancy: async function (request) {
        request.enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request); let input = request.transfer || {}; let transfer = await this.get(input.code, request); let policy = ((CONFIG.get('inventory') || {}).stockTransfer) || {};
        if (!transfer || !input.operationKey || !(policy.discrepancyTypes || []).includes(input.type) || !input.quantity) throw new CLASSES.NodicsError('ERR_INV_00043', 'Transfer discrepancy is invalid');
        if (transfer.operations.some(value => value.operationKey === input.operationKey)) return transfer;
        if (!['IN_TRANSIT', 'PARTIALLY_RECEIVED', 'RECONCILIATION_REQUIRED'].includes(transfer.state)) throw new CLASSES.NodicsError('ERR_INV_00045', 'Transfer cannot accept discrepancy evidence');
        let quantity = SERVICE.DefaultExactUnitsService.multiplyRational(input.quantity, '1', '1', transfer.scale, 'UNNECESSARY'); if (SERVICE.DefaultExactUnitsService.parse(quantity).unscaled <= 0n) throw new CLASSES.NodicsError('ERR_INV_00043', 'Discrepancy quantity must be positive');
        let damaged = transfer.damagedQuantity; let lost = transfer.lostQuantity; if (['DAMAGED', 'REJECTED'].includes(input.type)) damaged = SERVICE.DefaultExactUnitsService.add(damaged, quantity, transfer.scale, 'UNNECESSARY'); else lost = SERVICE.DefaultExactUnitsService.add(lost, quantity, transfer.scale, 'UNNECESSARY');
        let accounted = SERVICE.DefaultExactUnitsService.add(transfer.receivedQuantity, SERVICE.DefaultExactUnitsService.add(damaged, lost, transfer.scale, 'UNNECESSARY'), transfer.scale, 'UNNECESSARY');
        if (SERVICE.DefaultExactUnitsService.parse(SERVICE.DefaultExactUnitsService.add(transfer.dispatchedQuantity, this.negate(accounted), transfer.scale, 'UNNECESSARY')).unscaled < 0n) throw new CLASSES.NodicsError('ERR_INV_00045', 'Discrepancy exceeds dispatched quantity');
        return this.update(transfer, { damagedQuantity: damaged, lostQuantity: lost, state: 'RECONCILIATION_REQUIRED', operations: transfer.operations.concat([{ operationKey: input.operationKey, type: input.type, quantity, reasonCode: input.reasonCode }]) }, request);
    },
    /** Reconciles dispatched quantity against received and discrepancy evidence. */
    reconcile: async function (request) {
        request.enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request); let transfer = await this.get((request.transfer || {}).code, request); if (!transfer) throw new CLASSES.NodicsError('ERR_INV_00043', 'Transfer was not found');
        let zero = SERVICE.DefaultExactUnitsService.multiplyRational('0', '1', '1', transfer.scale, 'UNNECESSARY'); let accounted = SERVICE.DefaultExactUnitsService.add(transfer.receivedQuantity, SERVICE.DefaultExactUnitsService.add(transfer.damagedQuantity, transfer.lostQuantity, transfer.scale, 'UNNECESSARY'), transfer.scale, 'UNNECESSARY');
        let complete = accounted === transfer.dispatchedQuantity && transfer.dispatchedQuantity === transfer.requestedQuantity; let state = !complete ? 'RECONCILIATION_REQUIRED' : transfer.damagedQuantity === zero && transfer.lostQuantity === zero ? 'RECEIVED' : 'COMPLETED_WITH_DISCREPANCY';
        return state === transfer.state ? transfer : this.update(transfer, { state, terminalAt: complete ? new Date() : undefined }, request);
    },
    /** Creates a new reverse transfer while preserving original evidence. */
    returnTransfer: async function (request) {
        request.enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request); let input = request.transfer || {}; let original = await this.get(input.code, request);
        if (!original || !['RECEIVED', 'COMPLETED_WITH_DISCREPANCY'].includes(original.state)) throw new CLASSES.NodicsError('ERR_INV_00045', 'Only completed transfers can create returns');
        return this.create(Object.assign({}, request, { transfer: { idempotencyKey: input.idempotencyKey, itemType: original.itemType, itemCode: original.itemCode, unitCode: original.unitCode, requestedQuantity: input.quantity, scale: original.scale, sourceStockCode: original.destinationStockCode, destinationStockCode: original.sourceStockCode, sourceWarehouseCode: original.destinationWarehouseCode, destinationWarehouseCode: original.sourceWarehouseCode, reasonCode: input.reasonCode || 'TRANSFER_RETURN', parentTransferCode: original.code, correlationId: original.correlationId } }));
    }
};
