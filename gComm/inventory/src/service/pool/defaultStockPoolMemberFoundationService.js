/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module inventory/service/pool/DefaultStockPoolMemberFoundationService
 * @description Governs ordered Warehouse membership in Stock Pools without copying Warehouse state or Stock quantities.
 * @layer service
 * @owner inventory
 * @override Projects may extend membership ordering while preserving enterprise scope, authoritative Warehouse references, immutable identity, and lifecycle history.
 */
module.exports = {
    /** Initializes Pool membership governance. */ init: function () { return Promise.resolve(true); },
    /** Completes Pool membership governance initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns effective membership policy. */ policy: function () { return ((CONFIG.get('inventory') || {}).stockPoolMember) || {}; },
    /** Extracts generated-service result items. */ items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Validates membership status, priority, and effective dates. */
    validateModel: function (model) {
        let policy = this.policy(); let priority = model.priority === undefined ? 100 : model.priority;
        let from = model.effectiveFrom && new Date(model.effectiveFrom).getTime(); let to = model.effectiveTo && new Date(model.effectiveTo).getTime();
        if (!(policy.statuses || []).includes(model.status || 'DRAFT') || !Number.isInteger(priority) ||
            priority < Number(policy.minimumPriority || 0) || priority > Number(policy.maximumPriority || 999999) ||
            model.effectiveFrom && !Number.isFinite(from) || model.effectiveTo && !Number.isFinite(to) || from && to && from > to) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00016', 'Stock Pool membership status, priority, or effective dates are invalid');
        }
        return true;
    },
    /** Loads exactly one Pool and Warehouse in authenticated enterprise scope. */
    loadDependencies: async function (request, model) {
        let poolResponse = await SERVICE.DefaultStockPoolService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: model.enterpriseCode, poolCode: model.poolCode }, searchOptions: { limit: 2 } });
        let warehouseResponse = await SERVICE.DefaultWarehouseService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: model.enterpriseCode, warehouseCode: model.warehouseCode }, searchOptions: { limit: 2 } });
        let pools = this.items(poolResponse); let warehouses = this.items(warehouseResponse);
        if (pools.length !== 1 || warehouses.length !== 1 || pools[0].status === 'RETIRED' || warehouses[0].status === 'RETIRED' ||
            model.status === 'ACTIVE' && (pools[0].status !== 'ACTIVE' || warehouses[0].status !== 'ACTIVE')) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00019', 'Stock Pool membership requires available Pool and Warehouse dependencies');
        }
        return { pool: pools[0], warehouse: warehouses[0] };
    },
    /** Prepares one new deterministic Pool membership. */
    prepareMemberSave: async function (request) {
        SERVICE.DefaultInventoryEnterpriseScopeService.scopeNewModel(request, 'stockPoolMember', ['poolCode', 'warehouseCode']);
        request.model.status = request.model.status || 'DRAFT';
        request.model.priority = request.model.priority === undefined ? 100 : request.model.priority;
        this.validateModel(request.model); await this.loadDependencies(request, request.model); return true;
    },
    /** Loads exactly one membership selected by a scoped update. */
    loadExisting: async function (request) {
        await SERVICE.DefaultInventoryEnterpriseScopeService.scopeQuery(request);
        let response = await SERVICE.DefaultStockPoolMemberService.get({ tenant: request.tenant, authData: request.authData,
            query: Object.assign({}, request.query), searchOptions: { limit: 2 } });
        let items = this.items(response);
        if (items.length !== 1) throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00016', 'Stock Pool membership update must identify one record');
        return items[0];
    },
    /** Validates the configured membership lifecycle. */
    validateTransition: function (from, to) {
        if (!to || to === from) return true;
        if (!((this.policy().allowedTransitions || {})[from] || []).includes(to)) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00017', 'Stock Pool membership lifecycle transition is not allowed');
        }
        return true;
    },
    /** Prepares a governed membership update. */
    prepareMemberUpdate: async function (request) {
        let existing = await this.loadExisting(request); let patch = request.model && (request.model.$set || request.model) || {};
        ['code', 'enterpriseCode', 'poolCode', 'warehouseCode'].forEach(property => {
            if (patch[property] !== undefined && patch[property] !== existing[property]) {
                throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00018', 'Stock Pool membership identity property ' + property + ' is immutable');
            }
        });
        let candidate = Object.assign({}, existing, patch); this.validateModel(candidate); this.validateTransition(existing.status, candidate.status);
        await this.loadDependencies(request, candidate); patch.enterpriseCode = existing.enterpriseCode; return true;
    },
    /** Rejects destructive membership deletion. */
    rejectHardDelete: function () {
        return Promise.reject(SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00020', 'Stock Pool memberships must be retired instead of deleted'));
    }
};
