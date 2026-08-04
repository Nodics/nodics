/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/service/lifecycle/DefaultOrderRefundApprovalService @description Prepares configured Refund approval routing from exact calculation and risk evidence. @layer service @owner order */
module.exports = {
    /**
     * Initializes the module artifact within the order-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, config: function () { return (((CONFIG.get('order') || {}).orderLifecycle || {}).refundApproval) || {}; },
    /**
     * Executes the error operation within the order-owned layered contract.
     *
     * @param {*} message Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    error: function (message) { let error = new Error(message); error.code = 'ERR_ORD_00063'; return error; },
    /**
     * Executes the exact operation within the order-owned layered contract.
     *
     * @param {*} value Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    exact: function (value) { if (typeof value !== 'string' || !/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(value)) throw this.error('Refund approval amount must be exact'); let p = value.split('.'); return { value: BigInt(p.join('')), scale: (p[1] || '').length }; },
    /**
     * Executes the lte operation within the order-owned layered contract.
     *
     * @param {*} left Value defined by the surrounding Nodics operation contract.
     * @param {*} right Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    lte: function (left, right) { let a = this.exact(left), b = this.exact(right), scale = Math.max(a.scale, b.scale); return a.value * 10n ** BigInt(scale - a.scale) <= b.value * 10n ** BigInt(scale - b.scale); },
    /**
     * Executes the risk operation within the order-owned layered contract.
     *
     * @param {*} value Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    risk: function (value) { value=value||{}; if(JSON.stringify(value).match(/raw|payload|secret|token|password|deviceFingerprint|ipAddress/i)) throw this.error('Refund approval risk evidence must be normalized and permission safe'); let allowed=['requiresHumanReview','riskBand','riskScore','signalCodes','assessmentCode','providerCode']; if(Object.keys(value).some(key=>!allowed.includes(key))) throw this.error('Refund approval risk evidence contains unsupported fields'); if(value.signalCodes&&!Array.isArray(value.signalCodes)) throw this.error('Refund approval risk signal codes are invalid'); return { requiresHumanReview:value.requiresHumanReview===true,riskBand:value.riskBand,riskScore:value.riskScore,signalCodes:[].concat(value.signalCodes||[]).slice(0,50),assessmentCode:value.assessmentCode,providerCode:value.providerCode }; },
    /**
     * Executes the value operation within the order-owned layered contract.
     *
     * @param {*} input Value defined by the surrounding Nodics operation contract.
     * @param {*} key Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    value: function (input,key) { let model=input.request||{}, context=input.policyContext||{}, risk=input.riskEvidence||{}; let map={enterpriseCode:model.entCode,channelCode:model.channelCode,countryCode:model.countryCode,paymentMethodCode:context.paymentMethodCode,returnReasonCode:model.reasonCode,productType:context.productType,customerSegment:context.customerSegment,customerTrustLevel:context.customerTrustLevel,historicalReturnBand:context.historicalReturnBand,riskBand:risk.riskBand,providerRiskBand:risk.riskBand}; return map[key]; },
    /**
     * Executes the matches operation within the order-owned layered contract.
     *
     * @param {*} input Value defined by the surrounding Nodics operation contract.
     * @param {*} rule Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    matches: function (input,rule) { let fields=['enterpriseCode','channelCode','countryCode','paymentMethodCode','returnReasonCode','productType','customerSegment','customerTrustLevel','historicalReturnBand','riskBand','providerRiskBand']; return fields.every(key=>!rule[key]||[].concat(rule[key]).includes(this.value(input,key))) && (!rule.maximumAmount||this.lte(input.calculation.amount,rule.maximumAmount)); },
    /**
     * Prepares the module artifact within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    prepare: function (request) { let input = request.refundApproval || {}; if (!input.request || input.request.requestType !== 'REFUND' || !input.calculation) throw this.error('Refund approval requires immutable request and calculation evidence'); let policy = this.config(); let normalizedRisk = this.risk(input.riskEvidence), normalizedInput=Object.assign({},input,{riskEvidence:normalizedRisk}); let rule=[].concat(policy.approvalRules||[]).find(value=>this.matches(normalizedInput,value)), desired=rule&&rule.route||policy.defaultRoute||'MANUAL_REVIEW'; if(!['AUTO_APPROVE','MANUAL_REVIEW','REJECT'].includes(desired)) throw this.error('Refund approval policy route is unsupported'); let auto = desired==='AUTO_APPROVE' && policy.autoApprovalEnabled === true && (policy.autoApprovalRequesterTypes || []).includes(input.request.requesterType) && normalizedRisk.requiresHumanReview !== true && this.lte(input.calculation.amount, (rule&&rule.maximumAmount)||policy.autoApprovalMaximumAmount || '0'); return { route: desired==='AUTO_APPROVE'&&!auto?'MANUAL_REVIEW':desired, ruleCode:rule&&rule.ruleCode, requestCode: input.request.requestCode, requestVersion: input.request.version, calculation: input.calculation, riskEvidence: normalizedRisk }; },
    /**
     * Prepares approval within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    prepareApproval: function (request, response, process) { try { response.refundApproval = this.prepare(request); process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); } }, handleSuccessEnd: function (request, response, process) { process.resolve(response.refundApproval); }, handleErrorEnd: function (request, response, process) { process.reject(response.error || this.error('Refund approval preparation Pipeline failed')); },
};
