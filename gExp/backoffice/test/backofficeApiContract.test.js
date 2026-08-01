/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/test/backofficeApiContract
 * @description Validates registration schemas, route OpenAPI contracts, module-owned catalogue metadata, and compatibility boundaries.
 * @layer test
 * @owner backoffice
 */
const assert = require("assert");
const contracts = require("../src/schemas/apiContracts");
const service = require("../src/service/contract/defaultBackofficeContractService");
const routers = require("../src/router/routers").backoffice;
const statusDefinitions = require("../src/utils/statusDefinitions");

const capabilities = [
  require("../../../gCore/profile/config/properties").backofficeCapabilities
    .profile,
  require("../../../gContent/cms/config/properties").backofficeCapabilities.cms,
  require("../../../gCore/cronjob/config/properties").backofficeCapabilities
    .cronjob,
  require("../../../gCore/workflow/config/properties").backofficeCapabilities
    .workflow,
  require("../../../gComm/pricing/config/properties").backofficeCapabilities
    .pricing,
  require("../../../gFramework/nMedia/config/properties").backofficeCapabilities
    .media,
  require("../config/properties").backofficeCapabilities.backoffice,
];

assert(contracts.registrationBatch.required.includes("registrations"));
assert(contracts.capabilitySnapshot.required.includes("hash"));
assert(
  contracts.capabilitySnapshot.properties.changeClassification.enum.includes(
    "BREAKING",
  ),
);
assert(
  contracts.bootstrapData.properties.uiComposition.required.includes(
    "fallbackMode",
  ),
);
assert(contracts.bootstrapData.required.includes("axisPolicy"));
assert(contracts.bootstrapData.required.includes("tenantCode"));
assert(contracts.bootstrapData.required.includes("documentationSources"));
assert.deepStrictEqual(contracts.documentationSource.properties.type.enum, [
  "CMS",
  "OPENAPI",
]);
assert.strictEqual(
  contracts.documentationSource.properties.dashboard.additionalProperties,
  false,
);
assert.strictEqual(
  contracts.documentationSource.properties.dashboard.properties.coverage.properties
    .score.maximum,
  100,
);
assert.deepStrictEqual(contracts.axisPolicyUpdate.required, [
  "screenLockEnabled",
  "idleTimeoutSeconds",
  "expectedRevision",
]);
assert(contracts.axisPolicy.required.includes("recentNavigationLimit"));
assert.strictEqual(
  contracts.axisPolicy.properties.recentNavigationLimit.maximum,
  24,
);
assert.strictEqual(
  contracts.axisPolicyUpdate.properties.recentNavigationLimit.minimum,
  1,
);
assert.deepStrictEqual(contracts.publicBootstrapData.required, [
  "contractVersion",
  "clientContractVersion",
  "endpoints",
  "uiComposition",
]);
assert.deepStrictEqual(contracts.moduleAvailability.properties.state.enum, [
  "UP",
  "DEGRADED",
  "UNAVAILABLE",
  "UNKNOWN",
]);
assert.deepStrictEqual(
  contracts.backofficeMetadata.properties.navigation.items.properties
    .featureState.enum,
  ["ACTIVE", "PREVIEW", "DISABLED", "HIDDEN"],
);
assert(
  contracts.backofficeMetadata.properties.navigation.items.properties.group,
  "navigation must expose the governed business-group contract",
);
assert(
  contracts.backofficeMetadata.properties.navigation.items.properties
    .parentModuleName,
  "navigation must expose bounded cross-module parent references for group-owned navigation",
);
assert(
  contracts.backofficeMetadata.properties.navigation.items.properties
    .badgeProvider,
  "navigation badges must remain non-executable provider references",
);
assert(
  contracts.backofficeMetadata.properties.navigation.items.properties
    .workbenchTarget,
  "navigation must expose bounded schema-workbench targets for backend-driven Axis routes",
);
assert(
  contracts.backofficeMetadata.properties.navigation.items.properties.detailPanels,
  "navigation must expose bounded reusable schema detail panel metadata for Axis workspaces",
);
assert(
  contracts.backofficeMetadata.properties.navigation.items.properties.help,
  "navigation must expose bounded help metadata for backend-driven Axis workspace context",
);
assert.strictEqual(
  contracts.navigationWorkbenchTarget.additionalProperties,
  false,
);
assert.strictEqual(
  contracts.navigationWorkbenchTarget.properties.mode.enum[0],
  "create",
);
assert.strictEqual(contracts.navigationDetailPanel.additionalProperties, false);
assert.deepStrictEqual(contracts.navigationDetailPanel.required, [
  "id",
  "label",
  "target",
]);
assert.strictEqual(contracts.navigationHelp.additionalProperties, false);
assert.strictEqual(
  contracts.navigationHelp.properties.documentationRoute.pattern,
  "^/docs(?:$|/)",
);
assert(contracts.moduleAvailability.required.includes("unknownInstances"));
assert(
  contracts.adminDetailData.properties.instances.items.properties.environment,
);
assert(contracts.adminDetailData.properties.instances.items.properties.server);
assert(contracts.adminDetailData.properties.instances.items.properties.node);
assert(
  contracts.adminDetailData.properties.instances.items.properties
    .clientCallable,
);
assert(
  routers.registryControl.register.requestBody.required,
  "registration body schema must be required",
);
assert(
  routers.registryControl.register.responses["200"],
  "registration response schema must be declared",
);
assert(
  routers.registryDiscovery.bootstrap.responses["200"],
  "bootstrap response schema must be declared",
);
assert(
  routers.registryDiscovery.publicBootstrap.responses["200"],
  "public bootstrap response schema must be declared",
);
assert(
  routers.registryDiscovery.diagnostics.responses["200"],
  "diagnostics response schema must be declared",
);
assert(
  routers.axisPolicy.get.responses["200"],
  "Axis policy response schema must be declared",
);
assert(
  routers.axisPolicy.update.responses["200"],
  "Axis policy update response schema must be declared",
);
["SUC_BOF_00014", "SUC_BOF_00015", "SUC_BOF_00016"].forEach((code) => {
  assert(
    statusDefinitions[code],
    code + " must be registered before its controller response is serialized",
  );
});

