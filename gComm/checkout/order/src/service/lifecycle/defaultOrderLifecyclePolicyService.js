/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module order/service/lifecycle/DefaultOrderLifecyclePolicyService @description Resolves bounded layered Order lifecycle policy without taking owner decisions from Product, Payment, Fulfillment, Tax, Promotion, or Workflow. @layer service @owner order */
module.exports = {
    /**
     * Initializes the module artifact within the order-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    init: function () { return Promise.resolve(true); },
    /**
     * Completes initialization for the module artifact within the order-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    postInit: function () { return Promise.resolve(true); },
    /**
     * Executes the error operation within the order-owned layered contract.
     *
     * @param {*} message Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    error: function (message) { let error = new Error(message); error.code = 'ERR_ORD_00069'; return error; },
    /**
     * Executes the config operation within the order-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    config: function () { return ((((CONFIG.get('order') || {}).orderLifecycle || {}).policy) || {}); },
    /**
     * Executes the safe value operation within the order-owned layered contract.
     *
     * @param {*} value Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    safeValue: function (value) { return value === undefined || value === null || value === '' ? '*' : String(value); },
    /**
     * Executes the matches operation within the order-owned layered contract.
     *
     * @param {*} rule Value defined by the surrounding Nodics operation contract.
     * @param {*} context Value defined by the surrounding Nodics operation contract.
     * @param {*} fields Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    matches: function (rule, context, fields) {
        return fields.every(field => {
            let expected = rule[field];
            if (expected === undefined || expected === null || expected === '*') return true;
            let actual = this.safeValue(context[field]);
            return Array.isArray(expected) ? expected.includes('*') || expected.map(String).includes(actual) : String(expected) === actual;
        });
    },
    /**
     * Executes the select operation within the order-owned layered contract.
     *
     * @param {*} collection Value defined by the surrounding Nodics operation contract.
     * @param {*} context Value defined by the surrounding Nodics operation contract.
     * @param {*} fields Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    select: function (collection, context, fields) {
        let rules = [].concat(this.config()[collection] || []);
        let selected = rules.find(rule => this.matches(rule, context || {}, fields || []));
        if (!selected) throw this.error('No governed lifecycle policy matched ' + collection);
        return JSON.parse(JSON.stringify(selected));
    },
    /**
     * Executes the cancellation window operation within the order-owned layered contract.
     *
     * @param {*} context Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    cancellationWindow: function (context) { return this.select('cancellationWindows', context, ['tenant', 'enterpriseCode', 'siteCode', 'channelCode', 'productType']); },
    /**
     * Returns window within the order-owned layered contract.
     *
     * @param {*} context Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    returnWindow: function (context) { return this.select('returnWindows', context, ['productCode', 'categoryCode', 'countryCode', 'customerSegment', 'channelCode']); },
    /**
     * Executes the refundable amount operation within the order-owned layered contract.
     *
     * @param {*} context Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    refundableAmount: function (context) { return this.select('refundableAmounts', context, ['enterpriseCode', 'countryCode', 'channelCode']); },
    /**
     * Executes the product restriction operation within the order-owned layered contract.
     *
     * @param {*} context Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    productRestriction: function (context) { return this.select('productRestrictions', context, ['productType', 'categoryCode']); },
    /**
     * Executes the approval escalation operation within the order-owned layered contract.
     *
     * @param {*} context Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    approvalEscalation: function (context) { return this.select('approvalEscalations', context, ['departmentCode', 'enterpriseCode', 'countryCode', 'paymentMethodCode']); },
    /**
     * Executes the evidence requirement operation within the order-owned layered contract.
     *
     * @param {*} context Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    evidenceRequirement: function (context) { return this.select('evidenceRequirements', context, ['requestType']); },
    /**
     * Executes the lifecycle timer operation within the order-owned layered contract.
     *
     * @param {*} context Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    lifecycleTimer: function (context) { return this.select('lifecycleTimers', context, []); },
    /**
     * Executes the exception route operation within the order-owned layered contract.
     *
     * @param {*} context Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    exceptionRoute: function (context) {
        let rules = [].concat(this.config().exceptionRoutes || []), findingCode = this.safeValue((context || {}).findingCode);
        let selected = rules.find(rule => [].concat(rule.findingCodes || []).includes(findingCode));
        if (!selected) throw this.error('No governed exception route matched finding');
        let result = JSON.parse(JSON.stringify(selected));
        result.owner = result.ownerByFinding[findingCode];
        return result;
    },
};
