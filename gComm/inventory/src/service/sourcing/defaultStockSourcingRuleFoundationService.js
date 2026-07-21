/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module inventory/service/sourcing/DefaultStockSourcingRuleFoundationService
 * @description Governs declarative sourcing Rule criteria and ordered Stock Pool references without executing code or calculating availability.
 * @layer service
 * @owner inventory
 * @override Projects may extend configured context keys while preserving declarative matching and authoritative Pool references.
 */
module.exports = {
    /** Initializes sourcing Rule governance. */ init: function () { return Promise.resolve(true); },
    /** Completes sourcing Rule governance initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns effective sourcing configuration. */ policy: function () { return ((CONFIG.get('inventory') || {}).stockSourcing) || {}; },
    /** Extracts generated-service result items. */ items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Validates one declarative criterion value. */
    validCriterion: function (value) {
        let values = Array.isArray(value) ? value : [value];
        return values.length > 0 && values.every(item => ['string', 'number', 'boolean'].includes(typeof item));
    },
    /** Validates Rule status, ordering, outcome, criteria, Pool references, and dates. */
    validateModel: function (model) {
        let policy = this.policy(); let criteria = model.criteria || {}; let poolCodes = model.poolCodes || [];
        let priority = model.priority === undefined ? 100 : model.priority; let keys = Object.keys(criteria);
        let from = model.effectiveFrom && new Date(model.effectiveFrom).getTime(); let to = model.effectiveTo && new Date(model.effectiveTo).getTime();
        if (!(policy.statuses || []).includes(model.status || 'DRAFT') || !(policy.ruleOutcomes || []).includes(model.outcome || 'INCLUDE') ||
            !Number.isInteger(priority) || priority < Number(policy.minimumPriority || 0) || priority > Number(policy.maximumPriority || 999999) ||
            !Array.isArray(poolCodes) || !poolCodes.length || poolCodes.length > Number(policy.maximumPoolsPerRule || 100) ||
            new Set(poolCodes).size !== poolCodes.length || keys.some(key => !(policy.contextKeys || []).includes(key) || key.startsWith('$') || !this.validCriterion(criteria[key])) ||
            (model.effectiveFrom && !Number.isFinite(from)) || (model.effectiveTo && !Number.isFinite(to)) || (from && to && from > to)) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00021', 'Stock sourcing Rule definition is invalid');
        }
        poolCodes.forEach(code => SERVICE.DefaultInventoryEnterpriseScopeService.validateBusinessCode(code, 'Stock Pool'));
        return true;
    },
    /** Loads and validates the owning Policy and referenced Pools. */
    loadDependencies: async function (request, model) {
        let policyResponse = await SERVICE.DefaultStockSourcingPolicyService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: model.enterpriseCode, policyCode: model.policyCode }, searchOptions: { limit: 2 } });
        let poolResponse = await SERVICE.DefaultStockPoolService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: model.enterpriseCode, poolCode: { $in: model.poolCodes } }, searchOptions: { limit: model.poolCodes.length + 1 } });
        let policies = this.items(policyResponse); let pools = this.items(poolResponse);
        let activeRequired = model.status === 'ACTIVE'; let poolCodes = new Set(pools.map(pool => pool.poolCode));
        if (policies.length !== 1 || policies[0].status === 'RETIRED' || pools.length !== model.poolCodes.length ||
            model.poolCodes.some(code => !poolCodes.has(code)) || pools.some(pool => pool.status === 'RETIRED') ||
            activeRequired && (policies[0].status !== 'ACTIVE' || pools.some(pool => pool.status !== 'ACTIVE'))) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00024', 'Sourcing Rule requires available Policy and Stock Pools');
        }
        return { policy: policies[0], pools: pools };
    },
    /** Prepares one new sourcing Rule. */
    prepareRuleSave: async function (request) {
        SERVICE.DefaultInventoryEnterpriseScopeService.scopeNewModel(request, 'stockSourcingRule', ['policyCode', 'ruleCode']);
        request.model.status = request.model.status || 'DRAFT'; request.model.priority = request.model.priority === undefined ? 100 : request.model.priority;
        request.model.outcome = request.model.outcome || 'INCLUDE'; request.model.criteria = request.model.criteria || {};
        this.validateModel(request.model); await this.loadDependencies(request, request.model); return true;
    },
    /** Loads exactly one sourcing Rule selected by a scoped update. */
    loadExisting: async function (request) {
        await SERVICE.DefaultInventoryEnterpriseScopeService.scopeQuery(request);
        let response = await SERVICE.DefaultStockSourcingRuleService.get({ tenant: request.tenant, authData: request.authData,
            query: Object.assign({}, request.query), searchOptions: { limit: 2 } }); let items = this.items(response);
        if (items.length !== 1) throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00021', 'Sourcing Rule update must identify one record');
        return items[0];
    },
    /** Validates a configured Rule lifecycle transition. */
    validateTransition: function (from, to) {
        if (!to || to === from) return true;
        if (!((this.policy().allowedTransitions || {})[from] || []).includes(to)) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00022', 'Stock sourcing Rule transition is not allowed');
        }
        return true;
    },
    /** Prepares a governed sourcing Rule update. */
    prepareRuleUpdate: async function (request) {
        let existing = await this.loadExisting(request); let patch = request.model && (request.model.$set || request.model) || {};
        ['code', 'enterpriseCode', 'policyCode', 'ruleCode'].forEach(property => {
            if (patch[property] !== undefined && patch[property] !== existing[property]) {
                throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00023', 'Sourcing Rule identity property ' + property + ' is immutable');
            }
        });
        let candidate = Object.assign({}, existing, patch); this.validateModel(candidate); this.validateTransition(existing.status, candidate.status);
        await this.loadDependencies(request, candidate); patch.enterpriseCode = existing.enterpriseCode; return true;
    },
    /** Rejects destructive sourcing Rule deletion. */
    rejectHardDelete: function () { return Promise.reject(SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00025', 'Sourcing Rules must be retired')); }
};