capabilities.forEach((metadata) => {
  assert(
    service.validateBackofficeMetadata(metadata),
    metadata.capabilityId + " must own valid BackOffice metadata",
  );
  assert(
    metadata.requiredPermissions.length > 0,
    metadata.capabilityId + " metadata must declare discovery permission",
  );
  assert(
    metadata.roles.length > 0,
    metadata.capabilityId + " metadata must declare BackOffice provider roles",
  );
  assert(
    metadata.discovery.openApiPath.startsWith("/"),
    metadata.capabilityId + " discovery path must remain relative",
  );
});
assert(
  service.validateBackofficeMetadata({
    enabled: true,
    capabilityId: "icon-contract",
    displayName: "Icon contract",
    category: "platform",
    icon: "module",
    contractVersion: 1,
    minimumClientContractVersion: 1,
    roles: ["FUNCTIONAL_CAPABILITY_PROVIDER"],
    requiredPermissions: ["icon.read"],
    navigation: [
      {
        id: "records",
        label: "Records",
        route: "/records",
        icon: "registry",
        order: 1,
        group: {
          id: "operations",
          label: "Operations",
          labelKey: "axis.group.operations",
          order: 600,
        },
        perspectives: ["operations"],
        contexts: ["environment", "tenant"],
        featureState: "ACTIVE",
        badgeProvider: { moduleName: "cms", operationId: "cms.pending.count" },
        workbenchTarget: { moduleName: "cms", schemaName: "cmsPage" },
        detailPanels: [
          {
            id: "slots",
            label: "Slots",
            target: { moduleName: "cms", schemaName: "cmsSlot" },
            relation: {
              sourceField: "code",
              targetField: "pageCode",
              cardinality: "MANY",
            },
          },
        ],
        help: {
          summary:
            "Review backend-owned records with a short business explanation.",
          documentationRoute:
            "/docs/capabilities/content-publishing/wcms-authoring-model",
          documentationFragment: "pages",
        },
      },
    ],
  }),
);
assert(
  service.validateBackofficeMetadata({
    navigation: [
      {
        id: "child",
        label: "Child",
        parentId: "parent",
        parentModuleName: "gComm",
      },
    ],
  }),
  "cross-module navigation parent references must be allowed when explicitly bounded",
);
assert.strictEqual(
  service.validateBackofficeMetadata({
    enabled: true,
    capabilityId: "invalid-icon-contract",
    navigation: [{ id: "records", label: "Records", icon: "x".repeat(65) }],
  }),
  false,
);
assert.strictEqual(
  service.validateBackofficeMetadata({
    navigation: [{ id: "child", label: "Child", parentModuleName: "gComm" }],
  }),
  false,
  "cross-module parent references must include a parent id",
);
assert.strictEqual(
  service.validateBackofficeMetadata({
    navigation: [
      { id: "parent", label: "Parent", parentId: "child" },
      { id: "child", label: "Child", parentId: "parent" },
    ],
  }),
  false,
  "navigation cycles must fail registration",
);
assert.strictEqual(
  service.validateBackofficeMetadata({
    navigation: [{ id: "child", label: "Child", parentId: "missing" }],
  }),
  false,
  "orphan navigation entries must fail registration",
);
assert.strictEqual(
  service.validateBackofficeMetadata({
    navigation: [
      { id: "hidden", label: "Hidden", contexts: ["secret-context"] },
    ],
  }),
  false,
  "unknown context dimensions must fail registration",
);
assert.strictEqual(
  service.validateBackofficeMetadata({
    navigation: [
      {
        id: "unsafe-target",
        label: "Unsafe target",
        workbenchTarget: { moduleName: "cms", schemaName: "../cmsPage" },
      },
    ],
  }),
  false,
  "unsafe workbench schema names must fail registration",
);
assert.strictEqual(
  service.validateBackofficeMetadata({
    navigation: [
      {
        id: "unsafe-mode",
        label: "Unsafe mode",
        workbenchTarget: {
          moduleName: "cms",
          schemaName: "cmsPage",
          mode: "delete",
        },
      },
    ],
  }),
  false,
  "unsupported workbench target modes must fail registration",
);
assert.strictEqual(
  service.validateBackofficeMetadata({
    navigation: [
      {
        id: "unsafe-help",
        label: "Unsafe help",
        help: {
          summary: "Unsafe docs target",
          documentationRoute: "https://evil.example/docs",
        },
      },
    ],
  }),
  false,
  "external navigation help documentation routes must fail registration",
);
assert.strictEqual(
  service.validateBackofficeMetadata({
    navigation: [
      {
        id: "unsafe-help-fragment",
        label: "Unsafe help fragment",
        help: {
          summary: "Unsafe docs fragment",
          documentationRoute:
            "/docs/capabilities/content-publishing/wcms-authoring-model",
          documentationFragment: "../bad",
        },
      },
    ],
  }),
  false,
  "unsafe navigation help documentation fragments must fail registration",
);
assert(
  service.validateBackofficeMetadata({
    documentation: [
      {
        id: "guide",
        label: "Guide",
        type: "CMS",
        route: "/docs/guide",
        order: 1,
        connectionModule: "cms",
        site: "guideSite",
        catalog: "guideCatalog",
        defaultPage: "/docs/guide",
        packCode: "guideDocumentation",
        dashboard: {
          summary: "Guide documentation",
          kind: "Guide",
          icon: "content",
          audiences: ["developer"],
          coverage: {
            score: 80,
            status: "STRONG",
            signals: ["Overview"],
            gaps: ["Recipes"],
          },
        },
      },
      {
        id: "apis",
        label: "APIs",
        type: "OPENAPI",
        route: "/docs/apis",
        order: 2,
        connectionModule: "system",
        openApiPath: "/nodics/system/v0/contract/openapi",
        swaggerPath: "/nodics/system/v0/contract/swagger",
      },
    ],
  }),
);
assert.strictEqual(
  service.validateBackofficeMetadata({
    documentation: [
      {
        id: "bad-coverage",
        label: "Bad coverage",
        type: "OPENAPI",
        route: "/docs/bad",
        order: 1,
        connectionModule: "system",
        openApiPath: "/openapi",
        swaggerPath: "/swagger",
        dashboard: {
          summary: "Bad coverage",
          coverage: { score: 101, status: "STRONG" },
        },
      },
    ],
  }),
  false,
  "documentation dashboard coverage must remain bounded",
);
assert.strictEqual(
  service.validateBackofficeMetadata({
    documentation: [
      {
        id: "duplicate",
        label: "One",
        type: "CMS",
        route: "/docs/one",
        order: 1,
        connectionModule: "cms",
        site: "one",
        catalog: "one",
        defaultPage: "/docs/one",
        packCode: "one",
      },
      {
        id: "duplicate",
        label: "Two",
        type: "OPENAPI",
        route: "/docs/two",
        order: 2,
        connectionModule: "system",
        openApiPath: "/openapi",
        swaggerPath: "/swagger",
      },
    ],
  }),
  false,
  "duplicate documentation source ids must fail registration",
);
assert.strictEqual(
  service.validateBackofficeMetadata({
    documentation: [
      {
        id: "unsafe",
        label: "Unsafe",
        type: "OPENAPI",
        route: "//evil",
        order: 1,
        connectionModule: "system",
        openApiPath: "/openapi",
        swaggerPath: "/swagger",
      },
    ],
  }),
  false,
  "unsafe documentation routes must fail registration",
);
assert(capabilities[1].roles.includes("UI_COMPOSITION_PROVIDER"));
assert.strictEqual(
  capabilities[1].uiComposition.fallbackMode,
  "STATIC_RECOVERY_SHELL",
);

