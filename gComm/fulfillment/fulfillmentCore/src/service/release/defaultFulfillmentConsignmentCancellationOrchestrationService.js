/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module fulfillment/service/release/DefaultFulfillmentConsignmentCancellationOrchestrationService
 * @description Cancels exact unshipped consignment allocation quantities through durable Fulfillment-owned checkpoints.
 * @layer service
 * @owner fulfillment
 * @override Projects may replace allocation selection or pre-shipment provider handling while preserving exact quantities, serial binding, lifecycle guards, and idempotency.
 */
module.exports = {
    init: function () { return Promise.resolve(true); },
    postInit: function () { return Promise.resolve(true); },
    policy: function () { return ((((CONFIG.get('fulfillment') || {}).fulfillmentPolicy) || {}).cancellation) || {}; },
    error: function (code, message) { return new CLASSES.NodicsError(code, message); },
    authorizeInternalMutation: function (request) {
        if (!request || request._fulfillmentCancellationMutationAuthorized !== true) return Promise.reject(this.error('ERR_FUL_00010', 'Fulfillment cancellation evidence can change only through orchestration'));
        return Promise.resolve(true);
    },
    rejectDelete: function () { return Promise.reject(this.error('ERR_FUL_00010', 'Fulfillment cancellation evidence cannot be deleted')); },
    authorize: function (request) {
        if (this.policy().requireServiceToken !== false && (!request.authData || request.authData.tokenType !== 'service')) throw this.error('ERR_FUL_00010', 'Fulfillment cancellation requires an internal service identity');
    },
    items: function (value) { return value && Array.isArray(value.result) ? value.result : Array.isArray(value) ? value : []; },
    affected: function (value) { value = value && value.result !== undefined ? value.result : value;
        return Number(value && (value.modifiedCount !== undefined ? value.modifiedCount : value.nModified !== undefined ? value.nModified : value.n) || 0); },
    normalize: function (value, scale) { return SERVICE.DefaultExactUnitsService.multiplyRational(value, '1', '1', scale, 'UNNECESSARY'); },
    negate: function (value) { let parsed = SERVICE.DefaultExactUnitsService.parse(value); return SERVICE.DefaultExactUnitsService.format(-parsed.unscaled, parsed.scale); },
    add: function (left, right, scale) { return SERVICE.DefaultExactUnitsService.add(left, right, scale, 'UNNECESSARY'); },
    scale: function (values) { return Math.max.apply(null, values.map(value => SERVICE.DefaultExactUnitsService.parse(value).scale)); },
    loadConsignments: async function (request, input) {
        let records = this.items(await SERVICE.DefaultFulfillmentConsignmentService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: input.enterpriseCode, orderCode: input.orderCode }, searchOptions: { limit: Number(this.policy().maximumConsignments || 100) + 1 } }));
        if (!records.length || records.length > Number(this.policy().maximumConsignments || 100)) throw this.error('ERR_FUL_00010', 'Fulfillment cancellation requires bounded consignment evidence');
        return records;
    },
    loadAllocations: async function (request, input, consignments) {
        let direct = [].concat(input.deliveryAllocations || []).filter(Boolean);
        if (!direct.length && SERVICE.DefaultOrderDeliveryAllocationService && typeof SERVICE.DefaultOrderDeliveryAllocationService.get === 'function') {
            direct = this.items(await SERVICE.DefaultOrderDeliveryAllocationService.get({ tenant: request.tenant, authData: request.authData,
                query: { orderCode: input.orderCode }, searchOptions: { limit: Number(this.policy().maximumAllocations || 1000) + 1 } }));
        }
        let byCode = new Map(direct.map(value => [value.allocationCode, value]));
        let allocations = [];
        consignments.forEach(consignment => {
            let evidence = [].concat(consignment.allocationEvidence || []).filter(Boolean);
            (consignment.allocationCodes || []).forEach(code => {
                let value = evidence.find(item => item.allocationCode === code) || byCode.get(code);
                if (!value) throw this.error('ERR_FUL_00010', 'Fulfillment cancellation allocation quantity evidence is incomplete');
                allocations.push(Object.assign({ consignmentCode: consignment.consignmentCode }, value));
            });
        });
        if (!allocations.length || allocations.length > Number(this.policy().maximumAllocations || 1000)) throw this.error('ERR_FUL_00010', 'Fulfillment cancellation allocation evidence exceeds configured bounds');
        return allocations;
    },
    loadOperation: async function (request, input) {
        let records = this.items(await SERVICE.DefaultFulfillmentConsignmentCancellationService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: input.enterpriseCode, cancellationCode: input.cancellationCode }, searchOptions: { limit: 2 } }));
        if (records.length > 1) throw this.error('ERR_FUL_00012', 'Fulfillment cancellation identity is duplicated'); return records[0];
    },
    cancelledMap: function (consignment) { return new Map([].concat(consignment.cancelledAllocationEvidence || []).map(value => [value.allocationCode, value])); },
    plan: function (input, consignments, allocations) {
        let consignmentByCode = new Map(consignments.map(value => [value.consignmentCode, value])); let plan = [];
        let selectionCodes = new Set();
        [].concat(input.items || []).forEach(selection => {
            if (!selection.orderEntryCode || selectionCodes.has(selection.orderEntryCode) || typeof selection.requestedQuantity !== 'string') throw this.error('ERR_FUL_00010', 'Fulfillment cancellation item selection is invalid or duplicated');
            selectionCodes.add(selection.orderEntryCode);
            let candidates = allocations.filter(value => value.entryCode === selection.orderEntryCode).sort((left, right) => (left.consignmentCode + '::' + left.allocationCode).localeCompare(right.consignmentCode + '::' + right.allocationCode));
            if (!candidates.length) throw this.error('ERR_FUL_00011', 'Fulfillment cancellation selection has no consignment allocation evidence');
            candidates.forEach(value => {
                let consignment = consignmentByCode.get(value.consignmentCode);
                if (!(this.policy().cancellableConsignmentStatuses || []).includes(consignment.status) || this.policy().requireNoShipment !== false && consignment.shipmentCode) throw this.error('ERR_FUL_00011', 'Fulfillment consignment is no longer cancellable');
            });
            let scale = this.scale(candidates.map(value => value.quantity).concat([selection.requestedQuantity]));
            let remaining = this.normalize(selection.requestedQuantity, scale);
            if (SERVICE.DefaultExactUnitsService.parse(remaining).unscaled <= 0n) throw this.error('ERR_FUL_00010', 'Fulfillment cancellation quantity must be positive');
            let serials = [].concat(selection.serialNumbers || []).filter(Boolean);
            if (serials.length) {
                if (scale !== 0 || remaining !== String(serials.length) || new Set(serials).size !== serials.length) throw this.error('ERR_FUL_00011', 'Fulfillment serialized cancellation quantity must match unique serial count');
                serials.forEach(serial => {
                    let candidate = candidates.find(value => {
                        let cancelled = this.cancelledMap(consignmentByCode.get(value.consignmentCode)).get(value.allocationCode);
                        return (value.serialNumbers || []).includes(serial) && ![].concat(cancelled && cancelled.serialNumbers || []).includes(serial);
                    });
                    if (!candidate) throw this.error('ERR_FUL_00011', 'Fulfillment serial is not present in active allocation evidence');
                    let existing = plan.find(value => value.consignmentCode === candidate.consignmentCode && value.allocationCode === candidate.allocationCode);
                    if (existing) { existing.quantity = this.add(existing.quantity, '1', scale); existing.serialNumbers.push(serial); }
                    else plan.push({ consignmentCode: candidate.consignmentCode, allocationCode: candidate.allocationCode, entryCode: selection.orderEntryCode, quantity: '1', unitCode: candidate.unitCode, serialNumbers: [serial] });
                });
            } else candidates.forEach(candidate => {
                if (SERVICE.DefaultExactUnitsService.parse(remaining).unscaled <= 0n) return;
                let consignment = consignmentByCode.get(candidate.consignmentCode); let cancelled = this.cancelledMap(consignment).get(candidate.allocationCode);
                let available = this.add(this.normalize(candidate.quantity, scale), this.negate(this.normalize(cancelled && cancelled.quantity || '0', scale)), scale);
                if (SERVICE.DefaultExactUnitsService.parse(available).unscaled <= 0n) return;
                let take = SERVICE.DefaultExactUnitsService.parse(available).unscaled <= SERVICE.DefaultExactUnitsService.parse(remaining).unscaled ? available : remaining;
                plan.push({ consignmentCode: candidate.consignmentCode, allocationCode: candidate.allocationCode, entryCode: selection.orderEntryCode, quantity: take, unitCode: candidate.unitCode, serialNumbers: [] });
                remaining = this.add(remaining, this.negate(take), scale);
            });
            if (!serials.length && SERVICE.DefaultExactUnitsService.parse(remaining).unscaled !== 0n) throw this.error('ERR_FUL_00011', 'Fulfillment cancellation exceeds unshipped allocation quantity');
        });
        return plan;
    },
    transition: async function (request, operation, status, patch) {
        let response = await SERVICE.DefaultFulfillmentConsignmentCancellationService.update({ tenant: request.tenant, authData: request.authData,
            _fulfillmentCancellationMutationAuthorized: true,
            query: { enterpriseCode: operation.enterpriseCode, cancellationCode: operation.cancellationCode, revision: operation.revision },
            model: Object.assign({ status: status, revision: Number(operation.revision) + 1 }, patch || {}) });
        if (this.affected(response) !== 1) throw this.error('ERR_FUL_00012', 'Fulfillment cancellation checkpoint revision conflict');
        return Object.assign({}, operation, patch || {}, { status: status, revision: Number(operation.revision) + 1 });
    },
    create: async function (request, input, plan) {
        let model = { active: true, enterpriseCode: input.enterpriseCode, cancellationCode: input.cancellationCode,
            orderCode: input.orderCode, requestVersion: Number(input.requestVersion), itemSelections: input.items,
            cancellationPlan: plan, appliedConsignments: [], status: 'PENDING', revision: 0 };
        await SERVICE.DefaultFulfillmentConsignmentCancellationService.save({ tenant: request.tenant, authData: request.authData,
            model: model, _fulfillmentCancellationMutationAuthorized: true }); return model;
    },
    assertReplay: function (operation, input) {
        if (operation.orderCode !== input.orderCode || operation.requestVersion !== Number(input.requestVersion) || JSON.stringify(operation.itemSelections) !== JSON.stringify(input.items)) throw this.error('ERR_FUL_00011', 'Fulfillment cancellation idempotency conflict');
    },
    applyConsignment: async function (request, operation, consignment, entries) {
        if (consignment.lastCancellationCode === operation.cancellationCode) return { consignmentCode: consignment.consignmentCode, revision: consignment.revision, status: consignment.status, recovered: true };
        let cancellation = this.cancelledMap(consignment); entries.forEach(entry => {
            let current = cancellation.get(entry.allocationCode) || { allocationCode: entry.allocationCode, entryCode: entry.entryCode, quantity: '0', serialNumbers: [] };
            let scale = this.scale([current.quantity, entry.quantity]);
            cancellation.set(entry.allocationCode, Object.assign({}, current, { quantity: this.add(this.normalize(current.quantity, scale), this.normalize(entry.quantity, scale), scale),
                serialNumbers: Array.from(new Set([].concat(current.serialNumbers || [], entry.serialNumbers || []))) }));
        });
        let originals = new Map([].concat(consignment.allocationEvidence || []).map(value => [value.allocationCode, value]));
        let fullyCancelled = (consignment.allocationCodes || []).every(code => {
            let original = originals.get(code); let cancelled = cancellation.get(code);
            if (!original || !cancelled) return false; let scale = this.scale([original.quantity, cancelled.quantity]);
            return this.normalize(original.quantity, scale) === this.normalize(cancelled.quantity, scale);
        });
        let status = fullyCancelled ? 'CANCELLED' : 'PARTIALLY_CANCELLED';
        let response = await SERVICE.DefaultFulfillmentConsignmentService.update({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: consignment.enterpriseCode, consignmentCode: consignment.consignmentCode, revision: consignment.revision, status: consignment.status },
            model: { status: status, cancelledAllocationEvidence: Array.from(cancellation.values()), lastCancellationCode: operation.cancellationCode, revision: Number(consignment.revision) + 1 } });
        if (this.affected(response) !== 1) throw this.error('ERR_FUL_00012', 'Fulfillment consignment revision changed during cancellation');
        return { consignmentCode: consignment.consignmentCode, revision: Number(consignment.revision) + 1, status: status };
    },
    cancel: async function (request) {
        this.authorize(request); let input = request.body || request.cancellation || {};
        ['enterpriseCode', 'cancellationCode', 'orderCode', 'requestVersion'].forEach(field => { if (input[field] === undefined || input[field] === null || input[field] === '') throw this.error('ERR_FUL_00010', 'Fulfillment cancellation ' + field + ' is required'); });
        if (!Array.isArray(input.items) || !input.items.length) throw this.error('ERR_FUL_00010', 'Fulfillment cancellation items are required');
        let operation = await this.loadOperation(request, input); if (operation) this.assertReplay(operation, input);
        if (operation && operation.status === 'COMPLETED') return Object.assign({ idempotent: true }, operation);
        if (operation && operation.status === 'RECONCILIATION_REQUIRED') throw this.error('ERR_FUL_00012', 'Fulfillment cancellation requires reconciliation');
        let consignments = await this.loadConsignments(request, input);
        if (!operation) operation = await this.create(request, input, this.plan(input, consignments, await this.loadAllocations(request, input, consignments)));
        try {
            if (operation.status === 'PENDING') operation = await this.transition(request, operation, 'APPLYING');
            let applied = [].concat(operation.appliedConsignments || []); let appliedCodes = new Set(applied.map(value => value.consignmentCode));
            for (let consignment of consignments) {
                let entries = operation.cancellationPlan.filter(value => value.consignmentCode === consignment.consignmentCode);
                if (!entries.length || appliedCodes.has(consignment.consignmentCode)) continue;
                applied.push(await this.applyConsignment(request, operation, consignment, entries));
                operation = await this.transition(request, operation, 'APPLYING', { appliedConsignments: applied });
            }
            operation = await this.transition(request, operation, 'COMPLETED', { completedAt: new Date() }); return operation;
        } catch (error) {
            if (operation && !['COMPLETED', 'RECONCILIATION_REQUIRED'].includes(operation.status)) {
                try { await this.transition(request, operation, 'RECONCILIATION_REQUIRED', { failureCode: error.code || 'ERR_FUL_00012' }); } catch (ignored) { /* operator reconciliation uses cancellation identity */ }
            }
            throw error;
        }
    },
};
