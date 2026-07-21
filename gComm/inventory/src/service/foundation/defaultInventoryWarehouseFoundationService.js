/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module inventory/service/foundation/DefaultInventoryWarehouseFoundationService
 * @description Validates warehouse identity, configuration-backed classifications, lifecycle transitions, effective dates, and retirement safety.
 * @layer service
 * @owner inventory
 * @override Projects may extend classifications and transition rules through properties or replace this service while retaining scope and history invariants.
 */
module.exports = {
    /** Initializes warehouse validation. */
    init: function () { return Promise.resolve(true); },
    /** Completes warehouse validation initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the effective warehouse policy. */
    policy: function () { return ((CONFIG.get('inventory') || {}).warehouse) || {}; },
    /** Returns generated-service result items. */
    items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Validates the configured warehouse type and status. */
    validateClassification: function (model) {
        let policy = this.policy();
        if (!(policy.types || []).includes(model.type || 'PHYSICAL') || !(policy.statuses || []).includes(model.status || 'DRAFT')) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00003', 'Warehouse type or status is not allowed by inventory configuration');
        }
        if (model.effectiveFrom && model.effectiveTo && new Date(model.effectiveFrom).getTime() > new Date(model.effectiveTo).getTime()) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00003', 'Warehouse effective-from date must not follow effective-to date');
        }
        return true;
    },
    /** Prepares a new warehouse for generated persistence. */
    prepareWarehouseSave: function (request) {
        SERVICE.DefaultInventoryEnterpriseScopeService.scopeNewModel(request, 'warehouse', ['warehouseCode']);
        request.model.type = request.model.type || 'PHYSICAL';
        request.model.status = request.model.status || 'DRAFT';
        this.validateClassification(request.model);
        return Promise.resolve(true);
    },
    /** Loads the single existing warehouse selected by a scoped update query. */
    loadExisting: async function (request) {
        await SERVICE.DefaultInventoryEnterpriseScopeService.scopeQuery(request);
        let response = await SERVICE.DefaultWarehouseService.get({ tenant: request.tenant, authData: request.authData,
            query: Object.assign({}, request.query), searchOptions: { limit: 2 } });
        let items = this.items(response);
        if (items.length !== 1) throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00003', 'Warehouse update must identify one existing warehouse');
        return items[0];
    },
    /** Rejects changes to stable enterprise and warehouse identity. */
    validateIdentityUpdate: function (existing, patch) {
        ['code', 'enterpriseCode', 'warehouseCode'].forEach(property => {
            if (patch[property] !== undefined && patch[property] !== existing[property]) {
                throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00006', 'Warehouse identity property ' + property + ' is immutable');
            }
        });
    },
    /** Validates a configured lifecycle transition. */
    validateTransition: function (from, to) {
        if (!to || to === from) return true;
        if (!((this.policy().allowedTransitions || {})[from] || []).includes(to)) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00004', 'Warehouse transition from ' + from + ' to ' + to + ' is not allowed');
        }
        return true;
    },
    /** Prevents retirement while non-retired locations remain. */
    assertRetirementSafe: async function (existing, nextStatus, request) {
        if (nextStatus !== 'RETIRED' || existing.status === 'RETIRED') return true;
        let response = await SERVICE.DefaultWarehouseLocationService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: existing.enterpriseCode, warehouseCode: existing.warehouseCode, status: { $ne: 'RETIRED' } },
            searchOptions: { limit: 1 } });
        if (this.items(response).length) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00008', 'Retire warehouse locations before retiring their warehouse');
        }
        return true;
    },
    /** Prepares a governed warehouse update. */
    prepareWarehouseUpdate: async function (request) {
        let existing = await this.loadExisting(request);
        let patch = request.model && (request.model.$set || request.model) || {};
        this.validateIdentityUpdate(existing, patch);
        let candidate = Object.assign({}, existing, patch);
        this.validateClassification(candidate);
        this.validateTransition(existing.status, candidate.status);
        await this.assertRetirementSafe(existing, candidate.status, request);
        patch.enterpriseCode = existing.enterpriseCode;
        return true;
    },
    /** Rejects destructive deletion so references and future ledger evidence remain meaningful. */
    rejectHardDelete: function () {
        return Promise.reject(SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00007', 'Warehouses must be retired instead of deleted'));
    }
};
