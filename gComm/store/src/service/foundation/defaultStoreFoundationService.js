/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module store/service/foundation/DefaultStoreFoundationService
 * @description Enforces Store identity, configured classification, lifecycle, effective dates, and safe retirement.
 * @layer service
 * @owner store
 * @override Projects may extend classifications and transitions while preserving identity, scope, and historical references.
 */
module.exports = {
    /** Initializes Store validation. */
    init: function () { return Promise.resolve(true); },
    /** Completes Store validation initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns effective Store lifecycle and classification policy. */
    policy: function () { return ((CONFIG.get('store') || {}).store) || {}; },
    /** Extracts generated-service result items. */
    items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Validates Store classification and effective dates. */
    validateClassification: function (model) {
        let policy = this.policy();
        if (!(policy.types || []).includes(model.type || 'PHYSICAL') || !(policy.statuses || []).includes(model.status || 'DRAFT')) {
            throw SERVICE.DefaultStoreEnterpriseScopeService.error('ERR_STORE_00003', 'Store type or status is not allowed by configuration');
        }
        if (model.effectiveFrom && model.effectiveTo && new Date(model.effectiveFrom).getTime() > new Date(model.effectiveTo).getTime()) {
            throw SERVICE.DefaultStoreEnterpriseScopeService.error('ERR_STORE_00003', 'Store effective-from date must not follow effective-to date');
        }
        return true;
    },
    /** Prepares a new Store for persistence. */
    prepareStoreSave: function (request) {
        SERVICE.DefaultStoreEnterpriseScopeService.scopeNewModel(request, 'store', ['storeCode']);
        request.model.type = request.model.type || 'PHYSICAL'; request.model.status = request.model.status || 'DRAFT';
        this.validateClassification(request.model); return Promise.resolve(true);
    },
    /** Loads exactly one Store selected by a scoped update. */
    loadExisting: async function (request) {
        await SERVICE.DefaultStoreEnterpriseScopeService.scopeQuery(request);
        let response = await SERVICE.DefaultStoreService.get({ tenant: request.tenant, authData: request.authData,
            query: Object.assign({}, request.query), searchOptions: { limit: 2 } });
        let items = this.items(response);
        if (items.length !== 1) throw SERVICE.DefaultStoreEnterpriseScopeService.error('ERR_STORE_00003', 'Store update must identify one existing store');
        return items[0];
    },
    /** Validates a configured Store lifecycle transition. */
    validateTransition: function (from, to) {
        if (!to || to === from) return true;
        if (!((this.policy().allowedTransitions || {})[from] || []).includes(to)) {
            throw SERVICE.DefaultStoreEnterpriseScopeService.error('ERR_STORE_00004', 'Store transition from ' + from + ' to ' + to + ' is not allowed');
        }
        return true;
    },
    /** Prevents Store retirement while live warehouse assignments remain. */
    assertRetirementSafe: async function (existing, nextStatus, request) {
        if (nextStatus !== 'RETIRED' || existing.status === 'RETIRED') return true;
        let response = await SERVICE.DefaultStoreWarehouseAssignmentService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: existing.enterpriseCode, storeCode: existing.storeCode, status: { $ne: 'RETIRED' } }, searchOptions: { limit: 1 } });
        if (this.items(response).length) throw SERVICE.DefaultStoreEnterpriseScopeService.error('ERR_STORE_00008', 'Retire warehouse assignments before retiring their store');
        return true;
    },
    /** Prepares one governed Store update. */
    prepareStoreUpdate: async function (request) {
        let existing = await this.loadExisting(request); let patch = request.model && (request.model.$set || request.model) || {};
        ['code', 'enterpriseCode', 'storeCode'].forEach(property => {
            if (patch[property] !== undefined && patch[property] !== existing[property]) {
                throw SERVICE.DefaultStoreEnterpriseScopeService.error('ERR_STORE_00006', 'Store identity property ' + property + ' is immutable');
            }
        });
        let candidate = Object.assign({}, existing, patch); this.validateClassification(candidate);
        this.validateTransition(existing.status, candidate.status); await this.assertRetirementSafe(existing, candidate.status, request);
        patch.enterpriseCode = existing.enterpriseCode; return true;
    },
    /** Rejects destructive Store deletion. */
    rejectHardDelete: function () {
        return Promise.reject(SERVICE.DefaultStoreEnterpriseScopeService.error('ERR_STORE_00007', 'Stores must be retired instead of deleted'));
    }
};
