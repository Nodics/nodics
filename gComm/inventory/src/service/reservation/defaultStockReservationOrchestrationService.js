/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module inventory/service/reservation/DefaultStockReservationOrchestrationService
 * @description Owns exact idempotent Stock Reservation creation, release, cancellation, consumption marking, and expiry.
 * @layer service
 * @owner inventory
 * @override Projects may extend ownership metadata while preserving Stock Balance authority and lifecycle safety.
 */
module.exports = {
    /** Initializes Stock Reservation orchestration. */ init: function () { return Promise.resolve(true); },
    /** Completes Stock Reservation initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns reservation policy. */ policy: function () { return ((CONFIG.get('inventory') || {}).stockReservation) || {}; },
    /** Allows generated persistence only through this orchestration boundary. */
    authorizeInternalMutation: function (request) {
        if (!request || request._stockReservationMutationAuthorized !== true) return Promise.reject(new CLASSES.NodicsError('ERR_INV_00032', 'Reservation state can change only through orchestration'));
        return Promise.resolve(true);
    },
    /** Rejects deletion of reservation evidence. */ rejectDelete: function () { return Promise.reject(new CLASSES.NodicsError('ERR_INV_00032', 'Reservation evidence cannot be deleted')); },
    /** Builds the reservation code from the enterprise-scoped idempotency key. */
    code: function (enterpriseCode, idempotencyKey) {
        return SERVICE.DefaultInventoryEnterpriseScopeService.buildIdentity(enterpriseCode, 'reservation', [idempotencyKey]);
    },
    /** Negates one canonical exact quantity without binary arithmetic. */
    negate: function (quantity) {
        let parsed = SERVICE.DefaultExactUnitsService.parse(quantity);
        return SERVICE.DefaultExactUnitsService.format(-parsed.unscaled, parsed.scale);
    },
    /** Loads the authoritative Stock Balance. */
    balance: async function (stockCode, request) {
        let balance = await SERVICE.DefaultStockRepositoryService.getBalance(stockCode, request);
        if (!balance) throw new CLASSES.NodicsError('ERR_INV_00032', 'Stock Balance does not exist');
        if (balance.reservedQuantity === undefined) balance.reservedQuantity = SERVICE.DefaultExactUnitsService.multiplyRational('0', '1', '1', balance.scale, 'UNNECESSARY');
        return balance;
    },
    /** Creates an ACTIVE reservation using Stock Balance optimistic concurrency. */
    reserve: async function (request) {
        request = request || {}; let input = request.reservation || {}; let policy = this.policy();
        request.enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request);
        ['idempotencyKey', 'stockCode', 'quantity', 'unitCode', 'reasonCode'].forEach(field => {
            if (!input[field]) throw new CLASSES.NodicsError('ERR_INV_00032', 'Reservation ' + field + ' is required');
        });
        let ttl = Number(input.ttlSeconds === undefined ? policy.defaultTtlSeconds || 900 : input.ttlSeconds);
        if (!Number.isInteger(ttl) || ttl < Number(policy.minimumTtlSeconds || 1) || ttl > Number(policy.maximumTtlSeconds || 86400)) {
            throw new CLASSES.NodicsError('ERR_INV_00032', 'Reservation TTL is invalid');
        }
        let code = this.code(request.enterpriseCode, input.idempotencyKey); let balance = await this.balance(input.stockCode, request);
        if (balance.unitCode !== input.unitCode) throw new CLASSES.NodicsError('ERR_INV_00032', 'Reservation Unit must match the Stock Balance Unit');
        let zero = SERVICE.DefaultExactUnitsService.multiplyRational('0', '1', '1', balance.scale, 'UNNECESSARY');
        if (SERVICE.DefaultExactUnitsService.parse(input.quantity).unscaled <= 0n) throw new CLASSES.NodicsError('ERR_INV_00032', 'Reservation quantity must be positive');
        let model = { code: code, active: true, enterpriseCode: request.enterpriseCode, reservationCode: input.idempotencyKey,
            idempotencyKey: input.idempotencyKey, stockCode: input.stockCode, warehouseCode: balance.warehouseCode,
            locationCode: balance.locationCode, itemType: balance.itemType, itemCode: balance.itemCode, quantity: input.quantity,
            unitCode: input.unitCode, scale: balance.scale, state: 'PENDING', expiresAt: new Date(Date.now() + ttl * 1000),
            ownerType: input.ownerType, ownerCode: input.ownerCode, reasonCode: input.reasonCode,
            correlationId: input.correlationId, expectedRevision: Number(balance.revision) };
        let reservation = await SERVICE.DefaultStockReservationRepositoryService.createPending(model, request);
        if (reservation.state !== 'PENDING') return reservation;
        for (let attempt = 0; attempt < Number(policy.maximumRetries || 3); attempt++) {
            balance = await this.balance(input.stockCode, request);
            if (balance.lastReservationCode === reservation.code && Number(balance.revision) === Number(reservation.expectedRevision) + 1) {
                let recovered = await SERVICE.DefaultStockReservationRepositoryService.transition(reservation, 'PENDING', 'ACTIVE', { resultingRevision: balance.revision }, request);
                if (!recovered || recovered.state !== 'ACTIVE') throw new CLASSES.NodicsError('ERR_INV_00036', 'Reservation activation requires reconciliation');
                return recovered;
            }
            let available = SERVICE.DefaultExactUnitsService.add(balance.quantity, this.negate(balance.reservedQuantity || zero), balance.scale, 'UNNECESSARY');
            if (SERVICE.DefaultExactUnitsService.parse(SERVICE.DefaultExactUnitsService.add(available, this.negate(input.quantity), balance.scale, 'UNNECESSARY')).unscaled < 0n) {
                await SERVICE.DefaultStockReservationRepositoryService.transition(reservation, 'PENDING', 'REJECTED', { failureCode: 'INSUFFICIENT_STOCK', terminalAt: new Date() }, request);
                throw new CLASSES.NodicsError('ERR_INV_00033', 'Insufficient available stock');
            }
            reservation = await SERVICE.DefaultStockReservationRepositoryService.transition(reservation, 'PENDING', 'PENDING',
                { expectedRevision: Number(balance.revision) }, request);
            if (!reservation || reservation.state !== 'PENDING') throw new CLASSES.NodicsError('ERR_INV_00035', 'Reservation activation state conflict');
            let resulting = SERVICE.DefaultExactUnitsService.add(balance.reservedQuantity || zero, input.quantity, balance.scale, 'UNNECESSARY');
            let updated = await SERVICE.DefaultStockReservationRepositoryService.applyReservedQuantity(balance, reservation.code, resulting, request);
            if (updated) {
                let completed = await SERVICE.DefaultStockReservationRepositoryService.transition(reservation, 'PENDING', 'ACTIVE', { resultingRevision: updated.revision }, request);
                if (!completed || completed.state !== 'ACTIVE') throw new CLASSES.NodicsError('ERR_INV_00036', 'Reservation activation requires reconciliation');
                return completed;
            }
        }
        throw new CLASSES.NodicsError('ERR_INV_00036', 'Reservation compare-and-set retry boundary exceeded');
    },
    /** Releases quantity for an ACTIVE reservation and records its terminal state. */
    release: async function (request, terminalState) {
        request = request || {}; request.enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request);
        let input = request.reservation || {};
        if (!input.code && !input.idempotencyKey) throw new CLASSES.NodicsError('ERR_INV_00032', 'Reservation code or idempotency key is required');
        let code = input.code || this.code(request.enterpriseCode, input.idempotencyKey);
        let reservation = await SERVICE.DefaultStockReservationRepositoryService.getReservation(code, request);
        if (!reservation) throw new CLASSES.NodicsError('ERR_INV_00032', 'Stock Reservation was not found');
        if (['RELEASED', 'EXPIRED', 'CANCELLED'].includes(reservation.state)) return reservation;
        if (!['ACTIVE', 'RELEASE_PENDING'].includes(reservation.state)) throw new CLASSES.NodicsError('ERR_INV_00035', 'Only ACTIVE reservations can release stock');
        terminalState = reservation.requestedTerminalState || terminalState || 'RELEASED';
        for (let attempt = 0; attempt < Number(this.policy().maximumRetries || 3); attempt++) {
            let balance = await this.balance(reservation.stockCode, request);
            if (reservation.state === 'RELEASE_PENDING' && balance.lastReservationCode === reservation.code &&
                Number(balance.revision) === Number(reservation.releaseExpectedRevision) + 1) {
                let recovered = await SERVICE.DefaultStockReservationRepositoryService.transition(reservation, 'RELEASE_PENDING', terminalState,
                    { resultingRevision: balance.revision, terminalAt: new Date() }, request);
                if (!recovered || recovered.state !== terminalState) throw new CLASSES.NodicsError('ERR_INV_00036', 'Reservation terminal state requires reconciliation');
                return recovered;
            }
            reservation = await SERVICE.DefaultStockReservationRepositoryService.transition(reservation, reservation.state, 'RELEASE_PENDING',
                { releaseExpectedRevision: Number(balance.revision), requestedTerminalState: terminalState }, request);
            if (!reservation || reservation.state !== 'RELEASE_PENDING') throw new CLASSES.NodicsError('ERR_INV_00035', 'Reservation release state conflict');
            let resulting = SERVICE.DefaultExactUnitsService.add(balance.reservedQuantity, this.negate(reservation.quantity), balance.scale, 'UNNECESSARY');
            if (SERVICE.DefaultExactUnitsService.parse(resulting).unscaled < 0n) throw new CLASSES.NodicsError('ERR_INV_00036', 'Reserved quantity requires reconciliation');
            let updated = await SERVICE.DefaultStockReservationRepositoryService.applyReservedQuantity(balance, reservation.code, resulting, request);
            if (updated) {
                let completed = await SERVICE.DefaultStockReservationRepositoryService.transition(reservation, 'RELEASE_PENDING', terminalState,
                    { resultingRevision: updated.revision, terminalAt: new Date() }, request);
                if (!completed || completed.state !== terminalState) throw new CLASSES.NodicsError('ERR_INV_00036', 'Reservation terminal state requires reconciliation');
                return completed;
            }
        }
        throw new CLASSES.NodicsError('ERR_INV_00036', 'Reservation release retry boundary exceeded');
    },
    /** Cancels one active reservation. */ cancel: function (request) { return this.release(request, 'CANCELLED'); },
    /** Marks a reservation consumed while retaining its hold until the Stock ISSUE movement commits. */
    consume: async function (request) {
        request = request || {}; request.enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request);
        let input = request.reservation || {};
        if (!input.code && !input.idempotencyKey) throw new CLASSES.NodicsError('ERR_INV_00032', 'Reservation code or idempotency key is required');
        let code = input.code || this.code(request.enterpriseCode, input.idempotencyKey);
        let reservation = await SERVICE.DefaultStockReservationRepositoryService.getReservation(code, request);
        if (!reservation) throw new CLASSES.NodicsError('ERR_INV_00032', 'Stock Reservation was not found');
        if (reservation.state === 'CONSUMED') return reservation;
        if (reservation.state !== 'ACTIVE') throw new CLASSES.NodicsError('ERR_INV_00035', 'Only ACTIVE reservations can be consumed');
        return SERVICE.DefaultStockReservationRepositoryService.transition(reservation, 'ACTIVE', 'CONSUMED', { terminalAt: new Date() }, request);
    },
    /** Expires a bounded batch of elapsed ACTIVE reservations; intended for CronJob invocation. */
    expire: async function (request) {
        request = request || {}; request.enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request);
        let now = request.at ? new Date(request.at) : new Date(); let limit = Number(this.policy().expiryBatchSize || 500);
        let response = await SERVICE.DefaultStockReservationService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: request.enterpriseCode, state: { $in: ['ACTIVE', 'RELEASE_PENDING'] }, expiresAt: { $lte: now } }, searchOptions: { limit: limit } });
        let expired = [];
        for (let reservation of SERVICE.DefaultStockReservationRepositoryService.items(response)) {
            expired.push(await this.release(Object.assign({}, request, { reservation: { code: reservation.code } }), 'EXPIRED'));
        }
        return { processed: expired.length, reservations: expired };
    }
};
