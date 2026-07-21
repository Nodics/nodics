/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module inventory/service/sourcing/DefaultStockSourcingPolicyFoundationService
 * @description Governs enterprise-scoped sourcing Policy identity, ordering, lifecycle, effective dates, and Rule retirement.
 * @layer service
 * @owner inventory
 * @override Projects may extend selection modes and transitions while preserving scope, stable identity, and sourcing history.
 */
module.exports = {
    /** Initializes sourcing Policy governance. */ init: function () { return Promise.resolve(true); },
    /** Completes sourcing Policy governance initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns effective sourcing policy configuration. */ policy: function () { return ((CONFIG.get('inventory') || {}).stockSourcing) || {}; },
    /** Extracts generated-service result items. */ items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Validates Policy classification, ordering, and effective dates. */
    validateModel: function (model) {
        let policy = this.policy(); let priority = model.priority === undefined ? 100 : model.priority;
        let from = model.effectiveFrom && new Date(model.effectiveFrom).getTime(); let to = model.effectiveTo && new Date(model.effectiveTo).getTime();
        if (!(policy.statuses || []).includes(model.status || 'DRAFT') || !(policy.selectionModes || []).includes(model.selectionMode || 'FIRST_MATCH') ||
            !Number.isInteger(priority) || priority < Number(policy.minimumPriority || 0) || priority > Number(policy.maximumPriority || 999999) ||
            (model.effectiveFrom && !Number.isFinite(from)) || (model.effectiveTo && !Number.isFinite(to)) || (from && to && from > to)) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00021', 'Stock sourcing Policy definition is invalid');
        }
        return true;
    },
    /** Prepares one new sourcing Policy. */
    preparePolicySave: function (request) {
        SERVICE.DefaultInventoryEnterpriseScopeService.scopeNewModel(request, 'stockSourcingPolicy', ['policyCode']);
        request.model.status = request.model.status || 'DRAFT'; request.model.priority = request.model.priority === undefined ? 100 : request.model.priority;
        request.model.selectionMode = request.model.selectionMode || 'FIRST_MATCH'; this.validateModel(request.model); return Promise.resolve(true);
    },
    /** Loads exactly one sourcing Policy selected by a scoped update. */
    loadExisting: async function (request) {
        await SERVICE.DefaultInventoryEnterpriseScopeService.scopeQuery(request);
        let response = await SERVICE.DefaultStockSourcingPolicyService.get({ tenant: request.tenant, authData: request.authData,
            query: Object.assign({}, request.query), searchOptions: { limit: 2 } }); let items = this.items(response);
        if (items.length !== 1) throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00021', 'Sourcing Policy update must identify one record');
        return items[0];
    },
    /** Validates a configured sourcing lifecycle transition. */
    validateTransition: function (from, to) {
        if (!to || to === from) return true;
        if (!((this.policy().allowedTransitions || {})[from] || []).includes(to)) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00022', 'Stock sourcing Policy transition is not allowed');
        }
        return true;
    },
    /** Prevents Policy retirement while non-retired Rules remain. */
    assertRetirementSafe: async function (existing, nextStatus, request) {
        if (nextStatus !== 'RETIRED' || existing.status === 'RETIRED') return true;
        let response = await SERVICE.DefaultStockSourcingRuleService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: existing.enterpriseCode, policyCode: existing.policyCode, status: { $ne: 'RETIRED' } }, searchOptions: { limit: 1 } });
        if (this.items(response).length) throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00024', 'Retire sourcing Rules before retiring the Policy');
        return true;
    },
    /** Prepares a governed sourcing Policy update. */
    preparePolicyUpdate: async function (request) {
        let existing = await this.loadExisting(request); let patch = request.model && (request.model.$set || request.model) || {};
        ['code', 'enterpriseCode', 'policyCode'].forEach(property => {
            if (patch[property] !== undefined && patch[property] !== existing[property]) {
                throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00023', 'Sourcing Policy identity property ' + property + ' is immutable');
            }
        });
        let candidate = Object.assign({}, existing, patch); this.validateModel(candidate); this.validateTransition(existing.status, candidate.status);
        await this.assertRetirementSafe(existing, candidate.status, request); patch.enterpriseCode = existing.enterpriseCode; return true;
    },
    /** Rejects destructive sourcing Policy deletion. */
    rejectHardDelete: function () { return Promise.reject(SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00025', 'Sourcing Policies must be retired')); }
};
