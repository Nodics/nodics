/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module tax/config/properties
 * @description Defines generated configurable defaults for tax.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
  backofficeCapabilities: {
    tax: {
      enabled: true,
      capabilityId: "tax-management",
      displayName: "Tax",
      category: "commerce",
      icon: "tax",
      contractVersion: 1,
      minimumClientContractVersion: 1,
      roles: ["FUNCTIONAL_CAPABILITY_PROVIDER"],
      discovery: {
        openApiPath: "/nodics/system/v0/contract/openapi/internal",
        contractVersion: 1,
      },
      requiredPermissions: ["tax.backoffice.read"],
      navigation: [
        {
          id: "tax",
          parentId: "commerce-operations",
          parentModuleName: "pricing",
          label: "Tax",
          route: "/commerce/operations/tax",
          icon: "tax",
          order: 560,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["tax.backoffice.read"],
          workbenchTarget: { moduleName: "tax", schemaName: "taxJurisdiction" },
          detailPanels: [
            {
              id: "jurisdiction-rates",
              label: "Rates",
              target: { moduleName: "tax", schemaName: "taxRate" },
              relation: {
                sourceField: "jurisdictionCode",
                targetField: "jurisdictionCode",
              },
            },
            {
              id: "jurisdiction-exemptions",
              label: "Exemptions",
              target: { moduleName: "tax", schemaName: "taxExemption" },
              relation: {
                sourceField: "jurisdictionCode",
                targetField: "jurisdictionCode",
              },
            },
          ],
          help: {
            summary:
              "Manage tax jurisdictions, rates, exemptions, providers, and quote evidence through the Tax capability without moving tax rules into Pricing, Cart, or Order.",
            documentationRoute: "/docs/capabilities/commerce/tax",
          },
        },
        {
          id: "tax-jurisdictions",
          parentId: "tax",
          label: "Tax Jurisdictions",
          route: "/commerce/operations/tax/jurisdictions",
          icon: "tax",
          order: 561,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["tax.backoffice.read"],
          workbenchTarget: { moduleName: "tax", schemaName: "taxJurisdiction" },
          help: {
            summary:
              "Maintain country, region, postal, authority, rounding, and jurisdiction status used by Tax calculations.",
            documentationRoute: "/docs/capabilities/commerce/tax",
          },
        },
        {
          id: "tax-rates",
          parentId: "tax",
          label: "Tax Rates",
          route: "/commerce/operations/tax/rates",
          icon: "tax",
          order: 562,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["tax.backoffice.read"],
          workbenchTarget: { moduleName: "tax", schemaName: "taxRate" },
          help: {
            summary:
              "Maintain exact tax rates by jurisdiction, category, rate type, effective range, and price-inclusion mode.",
            documentationRoute: "/docs/capabilities/commerce/tax/rates",
          },
        },
        {
          id: "tax-exemptions",
          parentId: "tax",
          label: "Tax Exemptions",
          route: "/commerce/operations/tax/exemptions",
          icon: "tax",
          order: 563,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["tax.backoffice.read"],
          workbenchTarget: { moduleName: "tax", schemaName: "taxExemption" },
          help: {
            summary:
              "Manage customer, certificate, jurisdiction, and category exemption evidence without storing private certificate payloads.",
            documentationRoute: "/docs/capabilities/commerce/tax/exemptions",
          },
        },
        {
          id: "tax-providers",
          parentId: "tax",
          label: "Tax Providers",
          route: "/commerce/operations/tax/providers",
          icon: "tax",
          order: 564,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["tax.backoffice.read"],
          workbenchTarget: { moduleName: "tax", schemaName: "taxProvider" },
          help: {
            summary:
              "Maintain safe tax provider metadata and adapter-service selection. Credentials remain outside business records.",
            documentationRoute: "/docs/capabilities/commerce/tax/providers",
          },
        },
        {
          id: "tax-quotes",
          parentId: "tax",
          label: "Tax Quotes",
          route: "/commerce/operations/tax/quotes",
          icon: "tax",
          order: 565,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["tax.backoffice.read"],
          workbenchTarget: { moduleName: "tax", schemaName: "taxQuote" },
          workbenchPresentation: {
            defaultColumns: [
              "quoteCode",
              "providerCode",
              "jurisdictionCode",
              "currencyCode",
              "subtotalAmount",
              "taxTotal",
              "taxInclusionMode",
              "status",
            ],
            readonlyFields: [
              "subtotalAmount",
              "taxTotal",
              "taxMode",
              "taxInclusionMode",
              "idempotencyKey",
            ],
            detailSections: [
              {
                id: "quote-identity",
                label: "Quote identity",
                fields: [
                  "quoteCode",
                  "cartCode",
                  "orderCode",
                  "providerCode",
                  "jurisdictionCode",
                  "status",
                ],
                order: 10,
              },
              {
                id: "quote-tax-display",
                label: "Tax display evidence",
                fields: [
                  "currencyCode",
                  "subtotalAmount",
                  "taxTotal",
                  "taxMode",
                  "taxInclusionMode",
                  "idempotencyKey",
                ],
                order: 20,
              },
            ],
          },
          detailPanels: [
            {
              id: "tax-quote-lines",
              label: "Quote Lines",
              target: { moduleName: "tax", schemaName: "taxQuoteLine" },
              relation: {
                sourceField: "quoteCode",
                targetField: "quoteCode",
              },
            },
          ],
          help: {
            summary:
              "Review immutable tax quote header evidence produced for checkout, order, provider, or reconciliation flows.",
            documentationRoute: "/docs/capabilities/commerce/tax/quotes",
            documentationFragment: "tax-inclusive-display-evidence",
          },
        },
        {
          id: "tax-quote-lines",
          parentId: "tax",
          label: "Tax Quote Lines",
          route: "/commerce/operations/tax/quote-lines",
          icon: "tax",
          order: 566,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["tax.backoffice.read"],
          workbenchTarget: { moduleName: "tax", schemaName: "taxQuoteLine" },
          workbenchPresentation: {
            defaultColumns: [
              "lineCode",
              "quoteCode",
              "entryCode",
              "taxCategoryCode",
              "jurisdictionCode",
              "rateCode",
              "grossAmount",
              "taxAmount",
              "taxInclusionMode",
            ],
            readonlyFields: [
              "taxableAmount",
              "netAmount",
              "grossAmount",
              "taxAmount",
              "taxInclusionMode",
              "taxIncluded",
              "exemptionCode",
            ],
            detailSections: [
              {
                id: "line-identity",
                label: "Line identity",
                fields: [
                  "lineCode",
                  "quoteCode",
                  "entryCode",
                  "taxCategoryCode",
                  "jurisdictionCode",
                  "rateCode",
                  "exemptionCode",
                ],
                order: 10,
              },
              {
                id: "line-tax-display",
                label: "Tax display evidence",
                fields: [
                  "currencyCode",
                  "taxableAmount",
                  "netAmount",
                  "grossAmount",
                  "taxAmount",
                  "taxInclusionMode",
                  "taxIncluded",
                ],
                order: 20,
              },
            ],
          },
          help: {
            summary:
              "Inspect line-level taxable, net, gross, tax amount, inclusion mode, jurisdiction, exemption, and provider evidence.",
            documentationRoute: "/docs/capabilities/commerce/tax/quotes",
            documentationFragment: "tax-inclusive-display-evidence",
          },
        },
      ],
    },
  },
  tax: {
    refundEvidence: { policyCode: "ORIGINAL_TAX_PROPORTIONAL", currencyScale: 2, roundingMode: "HALF_EVEN" },
    enterpriseScope: { required: true },
    identity: {
      separator: "::",
      maxCodeLength: 128,
      codePattern: "^[A-Za-z0-9][A-Za-z0-9._-]*$",
    },
    lifecycle: {
      statuses: ["DRAFT", "ACTIVE", "SUSPENDED", "RETIRED"],
      allowedTransitions: {
        DRAFT: ["ACTIVE", "RETIRED"],
        ACTIVE: ["SUSPENDED", "RETIRED"],
        SUSPENDED: ["ACTIVE", "RETIRED"],
        RETIRED: [],
      },
    },
    quoteLifecycle: {
      statuses: ["DRAFT", "QUOTED", "ACCEPTED", "EXPIRED", "VOIDED"],
      allowedTransitions: {
        DRAFT: ["QUOTED", "VOIDED"],
        QUOTED: ["ACCEPTED", "EXPIRED", "VOIDED"],
        ACCEPTED: [],
        EXPIRED: [],
        VOIDED: [],
      },
    },
    decimals: {
      maximumScale: 18,
      maximumDigits: 38,
    },
    jurisdiction: {
      roundingModes: ["HALF_UP", "HALF_EVEN", "UP", "DOWN"],
      minimumPrecisionScale: 0,
      maximumPrecisionScale: 8,
    },
    rate: {
      rateTypes: ["PERCENTAGE", "FIXED"],
      taxModes: ["NET", "GROSS"],
      taxInclusionModes: ["TAX_EXCLUSIVE", "TAX_INCLUSIVE"],
      legacyTaxModeMap: {
        NET: "TAX_EXCLUSIVE",
        GROSS: "TAX_INCLUSIVE",
      },
      maximumRate: "1",
    },
    provider: {
      providerTypes: [
        "INTERNAL",
        "EXTERNAL",
        "GOVERNMENT",
        "ERP",
        "MARKETPLACE",
        "PROJECT_PROVIDER",
      ],
      operations: ["QUOTE", "COMMIT", "VOID", "REFUND", "RECONCILE"],
    },
  },
};
