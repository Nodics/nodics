/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module inventory/service/stock/DefaultStockMovementService
 * @description Orchestrates exact, idempotent, optimistic Stock Movement application and partial-write recovery.
 * @layer service
 * @owner inventory
 * @override Projects may extend validation and movement types while preserving Units exactness, Warehouse authority, CAS, and immutable evidence.
 */
module.exports = {
    /** Initializes Stock Movement orchestration. */ init: function () { return Promise.resolve(true); },
    /** Completes Stock Movement initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns Stock policy. */ policy: function () { return ((CONFIG.get('inventory') || {}).stock) || {}; },
    /** Produces a stable identity component for an optional stock discriminator. */ part: function (value) { return value || 'none'; },
    /** Allows persistence only when invoked by the owning Stock repository. */
    authorizeInternalMutation: function (request) {
        if (!request || request._stockMutationAuthorized !== true) return Promise.reject(new CLASSES.NodicsError('ERR_INV_00011', 'Stock state can change only through Stock Movement orchestration'));
        return Promise.resolve(true);
    },
    /** Rejects destructive removal of Stock balances and Movement evidence. */
    rejectDelete: function () { return Promise.reject(new CLASSES.NodicsError('ERR_INV_00011', 'Stock evidence cannot be deleted')); },
    /** Builds the immutable Stock Balance identity from enterprise, facility, item, and optional discriminators. */
    stockCode: function (enterpriseCode, stock) {
        return SERVICE.DefaultInventoryEnterpriseScopeService.buildIdentity(enterpriseCode, 'stock', [stock.warehouseCode,
            this.part(stock.locationCode), stock.itemType, stock.itemCode, this.part(stock.batchCode),
            this.part(stock.conditionCode), this.part(stock.ownerCode)]);
    },
    /** Validates Warehouse and optional Location references in the co-hosted Inventory foundation. */
    validateFacilityReferences: async function (request, stock) {
        let warehouses = await SERVICE.DefaultWarehouseService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: request.enterpriseCode, warehouseCode: stock.warehouseCode }, searchOptions: { limit: 2 } });
        if (!warehouses.result || warehouses.result.length !== 1 || warehouses.result[0].status === 'RETIRED') throw new CLASSES.NodicsError('ERR_INV_00011', 'Stock requires an active Warehouse');
        if (stock.locationCode) {
            let locations = await SERVICE.DefaultWarehouseLocationService.get({ tenant: request.tenant, authData: request.authData,
                query: { enterpriseCode: request.enterpriseCode, warehouseCode: stock.warehouseCode, locationCode: stock.locationCode }, searchOptions: { limit: 2 } });
            if (!locations.result || locations.result.length !== 1 || locations.result[0].status === 'RETIRED') throw new CLASSES.NodicsError('ERR_INV_00011', 'Stock Location is unavailable');
        }
        return true;
    },
    /** Applies one idempotent exact Stock Movement. */
    apply: async function (request) {
        request = request || {}; let stock = request.stock || {}; let input = request.movement || {};
        request.enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request);
        ['warehouseCode', 'itemType', 'itemCode', 'unitCode'].forEach(field => SERVICE.DefaultInventoryEnterpriseScopeService.validateBusinessCode(stock[field], 'Stock ' + field));
        let policy = this.policy();
        if (!(policy.movementTypes || []).includes(input.movementType) || !input.idempotencyKey || !input.reasonCode) throw new CLASSES.NodicsError('ERR_INV_00011', 'Stock Movement identity, type, and reason are required');
        await this.validateFacilityReferences(request, stock); let scale = Number(stock.scale === undefined ? policy.defaultScale || 6 : stock.scale);
        let originalUnitCode = input.unitCode || stock.unitCode;
        SERVICE.DefaultInventoryEnterpriseScopeService.validateBusinessCode(originalUnitCode, 'Movement unitCode');
        let stockCode = this.stockCode(request.enterpriseCode, stock);
        let expected = Number(input.expectedRevision);
        if (!Number.isInteger(expected)) throw new CLASSES.NodicsError('ERR_INV_00013', 'Expected Stock revision is required');
        let movementCode = SERVICE.DefaultInventoryEnterpriseScopeService.buildIdentity(request.enterpriseCode, 'movement', [input.idempotencyKey]);
        let intent = { stockCode: stockCode, originalQuantity: input.quantity, originalUnitCode: originalUnitCode,
            balanceUnitCode: stock.unitCode, movementType: input.movementType, reasonCode: input.reasonCode, expectedRevision: expected };
        let movement = await SERVICE.DefaultStockRepositoryService.getMovement(movementCode, request);
        let balance; let normalizedDelta;
        if (movement) {
            SERVICE.DefaultStockRepositoryService.assertMatchingIntent(movement, intent);
            if (movement.state !== 'PENDING') return movement;
            balance = await SERVICE.DefaultStockRepositoryService.getBalance(stockCode, request);
            if (!balance) throw new CLASSES.NodicsError('ERR_INV_00015', 'Pending Stock Movement has no recoverable balance');
            normalizedDelta = movement.normalizedDelta;
        } else {
            let units = await SERVICE.DefaultInventoryUnitsReferenceProviderService.convert(request, {
                quantity: input.quantity, fromUnitCode: originalUnitCode, toUnitCode: stock.unitCode, targetScale: scale,
                roundingMode: policy.roundingMode || 'UNNECESSARY', geography: input.geography, at: input.at
            });
            let unit = units.toUnit; normalizedDelta = units.quantity;
            balance = await SERVICE.DefaultStockRepositoryService.getBalance(stockCode, request);
            if (!balance) balance = await SERVICE.DefaultStockRepositoryService.createBalance({ code: stockCode, active: true,
                enterpriseCode: request.enterpriseCode, warehouseCode: stock.warehouseCode, locationCode: stock.locationCode,
                itemType: stock.itemType, itemCode: stock.itemCode, batchCode: stock.batchCode, conditionCode: stock.conditionCode,
                ownerCode: stock.ownerCode, unitCode: stock.unitCode, dimensionVector: unit.dimensionVector,
                quantity: SERVICE.DefaultExactUnitsService.multiplyRational('0', '1', '1', scale, 'UNNECESSARY'), scale: scale, revision: 0 }, request);
            if (balance.unitCode !== stock.unitCode || SERVICE.DefaultUnitsConversionPolicyService.vectorKey(balance.dimensionVector) !==
                SERVICE.DefaultUnitsConversionPolicyService.vectorKey(unit.dimensionVector)) throw new CLASSES.NodicsError('ERR_INV_00011', 'Stock Unit or dimension cannot change');
            movement = await SERVICE.DefaultStockRepositoryService.createMovement({ code: movementCode, active: true,
                enterpriseCode: request.enterpriseCode, idempotencyKey: input.idempotencyKey, stockCode: stockCode,
                movementType: input.movementType, state: 'PENDING', originalQuantity: input.quantity, originalUnitCode: originalUnitCode,
                normalizedDelta: normalizedDelta, balanceUnitCode: stock.unitCode, scale: scale, roundingMode: policy.roundingMode || 'UNNECESSARY',
                conversionCode: units.conversion && units.conversion.conversionCode, geography: input.geography,
                expectedRevision: expected, reasonCode: input.reasonCode, sourceType: input.sourceType, sourceCode: input.sourceCode,
                correlationId: input.correlationId, actorCode: request.authData && (request.authData.principalId || request.authData.code) }, request);
            normalizedDelta = movement.normalizedDelta;
            if (movement.state !== 'PENDING') return movement;
        }
        balance = await SERVICE.DefaultStockRepositoryService.getBalance(stockCode, request);
        if (balance.lastMovementCode === movement.code && Number(balance.revision) === expected + 1) {
            return SERVICE.DefaultStockRepositoryService.completeMovement(movement, 'APPLIED', { resultingRevision: balance.revision,
                resultingQuantity: balance.quantity }, request);
        }
        if (Number(balance.revision) !== expected) {
            await SERVICE.DefaultStockRepositoryService.completeMovement(movement, 'REJECTED', { failureCode: 'REVISION_CONFLICT' }, request);
            throw new CLASSES.NodicsError('ERR_INV_00013', 'Stock Balance revision conflict');
        }
        let resulting = SERVICE.DefaultExactUnitsService.add(balance.quantity, normalizedDelta, scale, policy.roundingMode || 'UNNECESSARY');
        if (policy.allowNegative !== true && SERVICE.DefaultExactUnitsService.parse(resulting).unscaled < 0n) {
            await SERVICE.DefaultStockRepositoryService.completeMovement(movement, 'REJECTED', { failureCode: 'NEGATIVE_STOCK' }, request);
            throw new CLASSES.NodicsError('ERR_INV_00014', 'Stock Movement would create a negative balance');
        }
        let reservationPatch;
        if (movement.sourceType === 'STOCK_RESERVATION') {
            let reservationResponse = await SERVICE.DefaultStockReservationService.get({ tenant: request.tenant, authData: request.authData,
                query: { enterpriseCode: request.enterpriseCode, code: movement.sourceCode }, searchOptions: { limit: 1 } });
            let reservation = reservationResponse.result && reservationResponse.result[0];
            let expectedReservationDelta = reservation && SERVICE.DefaultExactUnitsService.multiplyRational(
                '-' + reservation.quantity.replace(/^-/, ''), '1', '1', scale, policy.roundingMode || 'UNNECESSARY');
            if (!reservation || reservation.state !== 'CONSUMED' || reservation.stockCode !== balance.code ||
                movement.movementType !== 'ISSUE' || normalizedDelta !== expectedReservationDelta) {
                throw new CLASSES.NodicsError('ERR_INV_00035', 'Consumed Stock Reservation does not match the ISSUE movement');
            }
            let reservedQuantity = balance.reservedQuantity || SERVICE.DefaultExactUnitsService.multiplyRational('0', '1', '1', scale, 'UNNECESSARY');
            reservedQuantity = SERVICE.DefaultExactUnitsService.add(reservedQuantity, normalizedDelta, scale, policy.roundingMode || 'UNNECESSARY');
            if (SERVICE.DefaultExactUnitsService.parse(reservedQuantity).unscaled < 0n) throw new CLASSES.NodicsError('ERR_INV_00036', 'Reservation hold requires reconciliation');
            reservationPatch = { reservedQuantity: reservedQuantity, lastReservationCode: reservation.code };
        }
        let updated = await SERVICE.DefaultStockRepositoryService.applyBalance(balance, movement, resulting, request, reservationPatch);
        return SERVICE.DefaultStockRepositoryService.completeMovement(movement, 'APPLIED', { previousQuantity: balance.quantity,
            resultingQuantity: updated.quantity, resultingRevision: updated.revision }, request);
    }
};
