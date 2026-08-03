/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module tax/src/schemas/schemas @description Tax jurisdiction, provider, rate, exemption, quote, and quote-line evidence schemas. @layer schema @owner tax */
const governed = function (definition, indexes) {
  return {
    super: "base",
    model: true,
    service: { enabled: true },
    router: { enabled: false },
    cache: { enabled: false },
    search: { enabled: false },
    event: { enabled: false },
    definition: definition,
    indexes: indexes || {},
  };
};

const common = function () {
  return {
    enterpriseCode: {
      type: "string",
      required: true,
      description: "Authenticated enterprise owner of the Tax record",
      searchOptions: { enabled: true },
    },
    status: {
      type: "string",
      required: true,
      default: "ACTIVE",
      description: "Governed lifecycle status",
      searchOptions: { enabled: true },
    },
    effectiveFrom: {
      type: "date",
      required: false,
      description: "Optional lifecycle or validity start",
    },
    effectiveTo: {
      type: "date",
      required: false,
      description: "Optional lifecycle or validity end",
    },
  };
};

module.exports = {
  tax: {
    taxJurisdiction: governed(
      Object.assign(common(), {
        jurisdictionCode: {
          type: "string",
          required: true,
          description: "Stable jurisdiction identity such as UAE-DXB or US-CA",
          searchOptions: { enabled: true },
        },
        countryCode: {
          type: "string",
          required: true,
          description: "ISO-style country code for this jurisdiction",
          searchOptions: { enabled: true },
        },
        regionCode: {
          type: "string",
          required: false,
          description: "Optional region/state/province code",
          searchOptions: { enabled: true },
        },
        postalCodePattern: {
          type: "string",
          required: false,
          description: "Optional safe postal-code pattern used for matching",
        },
        taxAuthorityCode: {
          type: "string",
          required: false,
          description: "Optional external or government tax authority code",
          searchOptions: { enabled: true },
        },
        roundingMode: {
          type: "string",
          required: true,
          default: "HALF_UP",
          description: "Rounding mode applied by this jurisdiction",
          searchOptions: { enabled: true },
        },
        precisionScale: {
          type: "int",
          required: true,
          default: 2,
          description: "Decimal places used for final tax amounts",
        },
      }),
      {
        common: {
          enterpriseCode: { enabled: true, name: "enterpriseCode" },
          jurisdictionCode: { enabled: true, name: "jurisdictionCode" },
        },
        individual: {
          jurisdictionCode: { enabled: true, name: "jurisdictionCode" },
          countryCode: { enabled: true, name: "countryCode" },
          regionCode: { enabled: true, name: "regionCode" },
          status: { enabled: true, name: "status" },
        },
      },
    ),
    taxProvider: governed(
      Object.assign(common(), {
        providerCode: {
          type: "string",
          required: true,
          description: "Safe provider identity. Never store secrets here.",
          searchOptions: { enabled: true },
        },
        providerType: {
          type: "string",
          required: true,
          description:
            "Provider type such as INTERNAL, EXTERNAL, GOVERNMENT, ERP, MARKETPLACE, or PROJECT_PROVIDER",
          searchOptions: { enabled: true },
        },
        displayName: { type: "string", required: true },
        adapterService: {
          type: "string",
          required: true,
          description: "Tax provider adapter service name",
          searchOptions: { enabled: true },
        },
        policyService: {
          type: "string",
          required: false,
          description: "Optional provider policy service",
          searchOptions: { enabled: true },
        },
        connectorCode: {
          type: "string",
          required: false,
          description: "Safe connector identity. Credentials remain external.",
        },
        configRef: {
          type: "string",
          required: false,
          description: "Safe configuration reference, not raw credentials",
        },
        supportedCountryCodes: {
          type: "array",
          required: false,
          description: "Countries supported by this provider",
        },
        supportedJurisdictionCodes: {
          type: "array",
          required: false,
          description: "Jurisdictions supported by this provider",
        },
        operations: {
          type: "array",
          required: true,
          description:
            "Operations such as QUOTE, COMMIT, VOID, REFUND, or RECONCILE",
        },
        businessEditable: {
          type: "bool",
          required: false,
          default: true,
          description:
            "Whether business users may maintain this safe provider metadata",
        },
        notes: {
          type: "string",
          required: false,
          description:
            "Safe notes. Do not store credentials or raw provider payloads.",
        },
      }),
      {
        common: {
          enterpriseCode: { enabled: true, name: "enterpriseCode" },
          providerCode: { enabled: true, name: "providerCode" },
        },
        individual: {
          providerCode: { enabled: true, name: "providerCode" },
          providerType: { enabled: true, name: "providerType" },
          status: { enabled: true, name: "status" },
        },
      },
    ),
    taxRate: governed(
      Object.assign(common(), {
        rateCode: {
          type: "string",
          required: true,
          description: "Stable tax rate identity",
          searchOptions: { enabled: true },
        },
        jurisdictionCode: {
          type: "string",
          required: true,
          description: "Tax jurisdiction this rate belongs to",
          searchOptions: { enabled: true },
        },
        taxCategoryCode: {
          type: "string",
          required: true,
          description:
            "Tax category such as STANDARD, REDUCED, EXEMPT, or project-specific category",
          searchOptions: { enabled: true },
        },
        rateType: {
          type: "string",
          required: true,
          default: "PERCENTAGE",
          description: "Rate type such as PERCENTAGE or FIXED",
          searchOptions: { enabled: true },
        },
        rate: {
          type: "string",
          required: true,
          description: "Exact decimal-string tax rate or fixed amount",
        },
        currencyCode: {
          type: "string",
          required: false,
          description: "Currency for fixed tax rates",
          searchOptions: { enabled: true },
        },
        taxMode: {
          type: "string",
          required: true,
          default: "NET",
          description: "Whether tax applies to net or gross price evidence",
          searchOptions: { enabled: true },
        },
        includedInPrice: {
          type: "bool",
          required: true,
          default: false,
          description: "Whether the tax is included in the supplied price",
        },
      }),
      {
        common: {
          enterpriseCode: { enabled: true, name: "enterpriseCode" },
          rateCode: { enabled: true, name: "rateCode" },
        },
        individual: {
          rateCode: { enabled: true, name: "rateCode" },
          jurisdictionCode: { enabled: true, name: "jurisdictionCode" },
          taxCategoryCode: { enabled: true, name: "taxCategoryCode" },
          status: { enabled: true, name: "status" },
        },
      },
    ),
    taxExemption: governed(
      Object.assign(common(), {
        exemptionCode: {
          type: "string",
          required: true,
          description: "Stable exemption identity",
          searchOptions: { enabled: true },
        },
        customerCode: {
          type: "string",
          required: false,
          description: "Optional customer reference for this exemption",
          searchOptions: { enabled: true },
        },
        certificateCode: {
          type: "string",
          required: false,
          description:
            "Safe certificate reference. Do not store private certificate payloads.",
          searchOptions: { enabled: true },
        },
        jurisdictionCode: {
          type: "string",
          required: false,
          description: "Optional jurisdiction scope",
          searchOptions: { enabled: true },
        },
        taxCategoryCode: {
          type: "string",
          required: false,
          description: "Optional tax category scope",
          searchOptions: { enabled: true },
        },
        exemptionType: {
          type: "string",
          required: true,
          default: "CUSTOMER",
          description:
            "Exemption type such as CUSTOMER, CERTIFICATE, CATEGORY, or PROJECT_RULE",
          searchOptions: { enabled: true },
        },
        reasonCode: {
          type: "string",
          required: false,
          description: "Safe reason reference for exemption",
        },
      }),
      {
        common: {
          enterpriseCode: { enabled: true, name: "enterpriseCode" },
          exemptionCode: { enabled: true, name: "exemptionCode" },
        },
        individual: {
          exemptionCode: { enabled: true, name: "exemptionCode" },
          customerCode: { enabled: true, name: "customerCode" },
          jurisdictionCode: { enabled: true, name: "jurisdictionCode" },
          status: { enabled: true, name: "status" },
        },
      },
    ),
    taxQuote: governed(
      Object.assign(common(), {
        quoteCode: {
          type: "string",
          required: true,
          description: "Stable tax quote identity",
          searchOptions: { enabled: true },
        },
        cartCode: {
          type: "string",
          required: false,
          description: "Optional cart that requested this quote",
          searchOptions: { enabled: true },
        },
        orderCode: {
          type: "string",
          required: false,
          description: "Optional order that accepted this quote",
          searchOptions: { enabled: true },
        },
        providerCode: {
          type: "string",
          required: false,
          description: "Tax provider used for this quote",
          searchOptions: { enabled: true },
        },
        jurisdictionCode: {
          type: "string",
          required: false,
          description: "Primary jurisdiction used for this quote",
          searchOptions: { enabled: true },
        },
        currencyCode: {
          type: "string",
          required: true,
          description: "Currency for subtotal and tax amounts",
          searchOptions: { enabled: true },
        },
        subtotalAmount: {
          type: "string",
          required: true,
          description: "Exact decimal-string taxable subtotal used for quote",
        },
        taxTotal: {
          type: "string",
          required: true,
          description: "Exact decimal-string tax total for this quote",
        },
        taxMode: {
          type: "string",
          required: true,
          default: "NET",
          description: "Tax mode used for quote evidence",
          searchOptions: { enabled: true },
        },
        taxInclusionMode: {
          type: "string",
          required: false,
          description:
            "Normalized tax inclusion evidence such as TAX_EXCLUSIVE or TAX_INCLUSIVE",
          searchOptions: { enabled: true },
        },
        idempotencyKey: {
          type: "string",
          required: true,
          description: "Stable idempotency key for repeated tax quote requests",
          searchOptions: { enabled: true },
        },
        sourceReferenceCode: {
          type: "string",
          required: false,
          description: "Optional safe external provider quote reference",
        },
      }),
      {
        common: {
          enterpriseCode: { enabled: true, name: "enterpriseCode" },
          quoteCode: { enabled: true, name: "quoteCode" },
        },
        individual: {
          quoteCode: { enabled: true, name: "quoteCode" },
          cartCode: { enabled: true, name: "cartCode" },
          orderCode: { enabled: true, name: "orderCode" },
          providerCode: { enabled: true, name: "providerCode" },
          status: { enabled: true, name: "status" },
          idempotencyKey: { enabled: true, name: "idempotencyKey" },
        },
      },
    ),
    taxQuoteLine: governed(
      Object.assign(common(), {
        lineCode: {
          type: "string",
          required: true,
          description: "Stable tax quote line identity",
          searchOptions: { enabled: true },
        },
        quoteCode: {
          type: "string",
          required: true,
          description: "Parent tax quote",
          searchOptions: { enabled: true },
        },
        entryCode: {
          type: "string",
          required: false,
          description: "Optional cart/order entry reference",
          searchOptions: { enabled: true },
        },
        taxCategoryCode: {
          type: "string",
          required: true,
          description: "Tax category used for this line",
          searchOptions: { enabled: true },
        },
        jurisdictionCode: {
          type: "string",
          required: true,
          description: "Jurisdiction applied to this line",
          searchOptions: { enabled: true },
        },
        rateCode: {
          type: "string",
          required: false,
          description: "Rate record used for this line",
          searchOptions: { enabled: true },
        },
        exemptionCode: {
          type: "string",
          required: false,
          description: "Optional exemption applied to this line",
          searchOptions: { enabled: true },
        },
        taxableAmount: {
          type: "string",
          required: true,
          description: "Exact decimal-string taxable amount",
        },
        netAmount: {
          type: "string",
          required: false,
          description:
            "Exact decimal-string line net amount before tax. For inclusive pricing this is split out from gross evidence.",
        },
        grossAmount: {
          type: "string",
          required: false,
          description:
            "Exact decimal-string line gross customer-facing amount after tax. For inclusive pricing this may equal the displayed line price.",
        },
        taxAmount: {
          type: "string",
          required: true,
          description: "Exact decimal-string tax amount",
        },
        taxInclusionMode: {
          type: "string",
          required: true,
          default: "TAX_EXCLUSIVE",
          description:
            "Whether the source price was tax-exclusive or tax-inclusive",
          searchOptions: { enabled: true },
        },
        taxIncluded: {
          type: "bool",
          required: false,
          default: false,
          description:
            "Display helper showing whether tax amount was included in the source price",
          searchOptions: { enabled: true },
        },
        currencyCode: {
          type: "string",
          required: true,
          description: "Currency for line amounts",
          searchOptions: { enabled: true },
        },
      }),
      {
        common: {
          enterpriseCode: { enabled: true, name: "enterpriseCode" },
          lineCode: { enabled: true, name: "lineCode" },
        },
        individual: {
          lineCode: { enabled: true, name: "lineCode" },
          quoteCode: { enabled: true, name: "quoteCode" },
          entryCode: { enabled: true, name: "entryCode" },
          jurisdictionCode: { enabled: true, name: "jurisdictionCode" },
          status: { enabled: true, name: "status" },
        },
      },
    ),
  },
};
