/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module inventory/service/sourcing/DefaultStockSourcingEvaluationService
 * @description Evaluates active declarative sourcing Policies and Rules into ordered eligible Pool references without reading Stock quantities.
 * @layer service
 * @owner inventory
 * @override Projects may replace matching and ranking while preserving enterprise isolation, deterministic results, and no availability side effects.
 */
module.exports = {
    /** Initializes sourcing evaluation. */ init: function () { return Promise.resolve(true); },
    /** Completes sourcing evaluation initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Extracts generated-service result items. */ items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Returns true when one lifecycle record is active at the supplied instant. */
    effective: function (record, timestamp) {
        let from = record.effectiveFrom && new Date(record.effectiveFrom).getTime(); let to = record.effectiveTo && new Date(record.effectiveTo).getTime();
        return record.status === 'ACTIVE' && (!from || from <= timestamp) && (!to || to >= timestamp);
    },
    /** Compares deterministic priority and business identity. */
    compare: function (left, right) { return left.priority - right.priority || String(left.code).localeCompare(String(right.code)); },
    /** Returns true when every declarative criterion matches the request context. */
    matches: function (criteria, context) {
        return Object.keys(criteria || {}).every(key => {
            let expected = Array.isArray(criteria[key]) ? criteria[key] : [criteria[key]];
            let actual = Array.isArray(context[key]) ? context[key] : [context[key]];
            return actual.some(value => expected.includes(value));
        });
    },
    /** Evaluates sourcing context into ordered Pool references and traceable matched Rule codes. */
    evaluate: async function (request) {
        request = request || {}; let enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request);
        let context = request.context || {}; let allowed = (((CONFIG.get('inventory') || {}).stockSourcing || {}).contextKeys) || [];
        if (Object.keys(context).some(key => !allowed.includes(key) || key.startsWith('$'))) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00021', 'Sourcing context contains an unsupported key');
        }
        let timestamp = request.at ? new Date(request.at).getTime() : Date.now();
        if (!Number.isFinite(timestamp)) throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00021', 'Sourcing evaluation time is invalid');
        let policyResponse = await SERVICE.DefaultStockSourcingPolicyService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: enterpriseCode, status: 'ACTIVE' } });
        let allPolicies = this.items(policyResponse); let boundaries = [];
        allPolicies.forEach(policy => [policy.effectiveFrom, policy.effectiveTo].forEach(value => {
            let boundary = value && new Date(value).getTime(); if (boundary && boundary > timestamp) boundaries.push(boundary);
        }));
        let policies = allPolicies.filter(policy => this.effective(policy, timestamp)).sort(this.compare);
        let selected = []; let excluded = new Set(); let matchedRuleCodes = [];
        for (let policy of policies) {
            let ruleResponse = await SERVICE.DefaultStockSourcingRuleService.get({ tenant: request.tenant, authData: request.authData,
                query: { enterpriseCode: enterpriseCode, policyCode: policy.policyCode, status: 'ACTIVE' } });
            let allRules = this.items(ruleResponse); allRules.forEach(rule => [rule.effectiveFrom, rule.effectiveTo].forEach(value => {
                let boundary = value && new Date(value).getTime(); if (boundary && boundary > timestamp) boundaries.push(boundary);
            }));
            let rules = allRules.filter(rule => this.effective(rule, timestamp) && this.matches(rule.criteria || {}, context)).sort(this.compare);
            for (let rule of rules) {
                matchedRuleCodes.push(rule.ruleCode);
                if (rule.outcome === 'EXCLUDE') {
                    rule.poolCodes.forEach(code => excluded.add(code)); selected = selected.filter(code => !excluded.has(code));
                } else {
                    rule.poolCodes.forEach(code => { if (!excluded.has(code) && !selected.includes(code)) selected.push(code); });
                }
                if (policy.selectionMode === 'FIRST_MATCH') break;
            }
            if (selected.length && policy.selectionMode === 'FIRST_MATCH') break;
        }
        return { enterpriseCode: enterpriseCode, poolCodes: selected, matchedRuleCodes: matchedRuleCodes,
            evaluatedAt: new Date(timestamp).toISOString(), nextEffectiveAt: boundaries.length ? new Date(Math.min.apply(Math, boundaries)).toISOString() : undefined };
    }
};
