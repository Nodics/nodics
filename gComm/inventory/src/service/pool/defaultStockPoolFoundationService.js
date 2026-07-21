/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module inventory/service/pool/DefaultStockPoolFoundationService
 * @description Governs enterprise-scoped Stock Pool identity, classification, lifecycle, effective dates, and retirement dependencies.
 * @layer service
 * @owner inventory
 * @override Projects may extend Pool classifications and transitions while preserving scope, stable identity, membership history, and no quantity ownership.
 */
module.exports = {
    /** Initializes Stock Pool governance. */ init: function () { return Promise.resolve(true); },
    /** Completes Stock Pool governance initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns effective Stock Pool policy. */ policy: function () { return ((CONFIG.get('inventory') || {}).stockPool) || {}; },
    /** Extracts generated-service result items. */ items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Validates configured Pool classifications and effective dates. */
    validateModel: function (model) {
        let policy = this.policy(); let from = model.effectiveFrom && new Date(model.effectiveFrom).getTime();
        let to = model.effectiveTo && new Date(model.effectiveTo).getTime();
        if (!(policy.statuses || []).includes(model.status || 'DRAFT') || !(policy.types || []).includes(model.type || 'GENERAL') ||
            model.effectiveFrom && !Number.isFinite(from) || model.effectiveTo && !Number.isFinite(to) || from && to && from > to) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00016', 'Stock Pool classification or effective dates are invalid');
        }
        return true;
    },
    /** Prepares one new Pool with a deterministic enterprise identity. */
    preparePoolSave: function (request) {
        SERVICE.DefaultInventoryEnterpriseScopeService.scopeNewModel(request, 'stockPool', ['poolCode']);
        request.model.type = request.model.type || 'GENERAL'; request.model.status = request.model.status || 'DRAFT';
        this.validateModel(request.model); return Promise.resolve(true);
    },
    /** Loads exactly one Pool selected by a scoped update. */
    loadExisting: async function (request) {
        await SERVICE.DefaultInventoryEnterpriseScopeService.scopeQuery(request);
        let response = await SERVICE.DefaultStockPoolService.get({ tenant: request.tenant, authData: request.authData,
            query: Object.assign({}, request.query), searchOptions: { limit: 2 } });
        let items = this.items(response);
        if (items.length !== 1) throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00016', 'Stock Pool update must identify one existing Pool');
        return items[0];
    },
    /** Validates the configured Pool lifecycle. */
    validateTransition: function (from, to) {
        if (!to || to === from) return true;
        if (!((this.policy().allowedTransitions || {})[from] || []).includes(to)) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00017', 'Stock Pool lifecycle transition is not allowed');
        }
        return true;
    },
    /** Prevents Pool retirement while non-retired memberships remain. */
    assertRetirementSafe: async function (existing, nextStatus, request) {
        if (nextStatus !== 'RETIRED' || existing.status === 'RETIRED') return true;
        let response = await SERVICE.DefaultStockPoolMemberService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: existing.enterpriseCode, poolCode: existing.poolCode, status: { $ne: 'RETIRED' } },
            searchOptions: { limit: 1 } });
        if (this.items(response).length) throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00019', 'Retire Stock Pool memberships before retiring the Pool');
        return true;
    },
    /** Prepares a governed Pool update. */
    preparePoolUpdate: async function (request) {
        let existing = await this.loadExisting(request); let patch = request.model && (request.model.$set || request.model) || {};
        ['code', 'enterpriseCode', 'poolCode'].forEach(property => {
            if (patch[property] !== undefined && patch[property] !== existing[property]) {
                throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00018', 'Stock Pool identity property ' + property + ' is immutable');
            }
        });
        let candidate = Object.assign({}, existing, patch); this.validateModel(candidate);
        this.validateTransition(existing.status, candidate.status); await this.assertRetirementSafe(existing, candidate.status, request);
        patch.enterpriseCode = existing.enterpriseCode; return true;
    },
    /** Rejects destructive Pool deletion. */
    rejectHardDelete: function () {
        return Promise.reject(SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00020', 'Stock Pools must be retired instead of deleted'));
    }
};
