/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module order/service/lifecycle/DefaultOrderLifecyclePolicyService @description Resolves bounded layered Order lifecycle policy without taking owner decisions from Product, Payment, Fulfillment, Tax, Promotion, or Workflow. @layer service @owner order */
module.exports = {
    init: function () { return Promise.resolve(true); },
    postInit: function () { return Promise.resolve(true); },
    error: function (message) { let error = new Error(message); error.code = 'ERR_ORD_00069'; return error; },
    config: function () { return ((((CONFIG.get('order') || {}).orderLifecycle || {}).policy) || {}); },
    safeValue: function (value) { return value === undefined || value === null || value === '' ? '*' : String(value); },
    matches: function (rule, context, fields) {
        return fields.every(field => {
            let expected = rule[field];
            if (expected === undefined || expected === null || expected === '*') return true;
            let actual = this.safeValue(context[field]);
            return Array.isArray(expected) ? expected.includes('*') || expected.map(String).includes(actual) : String(expected) === actual;
        });
    },
    select: function (collection, context, fields) {
        let rules = [].concat(this.config()[collection] || []);
        let selected = rules.find(rule => this.matches(rule, context || {}, fields || []));
        if (!selected) throw this.error('No governed lifecycle policy matched ' + collection);
        return JSON.parse(JSON.stringify(selected));
    },
    cancellationWindow: function (context) { return this.select('cancellationWindows', context, ['tenant', 'enterpriseCode', 'siteCode', 'channelCode', 'productType']); },
    returnWindow: function (context) { return this.select('returnWindows', context, ['productCode', 'categoryCode', 'countryCode', 'customerSegment', 'channelCode']); },
    refundableAmount: function (context) { return this.select('refundableAmounts', context, ['enterpriseCode', 'countryCode', 'channelCode']); },
    productRestriction: function (context) { return this.select('productRestrictions', context, ['productType', 'categoryCode']); },
    approvalEscalation: function (context) { return this.select('approvalEscalations', context, ['departmentCode', 'enterpriseCode', 'countryCode', 'paymentMethodCode']); },
    evidenceRequirement: function (context) { return this.select('evidenceRequirements', context, ['requestType']); },
    lifecycleTimer: function (context) { return this.select('lifecycleTimers', context, []); },
    exceptionRoute: function (context) {
        let rules = [].concat(this.config().exceptionRoutes || []), findingCode = this.safeValue((context || {}).findingCode);
        let selected = rules.find(rule => [].concat(rule.findingCodes || []).includes(findingCode));
        if (!selected) throw this.error('No governed exception route matched finding');
        let result = JSON.parse(JSON.stringify(selected));
        result.owner = result.ownerByFinding[findingCode];
        return result;
    },
};
