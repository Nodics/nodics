/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module pricing/config/properties @description Layered pricing policy and provider configuration. @layer configuration @owner pricing */
module.exports = {
  backofficeCapabilities: {
    pricing: {
      enabled: true,
      capabilityId: "pricing-management",
      displayName: "Pricing",
      category: "commerce",
      icon: "price",
      contractVersion: 1,
      minimumClientContractVersion: 1,
      roles: ["FUNCTIONAL_CAPABILITY_PROVIDER"],
      discovery: {
        openApiPath: "/nodics/system/v0/contract/openapi/internal",
        contractVersion: 1,
      },
      requiredPermissions: ["pricing.backoffice.read"],
      navigation: [
        {
          id: "commerce-operations",
          label: "Commerce Operations",
          route: "/commerce/operations",
          icon: "commerce",
          order: 500,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["pricing.backoffice.read"],
          help: {
            summary:
              "Operate pricing, stock, stores, carts, orders, payment, shipping, and checkout records through their owning Commerce modules.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "pricing",
          parentId: "commerce-operations",
          label: "Pricing",
          route: "/commerce/operations/pricing",
          icon: "pricing",
          order: 520,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "ACTIVE",
          requiredPermissions: ["pricing.backoffice.read"],
          workbenchTarget: { moduleName: "pricing", schemaName: "priceList" },
          detailPanels: [
            {
              id: "price-list-prices",
              label: "Prices",
              target: { moduleName: "pricing", schemaName: "price" },
              relation: {
                sourceField: "priceListCode",
                targetField: "priceListCode",
              },
            },
            {
              id: "price-list-assignments",
              label: "Assignments",
              target: {
                moduleName: "pricing",
                schemaName: "priceListAssignment",
              },
              relation: {
                sourceField: "priceListCode",
                targetField: "priceListCode",
              },
            },
          ],
          help: {
            summary:
              "Manage pricing lists, prices, assignments, groups, and publication records through the Pricing capability.",
            documentationRoute: "/docs/capabilities/commerce/pricing",
          },
        },
        {
          id: "price-lists",
          parentId: "pricing",
          label: "Price Lists",
          route: "/commerce/operations/pricing/lists",
          icon: "pricing",
          order: 521,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["pricing.backoffice.read"],
          workbenchTarget: { moduleName: "pricing", schemaName: "priceList" },
          detailPanels: [
            {
              id: "price-list-prices",
              label: "Prices",
              target: { moduleName: "pricing", schemaName: "price" },
              relation: {
                sourceField: "priceListCode",
                targetField: "priceListCode",
              },
            },
            {
              id: "price-list-assignments",
              label: "Assignments",
              target: {
                moduleName: "pricing",
                schemaName: "priceListAssignment",
              },
              relation: {
                sourceField: "priceListCode",
                targetField: "priceListCode",
              },
            },
          ],
          help: {
            summary:
              "Maintain governed price-list records with priority, currencies, tax mode, stacking mode, and lifecycle state.",
            documentationRoute: "/docs/capabilities/commerce/pricing",
          },
        },
        {
          id: "prices",
          parentId: "pricing",
          label: "Prices",
          route: "/commerce/operations/pricing/prices",
          icon: "pricing",
          order: 522,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["pricing.backoffice.read"],
          workbenchTarget: { moduleName: "pricing", schemaName: "price" },
          help: {
            summary:
              "Maintain exact price records for item, customer, group, currency, unit, quantity, channel, and effective range.",
            documentationRoute: "/docs/capabilities/commerce/pricing",
          },
        },
        {
          id: "price-groups",
          parentId: "pricing",
          label: "Price Groups",
          route: "/commerce/operations/pricing/groups",
          icon: "pricing",
          order: 523,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["pricing.backoffice.read"],
          workbenchTarget: { moduleName: "pricing", schemaName: "priceGroup" },
          detailPanels: [
            {
              id: "price-group-members",
              label: "Members",
              target: {
                moduleName: "pricing",
                schemaName: "priceGroupMember",
              },
              relation: {
                sourceField: "priceGroupCode",
                targetField: "priceGroupCode",
              },
            },
          ],
          help: {
            summary:
              "Maintain item, customer, segment, or contract price groups used during price resolution.",
            documentationRoute: "/docs/capabilities/commerce/pricing",
          },
        },
        {
          id: "price-group-members",
          parentId: "pricing",
          label: "Price Group Members",
          route: "/commerce/operations/pricing/group-members",
          icon: "pricing",
          order: 524,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["pricing.backoffice.read"],
          workbenchTarget: {
            moduleName: "pricing",
            schemaName: "priceGroupMember",
          },
          help: {
            summary:
              "Manage membership records that connect customers, segments, items, or contracts to pricing groups.",
            documentationRoute: "/docs/capabilities/commerce/pricing",
          },
        },
        {
          id: "price-assignments",
          parentId: "pricing",
          label: "Price Assignments",
          route: "/commerce/operations/pricing/assignments",
          icon: "pricing",
          order: 525,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["pricing.backoffice.read"],
          workbenchTarget: {
            moduleName: "pricing",
            schemaName: "priceListAssignment",
          },
          help: {
            summary:
              "Assign price lists to enterprise, country, site, store, channel, segment, or customer scopes.",
            documentationRoute:
              "/docs/capabilities/commerce/pricing/operations",
          },
        },
        {
          id: "promotions",
          parentId: "pricing",
          label: "Promotions",
          route: "/commerce/operations/pricing/promotions",
          icon: "pricing",
          order: 526,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "DISABLED",
          help: {
            summary:
              "Planned workspace for promotion rules once the commerce promotion backend model is introduced.",
            documentationRoute: "/docs/capabilities/commerce/pricing",
          },
        },
        {
          id: "coupons",
          parentId: "pricing",
          label: "Coupons",
          route: "/commerce/operations/pricing/coupons",
          icon: "pricing",
          order: 527,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "DISABLED",
          help: {
            summary:
              "Planned workspace for coupon campaigns and redemption records once the backend model is introduced.",
            documentationRoute: "/docs/capabilities/commerce/pricing",
          },
        },
      ],
    },
  },
  cache: {
    pricing: {
      channels: {
        resolution: { enabled: true, fallback: true, engine: "local", ttl: 30 },
      },
    },
  },
  pricing: {
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
    priceList: {
      minimumPriority: 0,
      maximumPriority: 999999,
      taxModes: ["NET", "GROSS"],
      stackingModes: ["EXCLUSIVE", "COMBINABLE"],
    },
    assignment: {
      scopeTypes: [
        "ENTERPRISE",
        "COUNTRY",
        "SITE",
        "STORE",
        "CHANNEL",
        "CUSTOMER_SEGMENT",
        "CUSTOMER",
      ],
      scopeSpecificity: {
        ENTERPRISE: 100,
        COUNTRY: 200,
        SITE: 300,
        CHANNEL: 350,
        STORE: 400,
        CUSTOMER_SEGMENT: 500,
        CUSTOMER: 600,
      },
      minimumPriority: 0,
      maximumPriority: 999999,
    },
    priceGroup: {
      groupTypes: ["ITEM", "CUSTOMER", "CUSTOMER_SEGMENT", "CONTRACT"],
      maximumMembers: 10000,
    },
    price: {
      maximumScale: 18,
      maximumDigits: 38,
      maximumUnitFactor: 1000000000,
    },
    resolution: {
      requireServiceToken: true,
      maximumCandidates: 5000,
      maximumContextValues: 100,
      exactCurrencyRequired: true,
      failOnAmbiguity: true,
      contextKeys: [
        "countryCode",
        "siteCode",
        "storeCode",
        "channelCode",
        "customerCode",
        "customerSegmentCodes",
        "customerGroupCodes",
        "contractCodes",
      ],
    },
    cache: {
      enabled: true,
      moduleName: "pricing",
      channelName: "resolution",
      keyPrefix: "priceResolution:",
      ttlSeconds: 30,
      maximumKeyLength: 256,
      cacheExplicitEvaluationTime: false,
    },
    references: {
      providers: {
        store: "DefaultPricingStoreReferenceProviderService",
        customer: null,
        customerSegment: null,
        item: null,
        unit: "DefaultPricingUnitsReferenceProviderService",
      },
      requireValidationWhenConfigured: true,
    },
    storeReference: {
      moduleName: "store",
      apiVersion: "v0",
      apiName: "/references/stores/resolve",
      requestTimeoutMs: 2000,
      maximumAttempts: 2,
      preferLocal: true,
    },
    unitsReference: {
      moduleName: "units",
      apiVersion: "v0",
      apiName: "/references/units/convert",
      requestTimeoutMs: 2000,
      maximumAttempts: 2,
      preferLocal: true,
    },
    storefrontContext: {
      headerName: "x-nodics-storefront-context",
      moduleName: "storefront",
      apiVersion: "v0",
      apiName: "/context/introspect",
      bootstrapTenant: "default",
      preferLocal: true,
      requestTimeoutMs: 1000,
      maximumAttempts: 1,
      maximumResponseBytes: 32768,
    },
    currencyConversion: { enabled: false, provider: null },
    management: {
      maximumResultCount: 500,
      maximumPreviewRecords: 5000,
      maximumPayloadBytes: 262144,
      allowedResources: [
        "priceLists",
        "assignments",
        "groups",
        "memberships",
        "prices",
      ],
    },
    workflow: {
      enabled: true,
      defaultMode: "MANUAL",
      modes: ["MANUAL", "AUTOMATIC"],
      manualWorkflowCode: "pricingPublicationManualFlow",
      automaticWorkflowCode: "pricingPublicationAutomaticFlow",
      maximumAssociatedItems: 10000,
      allowedAssociatedSchemas: [
        "priceList",
        "priceListAssignment",
        "priceGroup",
        "priceGroupMember",
        "price",
      ],
    },
    publication: {
      enabled: false,
      runtimeRole: "UNASSIGNED",
      rootTypes: {
        PRICE_LIST: { schema: "priceList", service: "DefaultPriceListService" },
      },
      maxDependencies: 10000,
      targetTransportProvider: null,
      target: {
        moduleName: null,
        connectionName: null,
        connectionType: "abstract",
        timeoutMs: 30000,
        maxAttempts: 3,
        maxManifestBytes: 5242880,
        supportedContractVersions: [1],
      },
    },
  },
  publish: {
    providers: {
      domainAdapters: { pricing: "DefaultPricingPublicationAdapterService" },
      versionProviders: {
        pricing: "DefaultPricingPublicationVersionProviderService",
      },
    },
  },
};
