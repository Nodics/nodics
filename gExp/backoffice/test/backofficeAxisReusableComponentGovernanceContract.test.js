/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/test/backofficeAxisReusableComponentGovernanceContract
 * @description Protects backend-driven Axis navigation, reusable schema workspace metadata, and documentation/help contracts.
 * @layer test
 * @owner backoffice
 */
const assert = require("assert");
const service = require("../src/service/contract/defaultBackofficeContractService");

const cmsCapability = require("../../../gContent/cms/config/properties")
  .backofficeCapabilities.cms;
const mediaCapability = require("../../../gFramework/nMedia/config/properties")
  .backofficeCapabilities.media;
const paymentCapability =
  require("../../../gComm/payment/paymentCore/config/properties")
    .backofficeCapabilities.payment;
const cresCapability = require("../../../gMrkty/cres/config/properties")
  .backofficeCapabilities.cres;

const capabilities = [
  cmsCapability,
  mediaCapability,
  paymentCapability,
  cresCapability,
];

const schemaBackedNavigation = [
  {
    capability: cmsCapability,
    id: "sites",
    moduleName: "cms",
    schemaName: "cmsSite",
  },
  {
    capability: cmsCapability,
    id: "pages",
    moduleName: "cms",
    schemaName: "cmsPage",
  },
  {
    capability: cmsCapability,
    id: "slot-definitions",
    moduleName: "cms",
    schemaName: "cmsSlotDefinition",
  },
  {
    capability: cmsCapability,
    id: "renderer-mappings",
    moduleName: "cms",
    schemaName: "cmsTypeCode2Renderer",
  },
  {
    capability: paymentCapability,
    id: "payment-methods",
    moduleName: "payment",
    schemaName: "paymentMethod",
  },
  {
    capability: paymentCapability,
    id: "payment-providers",
    moduleName: "payment",
    schemaName: "paymentProvider",
  },
  {
    capability: paymentCapability,
    id: "payment-provider-policies",
    moduleName: "payment",
    schemaName: "paymentProviderExecutionPolicy",
  },
  {
    capability: cresCapability,
    id: "customer-reviews",
    moduleName: "cres",
    schemaName: "customerReview",
  },
  {
    capability: cresCapability,
    id: "review-aggregates",
    moduleName: "cres",
    schemaName: "customerReviewAggregate",
  },
  {
    capability: cresCapability,
    id: "review-abuse-reports",
    moduleName: "cres",
    schemaName: "customerReviewAbuseReport",
  },
];

function findNavigation(capability, id) {
  return (capability.navigation || []).find((item) => item.id === id);
}

function walkMetadata(value, visitor, path = []) {
  if (!value || typeof value !== "object") return;
  Object.entries(value).forEach(([key, child]) => {
    visitor(key, child, path);
    if (child && typeof child === "object") {
      walkMetadata(child, visitor, path.concat(key));
    }
  });
}

capabilities.forEach((capability) => {
  assert(
    service.validateBackofficeMetadata(capability),
    capability.capabilityId + " must expose valid BackOffice metadata",
  );
  assert(
    Array.isArray(capability.navigation) && capability.navigation.length > 0,
    capability.capabilityId + " must expose backend-owned navigation metadata",
  );
  walkMetadata(capability.navigation, (key, value, path) => {
    assert.notStrictEqual(
      typeof value,
      "function",
      path.concat(key).join(".") + " must remain data-only metadata",
    );
    assert(
      ![
        "component",
        "componentName",
        "renderer",
        "render",
        "renderFn",
      ].includes(key),
      path.concat(key).join(".") +
        " must not smuggle Axis frontend render decisions into BackOffice metadata",
    );
  });
});

schemaBackedNavigation.forEach(({ capability, id, moduleName, schemaName }) => {
  const entry = findNavigation(capability, id);
  assert(entry, id + " navigation entry must exist");
  assert.deepStrictEqual(
    entry.workbenchTarget,
    { moduleName, schemaName },
    id + " must point Axis to the owning backend schema workspace",
  );
  assert(entry.help, id + " must provide reusable page help metadata");
  assert(
    entry.help.documentationRoute.startsWith("/docs/"),
    id + " documentation must remain a safe framework documentation route",
  );
  assert(
    !entry.help.documentationRoute.startsWith("/docs/nodics-axis"),
    id +
      " documentation must explain the framework capability, not only Axis UI",
  );
});

mediaCapability.navigation.forEach((entry) => {
  assert(entry.help, entry.id + " media page must expose backend-owned help");
  assert.strictEqual(
    entry.help.documentationRoute,
    "/docs/reference/media-management",
    entry.id + " must link to the nMedia framework documentation pack",
  );
  assert(
    !entry.workbenchPresentation,
    entry.id +
      " must not duplicate generic schema-grid presentation metadata while nMedia owns specialized media lifecycle contracts",
  );
});
