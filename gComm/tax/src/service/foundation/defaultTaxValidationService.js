/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module tax/service/foundation/DefaultTaxValidationService
 * @description Validates governed Tax records, exact decimal values, lifecycle state, provider metadata, and immutable tax evidence boundaries.
 * @layer service
 * @owner tax
 * @override Project modules may replace or layer Tax validation while preserving enterprise scope, exact decimal values, and no-secret provider records.
 */
module.exports = {
  init: function () {
    return Promise.resolve(true);
  },
  postInit: function () {
    return Promise.resolve(true);
  },
  config: function () {
    return CONFIG.get("tax") || {};
  },
  error: function (code, message) {
    return SERVICE.DefaultTaxEnterpriseScopeService.error(code, message);
  },
  assertDateRange: function (model) {
    if (
      model.effectiveFrom &&
      model.effectiveTo &&
      new Date(model.effectiveFrom).getTime() >
        new Date(model.effectiveTo).getTime()
    ) {
      throw this.error("ERR_TAX_00010", "Tax effective date range is invalid");
    }
  },
  assertDecimal: function (value, label, allowZero) {
    const policy = (this.config() || {}).decimals || {};
    if (typeof value !== "string") {
      throw this.error(
        "ERR_TAX_00011",
        label + " must be an exact decimal string",
      );
    }
    const text = String(value);
    if (!/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(text)) {
      throw this.error(
        "ERR_TAX_00011",
        label + " must be an exact decimal string",
      );
    }
    if (!allowZero && /^0(?:\.0+)?$/.test(text)) {
      throw this.error("ERR_TAX_00011", label + " must be positive");
    }
    const parts = text.split(".");
    const totalDigits = (parts[0] + (parts[1] || "")).length;
    const scale = (parts[1] || "").length;
    if (
      totalDigits > Number(policy.maximumDigits || 38) ||
      scale > Number(policy.maximumScale || 18)
    ) {
      throw this.error(
        "ERR_TAX_00011",
        label + " exceeds exact-decimal bounds",
      );
    }
    return text;
  },
  assertCurrency: function (value, required) {
    if (!value && !required) return true;
    if (!/^[A-Z]{3}$/.test(value || "")) {
      throw this.error("ERR_TAX_00012", "Tax currency code is invalid");
    }
    return true;
  },
  assertCountry: function (value) {
    if (!/^[A-Z]{2}$/.test(value || "")) {
      throw this.error("ERR_TAX_00013", "Tax country code is invalid");
    }
    return true;
  },
  prepare: function (request, type, identityProperties) {
    SERVICE.DefaultTaxEnterpriseScopeService.scopeNewModel(
      request,
      type,
      identityProperties,
    );
    this.assertDateRange(request.model);
    return request.model;
  },
  prepareJurisdiction: function (request) {
    const model = this.prepare(request, "taxJurisdiction", [
      "jurisdictionCode",
    ]);
    const policy = (this.config() || {}).jurisdiction || {};
    this.assertCountry(model.countryCode);
    if (
      !(policy.roundingModes || []).includes(model.roundingMode || "HALF_UP")
    ) {
      throw this.error(
        "ERR_TAX_00014",
        "Tax jurisdiction rounding mode is invalid",
      );
    }
    const precision = Number(
      model.precisionScale === undefined ? 2 : model.precisionScale,
    );
    if (
      !Number.isInteger(precision) ||
      precision < Number(policy.minimumPrecisionScale || 0) ||
      precision > Number(policy.maximumPrecisionScale || 8)
    ) {
      throw this.error(
        "ERR_TAX_00015",
        "Tax jurisdiction precision is invalid",
      );
    }
    return true;
  },
  prepareProvider: function (request) {
    const model = this.prepare(request, "taxProvider", ["providerCode"]);
    const policy = (this.config() || {}).provider || {};
    if (!(policy.providerTypes || []).includes(model.providerType)) {
      throw this.error("ERR_TAX_00016", "Tax provider type is invalid");
    }
    if (!model.adapterService)
      throw this.error("ERR_TAX_00017", "Tax provider adapter is required");
    if (!Array.isArray(model.operations) || !model.operations.length) {
      throw this.error("ERR_TAX_00018", "Tax provider operations are required");
    }
    const allowed = policy.operations || [];
    if (model.operations.some((operation) => !allowed.includes(operation))) {
      throw this.error("ERR_TAX_00018", "Tax provider operation is invalid");
    }
    return true;
  },
  prepareRate: function (request) {
    const model = this.prepare(request, "taxRate", ["rateCode"]);
    const policy = (this.config() || {}).rate || {};
    if (!(policy.rateTypes || []).includes(model.rateType || "PERCENTAGE")) {
      throw this.error("ERR_TAX_00019", "Tax rate type is invalid");
    }
    if (!(policy.taxModes || []).includes(model.taxMode || "NET")) {
      throw this.error("ERR_TAX_00020", "Tax mode is invalid");
    }
    model.rate = this.assertDecimal(model.rate, "Tax rate", true);
    if ((model.rateType || "PERCENTAGE") === "FIXED")
      this.assertCurrency(model.currencyCode, true);
    return true;
  },
  prepareExemption: function (request) {
    const model = this.prepare(request, "taxExemption", ["exemptionCode"]);
    if (
      !model.customerCode &&
      !model.certificateCode &&
      !model.taxCategoryCode
    ) {
      throw this.error(
        "ERR_TAX_00021",
        "Tax exemption requires customer, certificate, or category scope",
      );
    }
    return true;
  },
  prepareQuote: function (request) {
    const model = this.prepare(request, "taxQuote", ["quoteCode"]);
    const policy = (this.config() || {}).rate || {};
    this.assertCurrency(model.currencyCode, true);
    model.subtotalAmount = this.assertDecimal(
      model.subtotalAmount,
      "Tax subtotal",
      true,
    );
    model.taxTotal = this.assertDecimal(model.taxTotal, "Tax total", true);
    if (!model.idempotencyKey)
      throw this.error(
        "ERR_TAX_00022",
        "Tax quote idempotency key is required",
      );
    if (!(policy.taxModes || []).includes(model.taxMode || "NET")) {
      throw this.error("ERR_TAX_00020", "Tax mode is invalid");
    }
    return true;
  },
  prepareQuoteLine: function (request) {
    const model = this.prepare(request, "taxQuoteLine", ["lineCode"]);
    this.assertCurrency(model.currencyCode, true);
    model.taxableAmount = this.assertDecimal(
      model.taxableAmount,
      "Taxable amount",
      true,
    );
    model.taxAmount = this.assertDecimal(model.taxAmount, "Tax amount", true);
    return true;
  },
  update: async function (
    request,
    serviceName,
    identityProperties,
    prepareName,
  ) {
    await SERVICE.DefaultTaxEnterpriseScopeService.scopeQuery(request);
    const response = await SERVICE[serviceName].get({
      tenant: request.tenant,
      authData: request.authData,
      query: request.query,
      searchOptions: { limit: 2 },
    });
    const items =
      response && Array.isArray(response.result) ? response.result : [];
    if (items.length !== 1) {
      throw this.error(
        "ERR_TAX_00023",
        "Tax update target must resolve exactly one record",
      );
    }
    const current = items[0];
    const patch = request.model || {};
    ["code", "enterpriseCode"]
      .concat(identityProperties || [])
      .forEach((property) => {
        if (
          patch[property] !== undefined &&
          patch[property] !== current[property]
        ) {
          throw this.error("ERR_TAX_00024", "Tax identity is immutable");
        }
      });
    const lifecycle =
      current.quoteCode || current.lineCode
        ? (this.config() || {}).quoteLifecycle || {}
        : (this.config() || {}).lifecycle || {};
    if (patch.status && patch.status !== current.status) {
      const allowed =
        (lifecycle.allowedTransitions || {})[current.status] || [];
      if (!allowed.includes(patch.status)) {
        throw this.error(
          "ERR_TAX_00025",
          "Tax lifecycle transition is invalid",
        );
      }
    }
    const merged = Object.assign({}, current, patch);
    await this[prepareName](Object.assign({}, request, { model: merged }));
    request.model = patch;
    return true;
  },
  prepareJurisdictionUpdate: function (request) {
    return this.update(
      request,
      "DefaultTaxJurisdictionService",
      ["jurisdictionCode"],
      "prepareJurisdiction",
    );
  },
  prepareProviderUpdate: function (request) {
    return this.update(
      request,
      "DefaultTaxProviderService",
      ["providerCode"],
      "prepareProvider",
    );
  },
  prepareRateUpdate: function (request) {
    return this.update(
      request,
      "DefaultTaxRateService",
      ["rateCode", "jurisdictionCode"],
      "prepareRate",
    );
  },
  prepareExemptionUpdate: function (request) {
    return this.update(
      request,
      "DefaultTaxExemptionService",
      ["exemptionCode"],
      "prepareExemption",
    );
  },
  prepareQuoteUpdate: function (request) {
    return this.update(
      request,
      "DefaultTaxQuoteService",
      ["quoteCode", "currencyCode", "idempotencyKey"],
      "prepareQuote",
    );
  },
  prepareQuoteLineUpdate: function (request) {
    return this.update(
      request,
      "DefaultTaxQuoteLineService",
      ["lineCode", "quoteCode", "currencyCode"],
      "prepareQuoteLine",
    );
  },
  rejectHardDelete: function () {
    return Promise.reject(
      this.error(
        "ERR_TAX_00026",
        "Tax evidence cannot be hard-deleted; retire or void it",
      ),
    );
  },
};
