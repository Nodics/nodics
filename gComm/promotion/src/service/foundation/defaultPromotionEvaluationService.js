/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module promotion/service/foundation/DefaultPromotionEvaluationService
 * @description Evaluates safe declarative promotion rules into immutable discount evidence without owning Cart or Order lifecycle.
 * @layer service
 * @owner promotion
 * @override Customer modules may replace or extend evaluator strategies while preserving exact decimal arithmetic, safe metadata interpretation, coupon governance, and immutable applied-discount evidence.
 */
const SCALE = 1000000n;

const normalizeDecimal = function (value) {
  const text = String(value === undefined || value === null ? "0" : value);
  if (!/^-?(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(text)) {
    throw new Error("Invalid decimal string: " + text);
  }
  const negative = text[0] === "-";
  const unsigned = negative ? text.slice(1) : text;
  const parts = unsigned.split(".");
  const units = BigInt(parts[0] || "0") * SCALE;
  const fractionText = ((parts[1] || "") + "000000").slice(0, 6);
  const scaled = units + BigInt(fractionText || "0");
  return negative ? -scaled : scaled;
};

const formatDecimal = function (scaled) {
  const negative = scaled < 0n;
  const value = negative ? -scaled : scaled;
  const units = value / SCALE;
  const fraction = String(value % SCALE)
    .padStart(6, "0")
    .replace(/0+$/, "");
  return (
    (negative ? "-" : "") + String(units) + (fraction ? "." + fraction : ".00")
  );
};

const compareDecimal = function (left, right) {
  const a = normalizeDecimal(left);
  const b = normalizeDecimal(right);
  if (a === b) return 0;
  return a > b ? 1 : -1;
};

const valueAtPath = function (source, path) {
  if (!path) return undefined;
  return String(path)
    .split(".")
    .filter(Boolean)
    .reduce((current, segment) => {
      if (current === undefined || current === null) return undefined;
      return current[segment];
    }, source);
};

const asArray = function (value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
};

module.exports = {
  init: function () {
    return Promise.resolve(true);
  },
  postInit: function () {
    return Promise.resolve(true);
  },
  now: function () {
    return new Date();
  },
  error: function (code, message) {
    return new CLASSES.NodicsError(message, null, code);
  },
  decimal: normalizeDecimal,
  formatDecimal: formatDecimal,
  compareDecimal: compareDecimal,
  isActive: function (record, at) {
    const status = record && record.status;
    if (status && !["ACTIVE", "EVALUATED"].includes(status)) return false;
    const time = (at || this.now()).getTime();
    if (
      record.effectiveFrom &&
      new Date(record.effectiveFrom).getTime() > time
    ) {
      return false;
    }
    if (record.effectiveTo && new Date(record.effectiveTo).getTime() < time) {
      return false;
    }
    return true;
  },
  evaluateCondition: function (condition, context) {
    if (!this.isActive(condition, context.at)) {
      return { matched: false, reasonCode: "CONDITION_INACTIVE" };
    }
    const expected = condition.value || {};
    const actual =
      valueAtPath(context, condition.fieldPath) ??
      valueAtPath(context.source || {}, condition.fieldPath);
    const operator = condition.operator || "EQUALS";
    let matched = false;
    if (operator === "EXISTS") {
      matched = actual !== undefined && actual !== null && actual !== "";
    } else if (operator === "EQUALS") {
      matched =
        String(actual) === String(expected.value ?? expected.code ?? expected);
    } else if (operator === "NOT_EQUALS") {
      matched =
        String(actual) !== String(expected.value ?? expected.code ?? expected);
    } else if (operator === "IN") {
      matched = asArray(expected.values || expected.value)
        .map(String)
        .includes(String(actual));
    } else if (operator === "NOT_IN") {
      matched = !asArray(expected.values || expected.value)
        .map(String)
        .includes(String(actual));
    } else if (operator === "GREATER_THAN_OR_EQUALS") {
      matched =
        compareDecimal(
          actual || "0",
          expected.amount || expected.value || "0",
        ) >= 0;
    } else if (operator === "LESS_THAN_OR_EQUALS") {
      matched =
        compareDecimal(
          actual || "0",
          expected.amount || expected.value || "0",
        ) <= 0;
    } else {
      throw this.error(
        "ERR_PROMOTION_EVAL_0001",
        "Unsupported promotion condition operator",
      );
    }
    return {
      matched: matched,
      reasonCode: matched ? "MATCHED" : "NOT_MATCHED",
    };
  },
  evaluateRuleConditions: function (rule, conditions, context) {
    const candidates = (conditions || []).filter(
      (item) => item.ruleCode === rule.ruleCode,
    );
    if (!candidates.length) return { matched: true, conditionResults: [] };
    const conditionResults = candidates
      .slice()
      .sort((a, b) => Number(a.sequence || 100) - Number(b.sequence || 100))
      .map((condition) =>
        Object.assign(
          { conditionCode: condition.conditionCode },
          this.evaluateCondition(condition, context),
        ),
      );
    const matched =
      (rule.conditionMode || "ALL") === "ANY"
        ? conditionResults.some((item) => item.matched)
        : conditionResults.every((item) => item.matched);
    return { matched: matched, conditionResults: conditionResults };
  },
  couponPlan: function (rule, couponCampaigns, couponCodes, context) {
    if (!rule.couponRequired) return { required: false, action: "NONE" };
    const requested = context.couponCode;
    if (!requested)
      return {
        required: true,
        action: "REJECT",
        reasonCode: "COUPON_REQUIRED",
      };
    const code = (couponCodes || []).find(
      (item) => item.couponCode === requested,
    );
    if (!code || !this.isActive(code, context.at)) {
      return {
        required: true,
        action: "REJECT",
        reasonCode: "COUPON_UNAVAILABLE",
      };
    }
    const campaign = (couponCampaigns || []).find(
      (item) =>
        item.couponCampaignCode === code.couponCampaignCode &&
        (!item.ruleCode || item.ruleCode === rule.ruleCode),
    );
    if (!campaign || !this.isActive(campaign, context.at)) {
      return {
        required: true,
        action: "REJECT",
        reasonCode: "COUPON_CAMPAIGN_UNAVAILABLE",
      };
    }
    if (
      code.customerCode &&
      context.customerCode &&
      code.customerCode !== context.customerCode
    ) {
      return {
        required: true,
        action: "REJECT",
        reasonCode: "COUPON_CUSTOMER_MISMATCH",
      };
    }
    if (
      code.maxRedemptions !== undefined &&
      Number(code.redemptionCount || 0) >= Number(code.maxRedemptions)
    ) {
      return {
        required: true,
        action: "REJECT",
        reasonCode: "COUPON_EXHAUSTED",
      };
    }
    return {
      required: true,
      action: "HOLD",
      couponCode: code.couponCode,
      couponCampaignCode: code.couponCampaignCode,
      consumeAction: "CONSUME_ON_ORDER_PLACED",
      releaseAction: "RELEASE_ON_CHECKOUT_ROLLBACK",
    };
  },
  budgetPlan: function (campaign, action, discountAmount) {
    if (!campaign || !campaign.budgetLimitAmount) {
      return { action: "NONE", status: "NOT_CONFIGURED" };
    }
    const consumed = normalizeDecimal(campaign.budgetConsumedAmount || "0");
    const limit = normalizeDecimal(campaign.budgetLimitAmount);
    const requested = normalizeDecimal(discountAmount || "0");
    if (consumed + requested > limit) {
      return {
        action: "REJECT",
        status: "EXHAUSTED",
        reasonCode: "PROMOTION_BUDGET_EXHAUSTED",
      };
    }
    return {
      action: "RESERVE",
      status: "AVAILABLE",
      reserveAmount: formatDecimal(requested),
      consumeAction: "CONSUME_ON_ORDER_PLACED",
      releaseAction: "RELEASE_ON_CHECKOUT_ROLLBACK",
    };
  },
  discountForAction: function (action, context) {
    const base = normalizeDecimal(
      action.targetType === "ENTRY"
        ? context.entrySubtotalAmount || context.subtotalAmount || "0"
        : context.subtotalAmount || "0",
    );
    let discount = 0n;
    if (
      action.discountAmount !== undefined &&
      action.discountAmount !== null &&
      action.discountAmount !== ""
    ) {
      discount = normalizeDecimal(action.discountAmount);
    } else if (
      action.discountRate !== undefined &&
      action.discountRate !== null &&
      action.discountRate !== ""
    ) {
      discount =
        (base * normalizeDecimal(action.discountRate)) / (100n * SCALE);
    }
    if (
      action.maxDiscountAmount !== undefined &&
      action.maxDiscountAmount !== null &&
      action.maxDiscountAmount !== ""
    ) {
      const max = normalizeDecimal(action.maxDiscountAmount);
      if (discount > max) discount = max;
    }
    if (
      discount > base &&
      !["FREE_GIFT", "FREE_SHIPPING"].includes(action.actionType)
    ) {
      discount = base;
    }
    return formatDecimal(discount);
  },
  actionsForRule: function (rule, actions) {
    return (actions || [])
      .filter((item) => item.ruleCode === rule.ruleCode && this.isActive(item))
      .sort((a, b) => Number(a.sequence || 100) - Number(b.sequence || 100));
  },
  arbitrate: function (candidates) {
    const result = [];
    const usedGroups = {};
    const sorted = candidates
      .slice()
      .sort(
        (a, b) =>
          Number(a.rule.priority || 100) - Number(b.rule.priority || 100) ||
          String(a.rule.ruleCode).localeCompare(String(b.rule.ruleCode)),
      );
    for (const candidate of sorted) {
      const group = candidate.rule.stackabilityGroup || candidate.rule.ruleCode;
      if (usedGroups[group]) {
        candidate.rejected = true;
        candidate.reasonCode = "STACKING_GROUP_ALREADY_APPLIED";
        continue;
      }
      result.push(candidate);
      usedGroups[group] = true;
      if (candidate.rule.exclusive) break;
    }
    return result;
  },
  evaluate: function (input) {
    const context = input.context || {};
    const campaigns = input.campaigns || [];
    const rules = input.rules || [];
    const conditions = input.conditions || [];
    const actions = input.actions || [];
    const couponCampaigns = input.couponCampaigns || [];
    const couponCodes = input.couponCodes || [];
    const evaluationCode =
      input.evaluationCode ||
      [
        context.sourceCode || "source",
        "promotion",
        context.idempotencyKey || Date.now(),
      ].join("::");
    const activeRules = rules.filter((rule) => this.isActive(rule, context.at));
    const evaluatedRuleCodes = activeRules.map((rule) => rule.ruleCode);
    const candidates = [];
    const rejected = [];
    activeRules.forEach((rule) => {
      const conditionEvidence = this.evaluateRuleConditions(
        rule,
        conditions,
        context,
      );
      if (!conditionEvidence.matched) {
        rejected.push({
          ruleCode: rule.ruleCode,
          reasonCode: "CONDITIONS_NOT_MATCHED",
          conditionResults: conditionEvidence.conditionResults,
        });
        return;
      }
      const couponEvidence = this.couponPlan(
        rule,
        couponCampaigns,
        couponCodes,
        context,
      );
      if (couponEvidence.action === "REJECT") {
        rejected.push({
          ruleCode: rule.ruleCode,
          reasonCode: couponEvidence.reasonCode,
          couponPlan: couponEvidence,
          conditionResults: conditionEvidence.conditionResults,
        });
        return;
      }
      this.actionsForRule(rule, actions).forEach((action) => {
        const discountAmount = this.discountForAction(action, context);
        const campaign = campaigns.find(
          (item) => item.campaignCode === rule.campaignCode,
        );
        const budgetEvidence = this.budgetPlan(
          campaign,
          action,
          discountAmount,
        );
        if (budgetEvidence.action === "REJECT") {
          rejected.push({
            ruleCode: rule.ruleCode,
            actionCode: action.actionCode,
            reasonCode: budgetEvidence.reasonCode,
            budgetPlan: budgetEvidence,
          });
          return;
        }
        candidates.push({
          rule: rule,
          action: action,
          discountAmount: discountAmount,
          couponPlan: couponEvidence,
          budgetPlan: budgetEvidence,
          conditionResults: conditionEvidence.conditionResults,
        });
      });
    });
    const appliedCandidates = this.arbitrate(candidates);
    const appliedPromotions = appliedCandidates.map((candidate, index) => ({
      appliedPromotionCode: [
        context.sourceCode || "source",
        candidate.action.actionCode || candidate.rule.ruleCode,
        index + 1,
      ].join("::"),
      evaluationCode: evaluationCode,
      enterpriseCode: context.enterpriseCode,
      campaignCode: candidate.rule.campaignCode,
      ruleCode: candidate.rule.ruleCode,
      actionCode: candidate.action.actionCode,
      couponCode: candidate.couponPlan.couponCode,
      sourceType: context.sourceType || "CART",
      sourceCode: context.sourceCode,
      targetType: candidate.action.targetType || "CART",
      targetCode: context.targetCode,
      actionType: candidate.action.actionType,
      stackabilityGroup: candidate.rule.stackabilityGroup,
      currencyCode: context.currencyCode,
      discountAmount: candidate.discountAmount,
      discountRate: candidate.action.discountRate,
      taxTreatment: candidate.action.taxTreatment || "BEFORE_TAX",
      sequence: index + 1,
      status: "APPLIED",
      reasonCode: "PROMOTION_APPLIED",
      couponPlan: candidate.couponPlan,
      budgetPlan: candidate.budgetPlan,
    }));
    const total = appliedPromotions.reduce(
      (sum, item) => sum + normalizeDecimal(item.discountAmount || "0"),
      0n,
    );
    return {
      evaluationRun: {
        evaluationCode: evaluationCode,
        idempotencyKey: context.idempotencyKey,
        enterpriseCode: context.enterpriseCode,
        sourceType: context.sourceType || "CART",
        sourceCode: context.sourceCode,
        currencyCode: context.currencyCode,
        subtotalAmount: context.subtotalAmount,
        discountTotal: formatDecimal(total),
        taxInclusionMode: context.taxInclusionMode,
        evaluatedRuleCodes: evaluatedRuleCodes,
        appliedRuleCodes: appliedPromotions.map((item) => item.ruleCode),
        status: "EVALUATED",
      },
      appliedPromotions: appliedPromotions,
      rejectedPromotions: rejected,
      rollbackPlan: appliedPromotions.flatMap((item) =>
        [item.couponPlan, item.budgetPlan].filter(
          (plan) => plan && plan.releaseAction,
        ),
      ),
    };
  },
};
