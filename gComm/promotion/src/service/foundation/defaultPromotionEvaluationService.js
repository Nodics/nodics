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
  /**
   * Executes the init contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  init: function () {
    return Promise.resolve(true);
  },
  /**
   * Executes the post init contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  postInit: function () {
    return Promise.resolve(true);
  },
  /**
   * Executes the now contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  now: function () {
    return new Date();
  },
  /**
   * Executes the error contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  error: function (code, message) {
    return new CLASSES.NodicsError(message, null, code);
  },
  decimal: normalizeDecimal,
  formatDecimal: formatDecimal,
  compareDecimal: compareDecimal,
  /**
   * Executes the config contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  config: function () {
    if (
      typeof CONFIG === "undefined" ||
      !CONFIG ||
      typeof CONFIG.get !== "function"
    ) {
      return {};
    }
    return CONFIG.get("promotion") || {};
  },
  /**
   * Executes the is active contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
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
  /**
   * Executes the runtime contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  runtime: function () {
    return (this.config() || {}).runtime || {};
  },
  /**
   * Executes the items contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  items: function (value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (value.result !== undefined) {
      return Array.isArray(value.result) ? value.result : [value.result];
    }
    if (Array.isArray(value.items)) return value.items;
    return [value];
  },
  /**
   * Executes the service contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  service: function (serviceName) {
    return typeof SERVICE === "undefined" || !SERVICE
      ? undefined
      : SERVICE[serviceName];
  },
  /**
   * Executes the resolve enterprise code contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  resolveEnterpriseCode: function (request) {
    if (
      this.service("DefaultPromotionEnterpriseScopeService") &&
      typeof SERVICE.DefaultPromotionEnterpriseScopeService
        .resolveEnterpriseCode === "function"
    ) {
      return SERVICE.DefaultPromotionEnterpriseScopeService.resolveEnterpriseCode(
        request,
      );
    }
    return (
      (request && request.enterpriseCode) ||
      (request && request.entCode) ||
      (request && request.authData && request.authData.enterpriseCode) ||
      (request &&
        request.authData &&
        request.authData.enterprise &&
        request.authData.enterprise.code)
    );
  },
  /**
   * Executes the source from input contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  sourceFromInput: function (request) {
    return (request && request.calculationInput) || {};
  },
  /**
   * Executes the field contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  field: function (input, names) {
    for (const name of names) {
      if (input && input[name] !== undefined && input[name] !== null) {
        return input[name];
      }
    }
    return undefined;
  },
  /**
   * Executes the sum contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  sum: function (items, paths) {
    return formatDecimal(
      (items || []).reduce((total, item) => {
        const value = this.field(item || {}, paths);
        return total + normalizeDecimal(value || "0");
      }, 0n),
    );
  },
  /**
   * Executes the context for contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  contextFor: function (sourceType, targetType, request) {
    const input = this.sourceFromInput(request);
    const source = input.entry || input.cart || input.order || input;
    const code =
      sourceType === "ORDER"
        ? this.field(input, ["orderCode"]) ||
          this.field(request || {}, ["orderCode"]) ||
          this.field(source, ["orderCode", "code"])
        : this.field(input, ["cartCode"]) ||
          this.field(request || {}, ["cartCode"]) ||
          this.field(source, ["cartCode", "code"]);
    const entryCode =
      targetType === "ENTRY"
        ? this.field(input, ["entryCode"]) ||
          this.field(request || {}, ["entryCode"]) ||
          this.field(source, ["entryCode", "code"])
        : undefined;
    const calculatedEntries = this.items(input.calculatedEntries);
    const entries = this.items(input.entries);
    const subtotal =
      this.field(source, [
        "subtotalAmount",
        "lineNetAmount",
        "lineGrossAmount",
        "totalPrice",
        "totalAmount",
      ]) ||
      this.sum(calculatedEntries.length ? calculatedEntries : entries, [
        "lineNetAmount",
        "lineGrossAmount",
        "totalPrice",
        "totalAmount",
      ]);
    return {
      enterpriseCode: this.resolveEnterpriseCode(request),
      sourceType: sourceType,
      sourceCode: code,
      targetType: targetType,
      targetCode: entryCode,
      idempotencyKey:
        (request && request.idempotencyKey) ||
        [code || "source", targetType, entryCode || "aggregate", "promotion"]
          .filter(Boolean)
          .join("::"),
      currencyCode:
        this.field(source, ["currencyCode"]) ||
        this.field(input, ["currencyCode"]) ||
        "USD",
      subtotalAmount: subtotal || "0.00",
      entrySubtotalAmount: targetType === "ENTRY" ? subtotal || "0.00" : "0.00",
      taxInclusionMode:
        this.field(source, ["taxInclusionMode"]) ||
        this.field(input, ["taxInclusionMode"]),
      couponCode:
        this.field(source, ["couponCode"]) ||
        this.field(input, ["couponCode"]) ||
        this.field(request || {}, ["couponCode"]),
      customerCode:
        this.field(source, ["customerCode"]) ||
        this.field(input, ["customerCode"]) ||
        this.field(request || {}, ["customerCode"]),
      source: source,
      at: (request && request.at) || this.now(),
    };
  },
  /**
   * Executes the records from request contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  recordsFromRequest: function (request, name) {
    const input = this.sourceFromInput(request);
    const grouped =
      (request && request.promotionRecords) || input.promotionRecords || {};
    const records = grouped[name] || (request && request[name]) || input[name];
    return this.items(records);
  },
  /**
   * Executes the load schema records contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  loadSchemaRecords: async function (request, serviceName) {
    const service = this.service(serviceName);
    if (!service || typeof service.get !== "function") return [];
    const enterpriseCode = this.resolveEnterpriseCode(request);
    const query = enterpriseCode ? { enterpriseCode: enterpriseCode } : {};
    const response = await service.get({
      tenant: request && request.tenant,
      authData: request && request.authData,
      query: query,
      searchOptions: {
        limit: Number(this.runtime().maximumEvaluationRecords || 1000),
      },
    });
    return this.items(response);
  },
  /**
   * Executes the evaluation records contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  evaluationRecords: async function (request) {
    const direct = {
      campaigns: this.recordsFromRequest(request, "campaigns"),
      rules: this.recordsFromRequest(request, "rules"),
      conditions: this.recordsFromRequest(request, "conditions"),
      actions: this.recordsFromRequest(request, "actions"),
      couponCampaigns: this.recordsFromRequest(request, "couponCampaigns"),
      couponCodes: this.recordsFromRequest(request, "couponCodes"),
    };
    if (
      direct.campaigns.length ||
      direct.rules.length ||
      direct.conditions.length ||
      direct.actions.length ||
      direct.couponCampaigns.length ||
      direct.couponCodes.length
    ) {
      return direct;
    }
    return {
      campaigns: await this.loadSchemaRecords(
        request,
        "DefaultPromotionCampaignService",
      ),
      rules: await this.loadSchemaRecords(
        request,
        "DefaultPromotionRuleService",
      ),
      conditions: await this.loadSchemaRecords(
        request,
        "DefaultPromotionConditionService",
      ),
      actions: await this.loadSchemaRecords(
        request,
        "DefaultPromotionActionService",
      ),
      couponCampaigns: await this.loadSchemaRecords(
        request,
        "DefaultCouponCampaignService",
      ),
      couponCodes: await this.loadSchemaRecords(
        request,
        "DefaultCouponCodeService",
      ),
    };
  },
  /**
   * Executes the save one contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  saveOne: async function (serviceName, request, model) {
    const service = this.service(serviceName);
    if (!service || typeof service.save !== "function") return model;
    const response = await service.save({
      tenant: request && request.tenant,
      authData: request && request.authData,
      model: Object.assign(
        {
          code:
            model.evaluationCode ||
            model.appliedPromotionCode ||
            model.couponCode ||
            model.campaignCode,
          active: model.active !== false,
        },
        model,
      ),
    });
    return this.items(response)[0] || response.result || model;
  },
  /**
   * Executes the persist evaluation contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  persistEvaluation: async function (request, result) {
    if (this.runtime().persistEvaluationEvidence === false) {
      return { persisted: false, reasonCode: "PERSISTENCE_DISABLED" };
    }
    const savedRun = await this.saveOne(
      "DefaultPromotionEvaluationRunService",
      request,
      result.evaluationRun,
    );
    const savedApplied = [];
    for (const applied of result.appliedPromotions || []) {
      savedApplied.push(
        await this.saveOne("DefaultAppliedPromotionService", request, applied),
      );
    }
    return {
      persisted: Boolean(
        this.service("DefaultPromotionEvaluationRunService") ||
        this.service("DefaultAppliedPromotionService"),
      ),
      evaluationRun: savedRun,
      appliedPromotions: savedApplied,
    };
  },
  /**
   * Executes the evaluate runtime contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  evaluateRuntime: async function (sourceType, targetType, request) {
    const records = await this.evaluationRecords(request || {});
    const context = this.contextFor(sourceType, targetType, request || {});
    const result = this.evaluate({
      evaluationCode:
        (request && request.evaluationCode) ||
        [
          context.sourceCode || "source",
          targetType,
          "promotionEvaluation",
        ].join("::"),
      context: context,
      campaigns: records.campaigns,
      rules: records.rules.filter((rule) =>
        targetType === "ENTRY"
          ? ["ENTRY", "CART", sourceType].includes(rule.ruleType || sourceType)
          : [sourceType, "CART", "ORDER"].includes(rule.ruleType || sourceType),
      ),
      conditions: records.conditions,
      actions: records.actions.filter((action) =>
        targetType === "ENTRY"
          ? ["ENTRY"].includes(action.targetType || "ENTRY")
          : [sourceType, "CART", "ORDER", "DELIVERY", "PAYMENT"].includes(
              action.targetType || sourceType,
            ),
      ),
      couponCampaigns: records.couponCampaigns,
      couponCodes: records.couponCodes,
    });
    result.persistence = await this.persistEvaluation(request || {}, result);
    return result;
  },
  /**
   * Executes the evaluate entry contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  evaluateEntry: async function (request) {
    return this.evaluateRuntime("CART", "ENTRY", request);
  },
  /**
   * Executes the evaluate cart contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  evaluateCart: async function (request) {
    return this.evaluateRuntime("CART", "CART", request);
  },
  /**
   * Executes the reconcile entry contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  reconcileEntry: async function (request) {
    return this.evaluateRuntime("ORDER", "ENTRY", request);
  },
  /**
   * Executes the reconcile order contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  reconcileOrder: async function (request) {
    return this.evaluateRuntime("ORDER", "ORDER", request);
  },
  /**
   * Executes the mutate coupon contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  mutateCoupon: async function (couponCode, delta, request) {
    if (!couponCode || !this.service("DefaultCouponCodeService")) return false;
    const service = this.service("DefaultCouponCodeService");
    if (
      typeof service.get !== "function" ||
      typeof service.update !== "function"
    )
      return false;
    const items = this.items(
      await service.get({
        tenant: request && request.tenant,
        authData: request && request.authData,
        query: { couponCode: couponCode },
        searchOptions: { limit: 1 },
      }),
    );
    const coupon = items[0];
    if (!coupon) return false;
    await service.update({
      tenant: request && request.tenant,
      authData: request && request.authData,
      query: { code: coupon.code || coupon.couponCode },
      model: {
        redemptionCount: Math.max(
          0,
          Number(coupon.redemptionCount || 0) + Number(delta || 0),
        ),
      },
    });
    return true;
  },
  /**
   * Executes the mutate budget contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  mutateBudget: async function (campaignCode, amount, request) {
    if (!campaignCode || !this.service("DefaultPromotionCampaignService"))
      return false;
    const service = this.service("DefaultPromotionCampaignService");
    if (
      typeof service.get !== "function" ||
      typeof service.update !== "function"
    )
      return false;
    const campaigns = this.items(
      await service.get({
        tenant: request && request.tenant,
        authData: request && request.authData,
        query: { campaignCode: campaignCode },
        searchOptions: { limit: 1 },
      }),
    );
    const campaign = campaigns[0];
    if (!campaign) return false;
    const next =
      normalizeDecimal(campaign.budgetConsumedAmount || "0") +
      normalizeDecimal(amount || "0");
    await service.update({
      tenant: request && request.tenant,
      authData: request && request.authData,
      query: { code: campaign.code || campaign.campaignCode },
      model: { budgetConsumedAmount: formatDecimal(next < 0n ? 0n : next) },
    });
    return true;
  },
  /**
   * Executes the reservation plans contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  reservationPlans: function (request) {
    const input = this.sourceFromInput(request || {});
    const evidence =
      (request && request.evaluationResult) ||
      input.evaluationResult ||
      (request && request.promotionEvidence) ||
      input.promotionEvidence ||
      {};
    return this.items(evidence.appliedPromotions).flatMap((item) => [
      Object.assign({ campaignCode: item.campaignCode }, item.couponPlan || {}),
      Object.assign(
        { campaignCode: item.campaignCode, reserveAmount: item.discountAmount },
        item.budgetPlan || {},
      ),
    ]);
  },
  /**
   * Executes the consume reservations contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  consumeReservations: async function (request) {
    const plans = this.reservationPlans(request);
    const consumed = [];
    for (const plan of plans) {
      if (plan.consumeAction === "CONSUME_ON_ORDER_PLACED") {
        if (plan.couponCode) {
          consumed.push({
            type: "COUPON",
            code: plan.couponCode,
            mutated: await this.mutateCoupon(plan.couponCode, 1, request),
          });
        }
        if (plan.reserveAmount && plan.campaignCode) {
          consumed.push({
            type: "BUDGET",
            code: plan.campaignCode,
            amount: plan.reserveAmount,
            mutated: await this.mutateBudget(
              plan.campaignCode,
              plan.reserveAmount,
              request,
            ),
          });
        }
      }
    }
    return { status: "CONSUMED", consumed: consumed };
  },
  /**
   * Executes the release reservations contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  releaseReservations: async function (request) {
    const plans = this.reservationPlans(request);
    const released = [];
    for (const plan of plans) {
      if (plan.releaseAction === "RELEASE_ON_CHECKOUT_ROLLBACK") {
        if (plan.couponCode) {
          released.push({
            type: "COUPON",
            code: plan.couponCode,
            mutated: false,
            reasonCode: "COUPON_HOLD_RELEASED_WITHOUT_REDEMPTION",
          });
        }
        if (plan.reserveAmount && plan.campaignCode) {
          released.push({
            type: "BUDGET",
            code: plan.campaignCode,
            amount: plan.reserveAmount,
            mutated: false,
            reasonCode: "BUDGET_RESERVATION_RELEASED_WITHOUT_CONSUMPTION",
          });
        }
      }
    }
    return { status: "RELEASED", released: released };
  },
  /**
   * Executes the evaluate condition contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
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
  /**
   * Executes the evaluate rule conditions contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
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
  /**
   * Executes the coupon plan contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
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
  /**
   * Executes the budget plan contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
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
  /**
   * Executes the discount for action contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
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
  /**
   * Executes the actions for rule contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  actionsForRule: function (rule, actions) {
    return (actions || [])
      .filter((item) => item.ruleCode === rule.ruleCode && this.isActive(item))
      .sort((a, b) => Number(a.sequence || 100) - Number(b.sequence || 100));
  },
  /**
   * Executes the arbitrate contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
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
  /**
   * Executes the evaluate contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
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
