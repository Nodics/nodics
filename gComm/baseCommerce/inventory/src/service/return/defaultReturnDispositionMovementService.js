/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module inventory/service/return/DefaultReturnDispositionMovementService
 * @description Executes Fulfillment return disposition intent through Inventory-owned Stock Movement evidence.
 * @layer service
 * @owner inventory
 * @override Project modules may replace disposition-to-stock resolution while preserving service identity, Stock Movement authority, exact quantities, and idempotency.
 */
module.exports = {
    /** Initializes return disposition movement execution. */
    init: function () { return Promise.resolve(true); },
    /** Completes return disposition movement startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered disposition execution policy. */
    policy: function () { return (((CONFIG.get('inventory') || {}).stockAllocation || {}).returnDisposition) || {}; },
    /** Creates a stable Inventory disposition error. */
    error: function (message, code) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(code || 'ERR_INV_00053', message);
        let error = new Error(message);
        error.code = code || 'ERR_INV_00053';
        return error;
    },
    /** Enforces service identity for Inventory mutation intent execution. */
    authorize: function (request) {
        if (this.policy().requireServiceToken !== false && (!request.authData || request.authData.tokenType !== 'service')) {
            throw this.error('Return disposition movement requires an internal service identity', 'ERR_INV_00054');
        }
    },
    /** Extracts generated-service result items. */
    items: function (response) {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (Array.isArray(response.result)) return response.result;
        if (Array.isArray(response.items)) return response.items;
        return [response];
    },
    /** Converts external source references into one Inventory identity-safe part. */
    identityPart: function (value) {
        return String(value || 'none').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'none';
    },
    /** Loads one Stock Allocation by internal code or business allocation code. */
    loadAllocation: async function (code, request) {
        let service = SERVICE.DefaultStockAllocationService;
        if (!service || typeof service.get !== 'function') throw this.error('Stock Allocation service is unavailable');
        let byInternalCode = this.items(await service.get({
            tenant: request.tenant,
            authData: request.authData,
            query: { enterpriseCode: request.enterpriseCode, code: code },
            searchOptions: { limit: 2 },
        }));
        if (byInternalCode.length > 1) throw this.error('Return disposition allocation resolved duplicate internal codes');
        if (byInternalCode.length === 1) return byInternalCode[0];
        let byBusinessCode = this.items(await service.get({
            tenant: request.tenant,
            authData: request.authData,
            query: { enterpriseCode: request.enterpriseCode, allocationCode: code },
            searchOptions: { limit: 2 },
        }));
        if (byBusinessCode.length !== 1) throw this.error('Return disposition allocation was not found');
        return byBusinessCode[0];
    },
    /** Loads the current target Stock Balance when it already exists. */
    loadBalance: async function (stockCode, request) {
        let service = SERVICE.DefaultStockBalanceService;
        if (!service || typeof service.get !== 'function') throw this.error('Stock Balance service is unavailable');
        let balances = this.items(await service.get({
            tenant: request.tenant,
            authData: request.authData,
            query: { enterpriseCode: request.enterpriseCode, code: stockCode },
            searchOptions: { limit: 2 },
        }));
        if (balances.length > 1) throw this.error('Return disposition stock balance resolved duplicate records');
        return balances[0];
    },
    /** Loads existing Stock Movement evidence by idempotency key for replay-safe execution. */
    loadMovement: async function (idempotencyKey, request) {
        let service = SERVICE.DefaultStockMovementRecordService;
        if (!service || typeof service.get !== 'function') throw this.error('Stock Movement Record service is unavailable');
        let movements = this.items(await service.get({
            tenant: request.tenant,
            authData: request.authData,
            query: { enterpriseCode: request.enterpriseCode, idempotencyKey: idempotencyKey },
            searchOptions: { limit: 2 },
        }));
        if (movements.length > 1) throw this.error('Return disposition movement resolved duplicate idempotency records');
        return movements[0];
    },
    /** Builds the movement idempotency key for one return allocation assignment. */
    movementIdempotencyKey: function (intent, dispositionCode, allocation, assignment) {
        return [intent.sourceCode, dispositionCode, assignment.reservationCode || allocation.allocationCode || allocation.code].filter(Boolean).map(value => this.identityPart(value)).join('-');
    },
    /** Builds the target Stock object and revision for one returned allocation assignment. */
    targetStock: async function (allocation, assignment, dispositionCode, request) {
        let sourceBalance = await this.loadBalance(assignment.stockCode, request);
        if (!sourceBalance) throw this.error('Return disposition source Stock Balance was not found');
        let conditionCode = (this.policy().conditionCodeByDisposition || {})[dispositionCode] || sourceBalance.conditionCode;
        let stock = {
            warehouseCode: sourceBalance.warehouseCode || assignment.warehouseCode,
            locationCode: sourceBalance.locationCode,
            itemType: sourceBalance.itemType || allocation.itemType,
            itemCode: sourceBalance.itemCode || allocation.itemCode,
            batchCode: sourceBalance.batchCode,
            conditionCode: conditionCode,
            ownerCode: sourceBalance.ownerCode,
            unitCode: sourceBalance.unitCode || allocation.unitCode,
            scale: sourceBalance.scale === undefined ? allocation.scale : sourceBalance.scale,
        };
        let targetCode = SERVICE.DefaultStockMovementService.stockCode(request.enterpriseCode, stock);
        let targetBalance = targetCode === sourceBalance.code ? sourceBalance : await this.loadBalance(targetCode, request);
        return { stock: stock, expectedRevision: targetBalance ? Number(targetBalance.revision) : 0 };
    },
    /** Executes one return disposition intent through Stock Movement evidence. */
    execute: async function (request) {
        request = request || {};
        this.authorize(request);
        request.enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request);
        let intent = request.dispositionIntent || request.inventoryDispositionIntent || request.body || {};
        let dispositionCode = intent.dispositionCode;
        let movementType = (this.policy().movementTypeByDisposition || {})[dispositionCode] || intent.movementType;
        if (!intent.sourceCode || !dispositionCode || !movementType) {
            throw this.error('Return disposition movement requires sourceCode, dispositionCode, and movementType');
        }
        let allocationCodes = intent.inventoryAllocationCodes || intent.allocationCodes || [];
        if (!Array.isArray(allocationCodes) || !allocationCodes.length) {
            return {
                status: 'NO_INVENTORY_DISPOSITION_REQUIRED',
                sourceCode: intent.sourceCode,
                dispositionCode: dispositionCode,
                movementType: movementType,
                movements: [],
            };
        }
        if (allocationCodes.length > Number(this.policy().maximumDispositionAllocations || 100)) {
            throw this.error('Return disposition movement exceeds configured allocation bounds');
        }
        let movements = [];
        for (let allocationCode of allocationCodes) {
            let allocation = await this.loadAllocation(allocationCode, request);
            for (let assignment of (allocation.assignments || [])) {
                let idempotencyKey = this.movementIdempotencyKey(intent, dispositionCode, allocation, assignment);
                let existingMovement = await this.loadMovement(idempotencyKey, request);
                if (existingMovement && existingMovement.state !== 'PENDING') {
                    movements.push(existingMovement);
                    continue;
                }
                let target = await this.targetStock(allocation, assignment, dispositionCode, request);
                let movement = await SERVICE.DefaultStockMovementService.apply({
                    tenant: request.tenant,
                    authData: request.authData,
                    stock: target.stock,
                    movement: {
                        idempotencyKey: idempotencyKey,
                        movementType: movementType,
                        quantity: assignment.quantity,
                        unitCode: allocation.unitCode,
                        expectedRevision: target.expectedRevision,
                        reasonCode: intent.reasonCode || [(this.policy().reasonCodePrefix || 'RETURN_DISPOSITION'), dispositionCode].join('_'),
                        sourceType: intent.sourceType || 'FULFILLMENT_RETURN',
                        sourceCode: intent.sourceCode,
                        correlationId: intent.correlationId || request.workflowCarrierCode || request.idempotencyKey,
                    },
                });
                movements.push(movement);
            }
        }
        return {
            status: 'INVENTORY_DISPOSITION_APPLIED',
            sourceCode: intent.sourceCode,
            dispositionCode: dispositionCode,
            movementType: movementType,
            movements: movements,
        };
    },
    /** Provides safe Inventory-owned recovery guidance for return disposition movement evidence. */
    reviewDispositionRecovery: async function (request) {
        request = request || {};
        this.authorize(request);
        request.enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request);
        let intent = request.dispositionIntent || request.inventoryDispositionIntent || request.body || {};
        let dispositionCode = intent.dispositionCode;
        let movementType = (this.policy().movementTypeByDisposition || {})[dispositionCode] || intent.movementType;
        if (!intent.sourceCode || !dispositionCode || !movementType) {
            throw this.error('Return disposition recovery requires sourceCode, dispositionCode, and movementType');
        }
        let allocationCodes = intent.inventoryAllocationCodes || intent.allocationCodes || [];
        let movements = [];
        if (Array.isArray(allocationCodes)) {
            for (let allocationCode of allocationCodes) {
                let allocation = await this.loadAllocation(allocationCode, request);
                for (let assignment of (allocation.assignments || [])) {
                    let idempotencyKey = this.movementIdempotencyKey(intent, dispositionCode, allocation, assignment);
                    let movement = await this.loadMovement(idempotencyKey, request);
                    if (movement) movements.push(movement);
                }
            }
        }
        let recovery = this.policy().recovery || {};
        let expectedMovementCount = Array.isArray(allocationCodes) ? allocationCodes.length : 0;
        let recovered = expectedMovementCount === 0 || movements.length > 0;
        return {
            recovered: recovered,
            recoveryAction: request.recoveryAction || 'REVIEW_DISPOSITION_MOVEMENT',
            recoveryOwner: 'inventory',
            recoveryStatus: recovered ? 'MOVEMENT_FOUND' : 'MOVEMENT_REVIEW_REQUIRED',
            sourceCode: intent.sourceCode,
            dispositionCode: dispositionCode,
            movementType: movementType,
            movementCodes: movements.map(item => item.code || item.movementCode).filter(Boolean),
            movements: movements,
            nextActions: recovered ? [] : (recovery.reviewActions || ['REVIEW_DISPOSITION_MOVEMENT']),
        };
    },
};
