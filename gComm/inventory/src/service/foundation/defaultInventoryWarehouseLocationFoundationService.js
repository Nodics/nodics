/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module inventory/service/foundation/DefaultInventoryWarehouseLocationFoundationService
 * @description Validates warehouse existence, recursive location paths, bounded depth, immutable identity, lifecycle transitions, and safe retirement.
 * @layer service
 * @owner inventory
 * @override Projects may extend location classifications while preserving same-warehouse hierarchy, bounded depth, cycle rejection, and stable identity.
 */
module.exports = {
    /** Initializes location validation. */
    init: function () { return Promise.resolve(true); },
    /** Completes location validation initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the effective location policy. */
    policy: function () { return ((CONFIG.get('inventory') || {}).location) || {}; },
    /** Returns generated-service result items. */
    items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Loads exactly one active owning warehouse. */
    loadWarehouse: async function (model, request) {
        let response = await SERVICE.DefaultWarehouseService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: model.enterpriseCode, warehouseCode: model.warehouseCode }, searchOptions: { limit: 2 } });
        let items = this.items(response);
        if (items.length !== 1 || items[0].status === 'RETIRED') {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00005', 'Warehouse location requires one non-retired owning warehouse');
        }
        return items[0];
    },
    /** Loads one parent from the same enterprise and warehouse. */
    loadParent: async function (model, request) {
        if (!model.parentLocationCode) return undefined;
        if (model.parentLocationCode === model.locationCode) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00005', 'Warehouse location cannot be its own parent');
        }
        let response = await SERVICE.DefaultWarehouseLocationService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: model.enterpriseCode, warehouseCode: model.warehouseCode,
                locationCode: model.parentLocationCode }, searchOptions: { limit: 2 } });
        let items = this.items(response);
        if (items.length !== 1 || items[0].status === 'RETIRED') {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00005', 'Warehouse location parent must exist and be non-retired in the same warehouse');
        }
        return items[0];
    },
    /** Validates classification and derives a bounded, cycle-free path. */
    preparePath: function (model, parent) {
        let policy = this.policy();
        model.type = model.type || 'STORAGE';
        model.status = model.status || 'DRAFT';
        if (!(policy.types || []).includes(model.type) || !(policy.statuses || []).includes(model.status)) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00005', 'Warehouse location type or status is not allowed by inventory configuration');
        }
        let parentPath = parent ? [].concat(parent.path || [], parent.locationCode).filter((value, index, values) => values.indexOf(value) === index) : [];
        if (parentPath.includes(model.locationCode)) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00005', 'Warehouse location hierarchy cycle detected');
        }
        model.path = parentPath.concat(model.locationCode);
        model.depth = model.path.length - 1;
        let maxDepth = policy.maxDepth === undefined ? 12 : Number(policy.maxDepth);
        if (model.depth > maxDepth) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00005', 'Warehouse location hierarchy exceeds the configured maximum depth');
        }
        return model;
    },
    /** Prepares a new location for generated persistence. */
    prepareLocationSave: async function (request) {
        SERVICE.DefaultInventoryEnterpriseScopeService.scopeNewModel(request, 'location', ['warehouseCode', 'locationCode']);
        await this.loadWarehouse(request.model, request);
        let parent = await this.loadParent(request.model, request);
        this.preparePath(request.model, parent);
        return true;
    },
    /** Loads the single existing location selected by a scoped update query. */
    loadExisting: async function (request) {
        await SERVICE.DefaultInventoryEnterpriseScopeService.scopeQuery(request);
        let response = await SERVICE.DefaultWarehouseLocationService.get({ tenant: request.tenant, authData: request.authData,
            query: Object.assign({}, request.query), searchOptions: { limit: 2 } });
        let items = this.items(response);
        if (items.length !== 1) throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00005', 'Location update must identify one existing location');
        return items[0];
    },
    /** Prevents identity and parent changes after creation. */
    validateIdentityUpdate: function (existing, patch) {
        ['code', 'enterpriseCode', 'warehouseCode', 'locationCode', 'parentLocationCode', 'path', 'depth'].forEach(property => {
            if (patch[property] !== undefined && JSON.stringify(patch[property]) !== JSON.stringify(existing[property])) {
                throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00006', 'Warehouse location identity or hierarchy property ' + property + ' is immutable');
            }
        });
    },
    /** Validates a configured location lifecycle transition. */
    validateTransition: function (from, to) {
        if (!to || to === from) return true;
        let allowed = ((((CONFIG.get('inventory') || {}).warehouse || {}).allowedTransitions || {})[from]) || [];
        if (!allowed.includes(to)) throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00004', 'Warehouse location lifecycle transition is not allowed');
        return true;
    },
    /** Prevents retiring a location while non-retired child locations remain. */
    assertRetirementSafe: async function (existing, nextStatus, request) {
        if (nextStatus !== 'RETIRED' || existing.status === 'RETIRED') return true;
        let response = await SERVICE.DefaultWarehouseLocationService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: existing.enterpriseCode, warehouseCode: existing.warehouseCode,
                parentLocationCode: existing.locationCode, status: { $ne: 'RETIRED' } }, searchOptions: { limit: 1 } });
        if (this.items(response).length) throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00005', 'Retire child locations before retiring their parent');
        return true;
    },
    /** Prepares a governed location update. */
    prepareLocationUpdate: async function (request) {
        let existing = await this.loadExisting(request);
        let patch = request.model && (request.model.$set || request.model) || {};
        this.validateIdentityUpdate(existing, patch);
        let candidate = Object.assign({}, existing, patch);
        this.preparePath(candidate, candidate.parentLocationCode ? { locationCode: candidate.parentLocationCode,
            path: candidate.path.slice(0, -1) } : undefined);
        this.validateTransition(existing.status, candidate.status);
        await this.assertRetirementSafe(existing, candidate.status, request);
        patch.enterpriseCode = existing.enterpriseCode;
        return true;
    },
    /** Rejects destructive deletion so hierarchy and future stock evidence remain meaningful. */
    rejectHardDelete: function () {
        return Promise.reject(SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00007', 'Warehouse locations must be retired instead of deleted'));
    }
};