let registration = {
  moduleName: "cms",
  displayName: "Content Management",
  parentModule: "gContent",
  canonicalIdentity: "gContent/cms",
  instanceId: "runtime-1",
  clientCallable: true,
  endpoint: "https://cms.example/nodics/cms",
  capabilities: ["router"],
  leaseTtlMs: 30000,
  backoffice: capabilities[1],
};
assert(service.validateRegistration(registration));
let contentGroupRegistration = {
  moduleName: "gContent",
  displayName: "Content",
  canonicalIdentity: "gContent",
  instanceId: "runtime-1",
  moduleKind: "group",
  clientCallable: false,
};
assert(
  service.validateRegistrationBatch(
    {
      instanceId: "runtime-1",
      environment: "resolvedByEnvModule",
      server: "runtimeComposition",
      node: null,
      registrations: [contentGroupRegistration, registration],
    },
    10,
  ),
);
assert.strictEqual(
  service.validateRegistrationBatch(
    { instanceId: "runtime-1", registrations: [registration] },
    10,
  ),
  true,
  "batch hierarchy must allow a parent observed by another distributed runtime instance",
);
assert.strictEqual(
  service.validateRegistration(
    Object.assign({}, registration, { credential: "must-not-be-accepted" }),
  ),
  false,
);
assert.strictEqual(
  service.validateRegistration(
    Object.assign({}, registration, {
      healthPath: "https://evil.example/ready",
    }),
  ),
  false,
);
assert.strictEqual(
  service.validateBackofficeMetadata(
    Object.assign({}, registration.backoffice, { secret: "invalid" }),
  ),
  false,
);
assert.strictEqual(
  service.validateBackofficeMetadata(
    Object.assign({}, registration.backoffice, { roles: ["UNKNOWN_PROVIDER"] }),
  ),
  false,
);
assert.strictEqual(
  service.validateBackofficeMetadata(
    Object.assign({}, registration.backoffice, {
      roles: ["FUNCTIONAL_CAPABILITY_PROVIDER"],
      uiComposition: capabilities[1].uiComposition,
    }),
  ),
  false,
);
assert.strictEqual(
  service.validateRegistrationBatch(
    { instanceId: "other", registrations: [registration] },
    10,
  ),
  false,
);
console.log("BackOffice API and module catalogue contracts validated");
