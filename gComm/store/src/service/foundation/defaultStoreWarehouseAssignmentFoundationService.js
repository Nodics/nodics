/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module store/service/foundation/DefaultStoreWarehouseAssignmentFoundationService
 * @description Validates enterprise-safe Store-to-Inventory warehouse associations without owning warehouse state.
 * @layer service
 * @owner store
 * @override Projects may extend purposes and priority policy while retaining target validation, immutable identity, and lifecycle safety.
 */
module.exports = {
    /** Initializes assignment validation. */
    init: function () { return Promise.resolve(true); },
    /** Completes assignment validation initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns effective assignment policy. */
    policy: function () { return ((CONFIG.get('store') || {}).warehouseAssignment) || {}; },
    /** Extracts generated-service result items. */
    items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Loads one non-retired Store in authenticated enterprise scope. */
    loadStore: async function (request, storeCode) {
        let response = await SERVICE.DefaultStoreService.get({ tenant: request.tenant, authData: request.authData,
            query: { storeCode: storeCode }, searchOptions: { limit: 2 } });
        let items = this.items(response);
        if (items.length !== 1 || items[0].status === 'RETIRED') {
            throw SERVICE.DefaultStoreEnterpriseScopeService.error('ERR_STORE_00005', 'Assignment requires one non-retired store in the authenticated enterprise');
        }
        return items[0];
    },
    /** Loads one non-retired Inventory Warehouse in authenticated enterprise scope. */
    loadWarehouse: async function (request, warehouseCode) {
        return SERVICE.DefaultStoreWarehouseReferenceProviderService.resolve(request, warehouseCode);
    },
    /** Validates purposes, status, priority, and effective dates. */
    validateModel: function (model) {
        let policy = this.policy(); let purposes = model.purposes || [];
        if (!(policy.statuses || []).includes(model.status || 'DRAFT') || !Array.isArray(purposes) || !purposes.length ||
            purposes.some(purpose => !(policy.purposes || []).includes(purpose))) {
            throw SERVICE.DefaultStoreEnterpriseScopeService.error('ERR_STORE_00003', 'Assignment status or purpose is not allowed by configuration');
        }
        let priority = model.priority === undefined ? 100 : model.priority;
        if (!Number.isInteger(priority) || priority < Number(policy.minimumPriority || 0) || priority > Number(policy.maximumPriority || 999999)) {
            throw SERVICE.DefaultStoreEnterpriseScopeService.error('ERR_STORE_00003', 'Assignment priority is outside the configured integer range');
        }
        if (model.effectiveFrom && model.effectiveTo && new Date(model.effectiveFrom).getTime() > new Date(model.effectiveTo).getTime()) {
            throw SERVICE.DefaultStoreEnterpriseScopeService.error('ERR_STORE_00003', 'Assignment effective-from date must not follow effective-to date');
        }
        return true;
    },
    /** Validates endpoints and prepares a new assignment for persistence. */
    prepareAssignmentSave: async function (request) {
        SERVICE.DefaultStoreEnterpriseScopeService.scopeNewModel(request, 'storeWarehouse', ['storeCode', 'warehouseCode']);
        request.model.status = request.model.status || 'DRAFT';
        request.model.priority = request.model.priority === undefined ? 100 : request.model.priority;
        this.validateModel(request.model);
        let store = await this.loadStore(request, request.model.storeCode);
        let warehouse = await this.loadWarehouse(request, request.model.warehouseCode);
        if (store.enterpriseCode !== request.model.enterpriseCode || warehouse.enterpriseCode !== request.model.enterpriseCode) {
            throw SERVICE.DefaultStoreEnterpriseScopeService.error('ERR_STORE_00002', 'Store and warehouse must belong to the authenticated enterprise');
        }
        return true;
    },
    /** Loads exactly one assignment selected by a scoped update. */
    loadExisting: async function (request) {
        await SERVICE.DefaultStoreEnterpriseScopeService.scopeQuery(request);
        let response = await SERVICE.DefaultStoreWarehouseAssignmentService.get({ tenant: request.tenant, authData: request.authData,
            query: Object.assign({}, request.query), searchOptions: { limit: 2 } });
        let items = this.items(response);
        if (items.length !== 1) throw SERVICE.DefaultStoreEnterpriseScopeService.error('ERR_STORE_00003', 'Assignment update must identify one existing assignment');
        return items[0];
    },
    /** Validates a configured assignment lifecycle transition. */
    validateTransition: function (from, to) {
        if (!to || to === from) return true;
        if (!((this.policy().allowedTransitions || {})[from] || []).includes(to)) {
            throw SERVICE.DefaultStoreEnterpriseScopeService.error('ERR_STORE_00004', 'Assignment transition from ' + from + ' to ' + to + ' is not allowed');
        }
        return true;
    },
    /** Prepares one governed assignment update. */
    prepareAssignmentUpdate: async function (request) {
        let existing = await this.loadExisting(request); let patch = request.model && (request.model.$set || request.model) || {};
        ['code', 'enterpriseCode', 'storeCode', 'warehouseCode'].forEach(property => {
            if (patch[property] !== undefined && patch[property] !== existing[property]) {
                throw SERVICE.DefaultStoreEnterpriseScopeService.error('ERR_STORE_00006', 'Assignment identity property ' + property + ' is immutable');
            }
        });
        let candidate = Object.assign({}, existing, patch); this.validateModel(candidate); this.validateTransition(existing.status, candidate.status);
        patch.enterpriseCode = existing.enterpriseCode; return true;
    },
    /** Rejects destructive assignment deletion. */
    rejectHardDelete: function () {
        return Promise.reject(SERVICE.DefaultStoreEnterpriseScopeService.error('ERR_STORE_00007', 'Store warehouse assignments must be retired instead of deleted'));
    }
};
