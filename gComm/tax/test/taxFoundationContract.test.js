/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module tax/test/taxFoundationContract
 * @description Protects Tax-owned jurisdiction, provider, rate, exemption, quote, and quote-line schemas, validation, exact decimals, permissions, and no-secret provider boundaries.
 * @layer test
 * @owner tax
 * @override Project modules may extend Tax behavior while preserving enterprise scoping, exact values, provider safety, and immutable quote evidence.
 */
const assert = require("assert");

const properties = require("../config/properties").tax;
const schemas = require("../src/schemas/schemas").tax;
const interceptors = require("../src/interceptors/interceptors");
const scopeService = require("../src/service/foundation/defaultTaxEnterpriseScopeService");
const validation = require("../src/service/foundation/defaultTaxValidationService");
const providerPolicyService = require("../src/service/provider/defaultTaxProviderPolicyService");

global.CLASSES = {
  NodicsError: class NodicsError extends Error {
    constructor(message, cause, code) {
      super(String(message));
      this.cause = cause;
      this.code = code;
    }
  },
};
global.CONFIG = {
  get: (key) => (key === "tax" ? properties : undefined),
};
global.SERVICE = {
  DefaultTaxEnterpriseScopeService: scopeService,
  DefaultTaxValidationService: validation,
};

[
  "taxJurisdiction",
  "taxProvider",
  "taxRate",
  "taxExemption",
  "taxQuote",
  "taxQuoteLine",
].forEach((name) => {
  assert.strictEqual(schemas[name].model, true);
  assert.strictEqual(schemas[name].service.enabled, true);
  assert.strictEqual(schemas[name].router.enabled, false);
  assert.strictEqual(schemas[name].definition.enterpriseCode.required, true);
  assert(interceptors[name + "PreSave"]);
  assert(interceptors[name + "PreGet"]);
  assert(interceptors[name + "PreUpdate"]);
  assert(interceptors[name + "PreRemove"]);
});

assert.strictEqual(schemas.taxRate.definition.rate.type, "string");
assert.strictEqual(schemas.taxQuote.definition.subtotalAmount.type, "string");
assert.strictEqual(schemas.taxQuote.definition.taxTotal.type, "string");
assert.strictEqual(
  schemas.taxQuoteLine.definition.taxableAmount.type,
  "string",
);
assert.strictEqual(schemas.taxQuoteLine.definition.taxAmount.type, "string");
assert.strictEqual(
  interceptors.taxQuotePreRemove.handler,
  "DefaultTaxValidationService.rejectHardDelete",
);

const authData = { enterprise: { code: "entA" } };
const jurisdiction = {
  authData,
  model: {
    jurisdictionCode: "UAE-DXB",
    countryCode: "AE",
    regionCode: "DXB",
    roundingMode: "HALF_UP",
    precisionScale: 2,
  },
};
validation.prepareJurisdiction(jurisdiction);
assert.strictEqual(jurisdiction.model.enterpriseCode, "entA");
assert.strictEqual(jurisdiction.model.code, "entA::taxJurisdiction::UAE-DXB");

const provider = {
  authData,
  model: {
    providerCode: "internalTaxProvider",
    providerType: "INTERNAL",
    displayName: "Internal Tax Provider",
    adapterService: "DefaultInternalTaxProviderAdapterService",
    operations: ["QUOTE", "COMMIT", "VOID", "REFUND", "RECONCILE"],
  },
};
validation.prepareProvider(provider);
assert.strictEqual(
  provider.model.code,
  "entA::taxProvider::internalTaxProvider",
);
assert.deepStrictEqual(providerPolicyService.getAllowedOperations(), [
  "QUOTE",
  "COMMIT",
  "VOID",
  "REFUND",
  "RECONCILE",
]);
assert.strictEqual(
  providerPolicyService.resolveAdapter(provider.model).adapterService,
  "DefaultInternalTaxProviderAdapterService",
);

const rate = {
  authData,
  model: {
    rateCode: "standard-vat",
    jurisdictionCode: "UAE-DXB",
    taxCategoryCode: "STANDARD",
    rateType: "PERCENTAGE",
    rate: "0.05",
    taxMode: "NET",
    includedInPrice: false,
  },
};
validation.prepareRate(rate);
assert.strictEqual(rate.model.code, "entA::taxRate::standard-vat");

const exemption = {
  authData,
  model: {
    exemptionCode: "customer-exempt",
    customerCode: "customer-1",
    certificateCode: "cert-ref-1",
    jurisdictionCode: "UAE-DXB",
    exemptionType: "CERTIFICATE",
  },
};
validation.prepareExemption(exemption);

const quote = {
  authData,
  model: {
    quoteCode: "cart-tax-quote-1",
    cartCode: "cart-1",
    providerCode: "internalTaxProvider",
    jurisdictionCode: "UAE-DXB",
    currencyCode: "AED",
    subtotalAmount: "100.00",
    taxTotal: "5.00",
    taxMode: "NET",
    idempotencyKey: "tax-quote-1",
  },
};
validation.prepareQuote(quote);
assert.strictEqual(quote.model.code, "entA::taxQuote::cart-tax-quote-1");

const quoteLine = {
  authData,
  model: {
    lineCode: "cart-tax-line-1",
    quoteCode: "cart-tax-quote-1",
    entryCode: "entry-1",
    taxCategoryCode: "STANDARD",
    jurisdictionCode: "UAE-DXB",
    rateCode: "standard-vat",
    taxableAmount: "100.00",
    taxAmount: "5.00",
    currencyCode: "AED",
  },
};
validation.prepareQuoteLine(quoteLine);
assert.strictEqual(quoteLine.model.code, "entA::taxQuoteLine::cart-tax-line-1");

assert.throws(
  () =>
    validation.prepareRate({
      authData,
      model: Object.assign({}, rate.model, {
        code: undefined,
        rateCode: "float-rate",
        rate: 0.1 + 0.2,
      }),
    }),
  (error) => error.code === "ERR_TAX_00011",
);
assert.throws(
  () =>
    validation.prepareQuote({
      authData,
      model: Object.assign({}, quote.model, {
        code: undefined,
        quoteCode: "bad-currency",
        currencyCode: "aed",
      }),
    }),
  (error) => error.code === "ERR_TAX_00012",
);
assert.throws(
  () =>
    validation.prepareProvider({
      authData,
      model: Object.assign({}, provider.model, {
        code: undefined,
        providerCode: "bad-provider",
        providerType: "SECRET_GATEWAY",
      }),
    }),
  (error) => error.code === "ERR_TAX_00016",
);
assert.throws(
  () =>
    validation.prepareJurisdiction({
      authData: { enterprise: { code: "entB" } },
      model: Object.assign({}, jurisdiction.model),
    }),
  (error) => error.code === "ERR_TAX_00004",
);

(async () => {
  await assert.rejects(
    () => validation.rejectHardDelete(),
    (error) => error.code === "ERR_TAX_00026",
  );
  console.log("Tax foundation contract validated");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
