/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** Validates Stock Sourcing schemas, lifecycle, dependencies, declarative matching, ordering, exclusions, boundaries, and customization. */
const assert = require('assert');
const inventory = require('../config/properties').inventory;
const schemas = require('../src/schemas/schemas').inventory;
const interceptors = require('../src/interceptors/interceptors');
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError };
global.CONFIG = { get: key => key === 'inventory' ? inventory : undefined };
global.SERVICE = {};
SERVICE.DefaultInventoryEnterpriseScopeService = require('../src/service/foundation/defaultInventoryEnterpriseScopeService');
const policyService = require('../src/service/sourcing/defaultStockSourcingPolicyFoundationService');
const ruleService = require('../src/service/sourcing/defaultStockSourcingRuleFoundationService');
const evaluationService = require('../src/service/sourcing/defaultStockSourcingEvaluationService');

['stockSourcingPolicy', 'stockSourcingRule'].forEach(name => {
    assert.strictEqual(schemas[name].router.enabled, false); assert.strictEqual(schemas[name].event.enabled, false);
});
['stockSourcingPolicyPreSave', 'stockSourcingPolicyPreGet', 'stockSourcingPolicyPreUpdate', 'stockSourcingPolicyPreRemove',
    'stockSourcingRulePreSave', 'stockSourcingRulePreGet', 'stockSourcingRulePreUpdate', 'stockSourcingRulePreRemove']
    .forEach(name => assert(interceptors[name]));

let policies = []; let rules = [];
const matches = (item, query) => Object.keys(query || {}).every(key => {
    if (query[key] && query[key].$ne !== undefined) return item[key] !== query[key].$ne;
    if (query[key] && query[key].$in) return query[key].$in.includes(item[key]);
    return item[key] === query[key];
});
SERVICE.DefaultStockSourcingPolicyService = { get: async request => ({ result: policies.filter(item => matches(item, request.query)) }) };
SERVICE.DefaultStockSourcingRuleService = { get: async request => ({ result: rules.filter(item => matches(item, request.query)) }) };
SERVICE.DefaultStockPoolService = { get: async request => ({ result: ['uae', 'pickup'].filter(code =>
    request.query.poolCode.$in.includes(code)).map(code => ({ enterpriseCode: request.query.enterpriseCode, poolCode: code, status: 'ACTIVE' })) }) };
const authData = { enterprise: { code: 'enterpriseA' } };

(async () => {
    let policyRequest = { tenant: 'tenantA', authData: authData, model: { policyCode: 'default', name: 'Default sourcing', selectionMode: 'COLLECT_MATCHES' } };
    await policyService.preparePolicySave(policyRequest); assert.strictEqual(policyRequest.model.code, 'enterpriseA::stockSourcingPolicy::default');
    policies.push(Object.assign({}, policyRequest.model)); policies[0].status = 'ACTIVE';

    let includeRequest = { tenant: 'tenantA', authData: authData, model: { policyCode: 'default', ruleCode: 'uae-web', name: 'UAE web',
        status: 'ACTIVE', priority: 10, criteria: { countryCode: 'AE', channelCode: ['WEB', 'APP'] }, poolCodes: ['uae', 'pickup'] } };
    await ruleService.prepareRuleSave(includeRequest); rules.push(Object.assign({}, includeRequest.model));
    let excludeRequest = { tenant: 'tenantA', authData: authData, model: { policyCode: 'default', ruleCode: 'no-pickup', name: 'No pickup delivery',
        status: 'ACTIVE', priority: 20, outcome: 'EXCLUDE', criteria: { fulfillmentType: 'DELIVERY' }, poolCodes: ['pickup'] } };
    await ruleService.prepareRuleSave(excludeRequest); rules.push(Object.assign({}, excludeRequest.model));

    let result = await evaluationService.evaluate({ tenant: 'tenantA', authData: authData,
        context: { countryCode: 'AE', channelCode: 'WEB', fulfillmentType: 'DELIVERY' } });
    assert.deepStrictEqual(result.poolCodes, ['uae']); assert.deepStrictEqual(result.matchedRuleCodes, ['uae-web', 'no-pickup']);
    let none = await evaluationService.evaluate({ tenant: 'tenantA', authData: authData, context: { countryCode: 'US' } });
    assert.deepStrictEqual(none.poolCodes, []);

    assert.throws(() => ruleService.validateModel({ status: 'DRAFT', outcome: 'INCLUDE', priority: 1,
        criteria: { $where: 'script' }, poolCodes: ['uae'] }), error => error.code === 'ERR_INV_00021');
    await assert.rejects(evaluationService.evaluate({ authData: authData, context: { unknown: 'x' } }), error => error.code === 'ERR_INV_00021');
    await assert.rejects(ruleService.prepareRuleUpdate({ tenant: 'tenantA', authData: authData,
        query: { code: rules[0].code }, model: { ruleCode: 'changed' } }), error => error.code === 'ERR_INV_00023');
    await assert.rejects(policyService.preparePolicyUpdate({ tenant: 'tenantA', authData: authData,
        query: { code: policies[0].code }, model: { status: 'RETIRED' } }), error => error.code === 'ERR_INV_00024');
    inventory.stockSourcing.contextKeys.push('projectQualifier');
    ruleService.validateModel({ status: 'DRAFT', outcome: 'INCLUDE', priority: 1, criteria: { projectQualifier: 'VIP' }, poolCodes: ['uae'] });
    inventory.stockSourcing.contextKeys.pop();
    assert.throws(() => policyService.preparePolicySave({ authData: authData,
        model: { enterpriseCode: 'enterpriseB', policyCode: 'bad', name: 'Bad' } }), error => error.code === 'ERR_INV_00002');
    await assert.rejects(policyService.rejectHardDelete(), error => error.code === 'ERR_INV_00025');
    await assert.rejects(ruleService.rejectHardDelete(), error => error.code === 'ERR_INV_00025');
    console.log('Inventory Stock Sourcing foundation validated');
})().catch(error => { console.error(error); process.exit(1); });
