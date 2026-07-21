/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/service/operations/DefaultInventoryOperationsService @description Provides bounded read-only operational projections without exposing generated Inventory CRUD. @layer service @owner inventory */
module.exports = {
    /** Initializes operations. */ init: function () { return Promise.resolve(true); },
    /** Completes initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Defines explicit service, filter, and projection ownership per operational resource. */
    resources: function () { return {
        balances: { service: 'DefaultStockBalanceService', filters: ['warehouseCode', 'itemType', 'itemCode', 'unitCode'], fields: ['code', 'warehouseCode', 'locationCode', 'itemType', 'itemCode', 'quantity', 'reservedQuantity', 'unitCode', 'scale', 'revision', 'lastMovementCode', 'lastReservationCode', 'updatedAt'] },
        movements: { service: 'DefaultStockMovementRecordService', filters: ['stockCode', 'movementType', 'state', 'sourceType', 'sourceCode', 'correlationId'], fields: ['code', 'stockCode', 'movementType', 'state', 'originalQuantity', 'originalUnitCode', 'normalizedDelta', 'balanceUnitCode', 'resultingRevision', 'reasonCode', 'sourceType', 'sourceCode', 'correlationId', 'failureCode', 'createdAt', 'updatedAt'] },
        reservations: { service: 'DefaultStockReservationService', filters: ['stockCode', 'warehouseCode', 'itemType', 'itemCode', 'state', 'ownerType', 'ownerCode'], fields: ['code', 'stockCode', 'warehouseCode', 'locationCode', 'itemType', 'itemCode', 'quantity', 'unitCode', 'scale', 'state', 'expiresAt', 'ownerType', 'ownerCode', 'reasonCode', 'correlationId', 'terminalAt', 'failureCode', 'updatedAt'] },
        allocations: { service: 'DefaultStockAllocationService', filters: ['demandType', 'demandCode', 'demandLineCode', 'itemType', 'itemCode', 'state'], fields: ['code', 'demandType', 'demandCode', 'demandLineCode', 'itemType', 'itemCode', 'requestedQuantity', 'allocatedQuantity', 'backorderedQuantity', 'fulfilledQuantity', 'unitCode', 'scale', 'state', 'assignments', 'revision', 'reasonCode', 'correlationId', 'failureCode', 'updatedAt'] },
        transfers: { service: 'DefaultStockTransferService', filters: ['state', 'sourceWarehouseCode', 'destinationWarehouseCode', 'itemType', 'itemCode'], fields: ['code', 'itemType', 'itemCode', 'unitCode', 'scale', 'requestedQuantity', 'dispatchedQuantity', 'receivedQuantity', 'damagedQuantity', 'lostQuantity', 'sourceWarehouseCode', 'destinationWarehouseCode', 'state', 'operations', 'revision', 'reasonCode', 'correlationId', 'failureCode', 'updatedAt'] },
        findings: { service: 'DefaultStockReconciliationFindingService', filters: ['runCode', 'type', 'severity', 'state', 'subjectType', 'subjectCode'], fields: ['code', 'runCode', 'type', 'severity', 'state', 'subjectType', 'subjectCode', 'expected', 'actual', 'repairable', 'approvalMode', 'approvedBy', 'approvedAt', 'workflowCarrierCode', 'repairMovementCode', 'resolutionNote', 'terminalAt', 'updatedAt'] }
    }; },
    /** Copies allow-listed fields into a detached safe projection. */ project: function (item, fields) { return fields.reduce((result, field) => { if (item[field] !== undefined) result[field] = item[field]; return result; }, {}); },
    /** Lists one operational resource with exact scalar filters only. */
    list: async function (resourceName, request) { request.enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request); let resource = this.resources()[resourceName]; if (!resource || !SERVICE[resource.service]) throw new CLASSES.NodicsError('ERR_INV_00029', 'Unsupported Inventory operational resource'); let input = request.query || {}; let unknown = Object.keys(input).filter(key => !resource.filters.includes(key) && !['limit', 'page'].includes(key)); if (unknown.length || Object.values(input).some(value => value && typeof value === 'object')) throw new CLASSES.NodicsError('ERR_INV_00029', 'Inventory operational filters are invalid'); let policy = ((CONFIG.get('inventory') || {}).operations) || {}; let maximum = Number(policy.maximumResultCount || 500); let limit = Math.min(maximum, Math.max(1, Number(input.limit) || maximum)); let page = Math.max(1, Number(input.page) || 1); let query = { enterpriseCode: request.enterpriseCode }; resource.filters.forEach(key => { if (input[key] !== undefined) query[key] = input[key]; }); let response = await SERVICE[resource.service].get({ tenant: request.tenant, authData: request.authData, query, searchOptions: { pageSize: limit, pageNumber: page, sort: { updatedAt: -1, code: 1 } } }); let items = response && Array.isArray(response.result) ? response.result : []; return { resource: resourceName, page, limit, count: items.length, items: items.map(item => this.project(item, resource.fields)) }; }
};
