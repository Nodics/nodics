/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module inventory/service/stock/DefaultStockRepositoryService
 * @description Persists idempotent Stock Movement state and optimistic compare-and-set Stock Balances through generated services.
 * @layer service
 * @owner inventory
 * @override Database-specific providers may replace this repository while preserving tenant scope, idempotency, CAS, and recovery semantics.
 */
module.exports = {
    /** Initializes Stock persistence. */ init: function () { return Promise.resolve(true); },
    /** Completes Stock persistence initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Extracts generated-service result items. */ items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Extracts a provider-neutral affected-record count. */
    affected: function (response) {
        let value = response && response.result !== undefined ? response.result : response;
        return value && (value.modifiedCount !== undefined ? value.modifiedCount : value.nModified !== undefined ? value.nModified : value.n) || 0;
    },
    /** Loads one Stock Balance by derived code. */
    getBalance: async function (code, request) {
        let response = await SERVICE.DefaultStockBalanceService.get({ tenant: request.tenant, authData: request.authData,
            query: { code: code, enterpriseCode: request.enterpriseCode }, searchOptions: { limit: 1 } });
        return this.items(response)[0];
    },
    /** Creates the initial zero balance idempotently. */
    createBalance: async function (model, request) {
        try { await SERVICE.DefaultStockBalanceService.save({ tenant: request.tenant, authData: request.authData, model: model, _stockMutationAuthorized: true }); }
        catch (error) { let existing = await this.getBalance(model.code, request); if (!existing) throw error; }
        return this.getBalance(model.code, request);
    },
    /** Loads an idempotency-keyed Movement. */
    getMovement: async function (code, request) {
        let response = await SERVICE.DefaultStockMovementRecordService.get({ tenant: request.tenant, authData: request.authData,
            query: { code: code, enterpriseCode: request.enterpriseCode }, searchOptions: { limit: 1 } });
        return this.items(response)[0];
    },
    /** Ensures an idempotency key still describes the same immutable Stock Movement intent. */
    assertMatchingMovement: function (existing, model) {
        if (existing && existing.stockCode === model.stockCode && existing.normalizedDelta === model.normalizedDelta &&
            existing.originalQuantity === model.originalQuantity && existing.originalUnitCode === model.originalUnitCode &&
            existing.balanceUnitCode === model.balanceUnitCode && existing.movementType === model.movementType &&
            existing.reasonCode === model.reasonCode && Number(existing.expectedRevision) === Number(model.expectedRevision)) return existing;
        throw new CLASSES.NodicsError('ERR_INV_00012', 'Idempotency key belongs to another Stock Movement');
    },
    /** Ensures replayed raw intent matches persisted evidence before any Unit definition is resolved again. */
    assertMatchingIntent: function (existing, model) {
        if (existing && existing.stockCode === model.stockCode && existing.originalQuantity === model.originalQuantity &&
            existing.originalUnitCode === model.originalUnitCode && existing.balanceUnitCode === model.balanceUnitCode &&
            existing.movementType === model.movementType && existing.reasonCode === model.reasonCode &&
            Number(existing.expectedRevision) === Number(model.expectedRevision)) return existing;
        throw new CLASSES.NodicsError('ERR_INV_00012', 'Idempotency key belongs to another Stock Movement');
    },
    /** Creates a PENDING Movement or returns the matching existing Movement. */
    createMovement: async function (model, request) {
        let existing = await this.getMovement(model.code, request);
        if (existing) return this.assertMatchingMovement(existing, model);
        try { await SERVICE.DefaultStockMovementRecordService.save({ tenant: request.tenant, authData: request.authData, model: model, _stockMutationAuthorized: true }); }
        catch (error) { existing = await this.getMovement(model.code, request); if (!existing) throw error; return this.assertMatchingMovement(existing, model); }
        return this.getMovement(model.code, request) || model;
    },
    /** Applies one exact balance change with optimistic compare-and-set. */
    applyBalance: async function (balance, movement, resultingQuantity, request, reservationPatch) {
        let response = await SERVICE.DefaultStockBalanceService.update({ tenant: request.tenant, authData: request.authData, _stockMutationAuthorized: true,
            query: { code: balance.code, enterpriseCode: request.enterpriseCode, revision: movement.expectedRevision }, model: {
                quantity: resultingQuantity, revision: movement.expectedRevision + 1, lastMovementCode: movement.code,
                ...(reservationPatch || {}) } });
        if (this.affected(response) !== 1) throw new CLASSES.NodicsError('ERR_INV_00013', 'Stock Balance revision conflict');
        return Object.assign({}, balance, reservationPatch || {}, { quantity: resultingQuantity, revision: movement.expectedRevision + 1, lastMovementCode: movement.code });
    },
    /** Marks one Movement terminal with balance evidence. */
    completeMovement: async function (movement, state, patch, request) {
        let response = await SERVICE.DefaultStockMovementRecordService.update({ tenant: request.tenant, authData: request.authData, _stockMutationAuthorized: true,
            query: { code: movement.code, enterpriseCode: request.enterpriseCode, state: 'PENDING' },
            model: Object.assign({ state: state }, patch || {}) });
        if (this.affected(response) !== 1) {
            let current = await this.getMovement(movement.code, request);
            if (!current || current.state === 'PENDING') throw new CLASSES.NodicsError('ERR_INV_00015', 'Stock Movement terminal state could not be reconciled');
            return current;
        }
        return Object.assign({}, movement, patch || {}, { state: state });
    }
};
