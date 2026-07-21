/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module inventory/service/reservation/DefaultStockReservationRepositoryService
 * @description Persists reservation evidence and applies optimistic reserved-quantity changes to the authoritative Stock Balance.
 * @layer service
 * @owner inventory
 * @override Database providers may replace this boundary while preserving idempotency, compare-and-set, and recovery semantics.
 */
module.exports = {
    /** Initializes reservation persistence. */ init: function () { return Promise.resolve(true); },
    /** Completes reservation persistence initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Extracts generated-service result items. */ items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Extracts a provider-neutral affected-record count. */
    affected: function (response) {
        let value = response && response.result !== undefined ? response.result : response;
        return value && (value.modifiedCount !== undefined ? value.modifiedCount : value.nModified !== undefined ? value.nModified : value.n) || 0;
    },
    /** Loads one reservation by stable code. */
    getReservation: async function (code, request) {
        let response = await SERVICE.DefaultStockReservationService.get({ tenant: request.tenant, authData: request.authData,
            query: { code: code, enterpriseCode: request.enterpriseCode }, searchOptions: { limit: 1 } });
        return this.items(response)[0];
    },
    /** Verifies that an idempotency replay describes the original reservation intent. */
    assertMatchingIntent: function (existing, model) {
        if (existing && existing.stockCode === model.stockCode && existing.quantity === model.quantity &&
            existing.unitCode === model.unitCode && existing.reasonCode === model.reasonCode &&
            existing.ownerType === model.ownerType && existing.ownerCode === model.ownerCode) return existing;
        throw new CLASSES.NodicsError('ERR_INV_00034', 'Idempotency key belongs to another Stock Reservation');
    },
    /** Creates a pending reservation idempotently. */
    createPending: async function (model, request) {
        let existing = await this.getReservation(model.code, request);
        if (existing) return this.assertMatchingIntent(existing, model);
        try { await SERVICE.DefaultStockReservationService.save({ tenant: request.tenant, authData: request.authData,
            model: model, _stockReservationMutationAuthorized: true }); }
        catch (error) { existing = await this.getReservation(model.code, request); if (!existing) throw error; return this.assertMatchingIntent(existing, model); }
        return this.getReservation(model.code, request) || model;
    },
    /** Applies a reservation quantity change through Stock Balance compare-and-set. */
    applyReservedQuantity: async function (balance, reservationCode, quantity, request) {
        let response = await SERVICE.DefaultStockBalanceService.update({ tenant: request.tenant, authData: request.authData,
            _stockMutationAuthorized: true, query: { code: balance.code, enterpriseCode: request.enterpriseCode, revision: balance.revision },
            model: { reservedQuantity: quantity, revision: Number(balance.revision) + 1, lastReservationCode: reservationCode } });
        if (this.affected(response) !== 1) return null;
        return Object.assign({}, balance, { reservedQuantity: quantity, revision: Number(balance.revision) + 1, lastReservationCode: reservationCode });
    },
    /** Moves one reservation from an expected state into a terminal or active state exactly once. */
    transition: async function (reservation, expectedState, state, patch, request) {
        let response = await SERVICE.DefaultStockReservationService.update({ tenant: request.tenant, authData: request.authData,
            _stockReservationMutationAuthorized: true,
            query: { code: reservation.code, enterpriseCode: request.enterpriseCode, state: expectedState },
            model: Object.assign({ state: state }, patch || {}) });
        if (this.affected(response) === 1) return Object.assign({}, reservation, patch || {}, { state: state });
        return this.getReservation(reservation.code, request);
    }
};
