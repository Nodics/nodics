/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const contracts = require("../../schemas/apiContracts");

/**
 * @module backoffice/service/contract/DefaultBackofficeContractService
 * @description Validates BackOffice registration and module-owned catalogue metadata against the authoritative API contracts.
 * @layer service
 * @owner backoffice
 * @override Later modules may extend validation while preserving bounds, field allowlists, and error behavior.
 */
module.exports = {
  /** Initializes the API contract service. */
  init: function () {
    return Promise.resolve(true);
  },
  /** Completes the API contract service initialization. */
  postInit: function () {
    return Promise.resolve(true);
  },
  /** Returns the authoritative BackOffice API contract definitions. */
  getContracts: function () {
    return contracts;
  },
  /** Returns whether a value is a non-empty bounded string. */
  isString: function (value, maxLength = 256) {
    return (
      typeof value === "string" && value.length > 0 && value.length <= maxLength
    );
  },
  /** Returns whether a list contains unique bounded strings. */
  isStringList: function (value, maxItems = 128) {
    return (
      Array.isArray(value) &&
      value.length <= maxItems &&
      value.every((item) => this.isString(item, 256)) &&
      new Set(value).size === value.length
    );
  },
  /** Validates one bounded navigation group declaration. */
  validateNavigationGroup: function (group) {
    return (
      group &&
      typeof group === "object" &&
      !Array.isArray(group) &&
      !Object.keys(group).some(
        (key) => !["id", "label", "labelKey", "order"].includes(key),
      ) &&
      this.isString(group.id, 128) &&
      this.isString(group.label) &&
      (group.labelKey === undefined || this.isString(group.labelKey)) &&
      (group.order === undefined || Number.isInteger(group.order))
    );
  },
  /** Validates one non-executable badge-provider reference. */
  validateNavigationBadgeProvider: function (provider) {
    return (
      provider &&
      typeof provider === "object" &&
      !Array.isArray(provider) &&
      !Object.keys(provider).some(
        (key) => !["moduleName", "operationId"].includes(key),
      ) &&
      contracts.moduleName.pattern &&
      new RegExp(contracts.moduleName.pattern).test(
        provider.moduleName || "",
      ) &&
      this.isString(provider.operationId)
    );
  },
  /** Validates one bounded non-executable schema-workbench navigation target. */
  validateNavigationWorkbenchTarget: function (target) {
    return (
      target &&
      typeof target === "object" &&
      !Array.isArray(target) &&
      !Object.keys(target).some(
        (key) => !["moduleName", "schemaName", "mode"].includes(key),
      ) &&
      contracts.moduleName.pattern &&
      new RegExp(contracts.moduleName.pattern).test(target.moduleName || "") &&
      this.isString(target.schemaName, 128) &&
      /^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(target.schemaName) &&
      (target.mode === undefined || target.mode === "create")
    );
  },
  /** Validates backend-owned reusable detail panel declarations for schema workspaces. */
  validateNavigationDetailPanels: function (panels) {
    if (!Array.isArray(panels) || panels.length > 16) return false;
    let ids = panels.map((panel) => panel && panel.id);
    if (
      ids.some((id) => !this.isString(id, 128)) ||
      new Set(ids).size !== ids.length
    )
      return false;
    return panels.every((panel) => {
      if (!panel || typeof panel !== "object" || Array.isArray(panel))
        return false;
      if (
        Object.keys(panel).some(
          (key) =>
            !["id", "label", "summary", "order", "target", "relation"].includes(
              key,
            ),
        ) ||
        !this.isString(panel.label) ||
        (panel.summary !== undefined && !this.isString(panel.summary, 320)) ||
        (panel.order !== undefined && !Number.isInteger(panel.order)) ||
        !this.validateNavigationWorkbenchTarget(panel.target)
      )
        return false;
      if (panel.relation === undefined) return true;
      return (
        panel.relation &&
        typeof panel.relation === "object" &&
        !Array.isArray(panel.relation) &&
        !Object.keys(panel.relation).some(
          (key) => !["sourceField", "targetField", "cardinality"].includes(key),
        ) &&
        this.isString(panel.relation.sourceField, 128) &&
        this.isString(panel.relation.targetField, 128) &&
        (panel.relation.cardinality === undefined ||
          ["ONE", "MANY"].includes(panel.relation.cardinality))
      );
    });
  },
  /** Validates bounded schema-workbench presentation hints owned by backend modules. */
  validateNavigationWorkbenchPresentation: function (presentation) {
    if (
      !presentation ||
      typeof presentation !== "object" ||
      Array.isArray(presentation)
    )
      return false;
    if (
      Object.keys(presentation).some(
        (key) =>
          ![
            "defaultColumns",
            "hiddenFields",
            "editableFields",
            "readonlyFields",
            "forbiddenFields",
            "quickFilters",
            "recoveryActions",
          ].includes(key),
      )
    )
      return false;
    if (
      presentation.defaultColumns !== undefined &&
      !this.isStringList(presentation.defaultColumns, 32)
    )
      return false;
    if (
      presentation.hiddenFields !== undefined &&
      !this.isStringList(presentation.hiddenFields, 64)
    )
      return false;
    if (
      presentation.editableFields !== undefined &&
      !this.isStringList(presentation.editableFields, 64)
    )
      return false;
    if (
      presentation.readonlyFields !== undefined &&
      !this.isStringList(presentation.readonlyFields, 64)
    )
      return false;
    if (
      presentation.forbiddenFields !== undefined &&
      !this.isStringList(presentation.forbiddenFields, 64)
    )
      return false;
    if (presentation.quickFilters !== undefined) {
      if (
        !Array.isArray(presentation.quickFilters) ||
        presentation.quickFilters.length > 24
      )
        return false;
      let ids = presentation.quickFilters.map((filter) => filter && filter.id);
      if (
        ids.some((id) => !this.isString(id, 128)) ||
        new Set(ids).size !== ids.length
      )
        return false;
      if (
        !presentation.quickFilters.every(
          (filter) =>
            filter &&
            typeof filter === "object" &&
            !Array.isArray(filter) &&
            !Object.keys(filter).some(
              (key) =>
                !["id", "label", "field", "value", "values", "order"].includes(
                  key,
                ),
            ) &&
            this.isString(filter.label, 128) &&
            this.isString(filter.field, 128) &&
            (filter.value === undefined || this.isString(filter.value, 128)) &&
            (filter.values === undefined ||
              this.isStringList(filter.values, 24)) &&
            (filter.value !== undefined || filter.values !== undefined) &&
            (filter.order === undefined || Number.isInteger(filter.order)),
        )
      )
        return false;
    }
    if (presentation.recoveryActions !== undefined) {
      if (
        !Array.isArray(presentation.recoveryActions) ||
        presentation.recoveryActions.length > 24
      )
        return false;
      let ids = presentation.recoveryActions.map(
        (action) => action && action.id,
      );
      if (
        ids.some((id) => !this.isString(id, 128)) ||
        new Set(ids).size !== ids.length
      )
        return false;
      if (
        !presentation.recoveryActions.every(
          (action) =>
            action &&
            typeof action === "object" &&
            !Array.isArray(action) &&
            !Object.keys(action).some(
              (key) =>
                ![
                  "id",
                  "label",
                  "ownerModule",
                  "strategy",
                  "handlerAction",
                  "summary",
                  "order",
                ].includes(key),
            ) &&
            this.isString(action.label, 128) &&
            this.isString(action.ownerModule, 128) &&
            this.isString(action.strategy, 128) &&
            this.isString(action.handlerAction, 128) &&
            (action.summary === undefined ||
              this.isString(action.summary, 320)) &&
            (action.order === undefined || Number.isInteger(action.order)),
        )
      )
        return false;
    }
    return true;
  },
  /** Validates bounded non-executable navigation help metadata for Axis workspaces. */
  validateNavigationHelp: function (help) {
    return (
      help &&
      typeof help === "object" &&
      !Array.isArray(help) &&
      !Object.keys(help).some(
        (key) =>
          !["summary", "documentationRoute", "documentationFragment"].includes(
            key,
          ),
      ) &&
      this.isString(help.summary, 320) &&
      (help.documentationRoute === undefined ||
        this.isSafeDocumentationRoute(help.documentationRoute)) &&
      (help.documentationFragment === undefined ||
        (typeof help.documentationFragment === "string" &&
          /^[A-Za-z0-9._:-]{1,128}$/.test(help.documentationFragment)))
    );
  },
  /** Validates bounded non-executable lifecycle action hints for Axis workspaces. */
  validateNavigationLifecycleActions: function (actions) {
    if (!Array.isArray(actions) || actions.length > 24) return false;
    let allowedFeatureStates = ["ACTIVE", "PREVIEW", "DISABLED", "HIDDEN"];
    let ids = actions.map((action) => action && action.id);
    if (
      ids.some((id) => !this.isString(id, 128)) ||
      new Set(ids).size !== ids.length
    )
      return false;
    return actions.every((action) => {
      if (!action || typeof action !== "object" || Array.isArray(action))
        return false;
      if (
        Object.keys(action).some(
          (key) =>
            ![
              "id",
              "label",
              "intent",
              "permission",
              "summary",
              "targetStatuses",
              "featureState",
              "ownerModule",
              "handlerAction",
              "operationRoute",
              "order",
            ].includes(key),
        ) ||
        !this.isString(action.label, 128) ||
        !this.isString(action.intent, 64) ||
        (action.permission !== undefined &&
          !this.isString(action.permission, 128)) ||
        (action.summary !== undefined && !this.isString(action.summary, 320)) ||
        (action.targetStatuses !== undefined &&
          !this.isStringList(action.targetStatuses, 32)) ||
        (action.featureState !== undefined &&
          !allowedFeatureStates.includes(action.featureState)) ||
        (action.ownerModule !== undefined &&
          !(
            contracts.moduleName.pattern &&
            new RegExp(contracts.moduleName.pattern).test(action.ownerModule)
          )) ||
        (action.handlerAction !== undefined &&
          !this.isString(action.handlerAction, 128)) ||
        (action.operationRoute !== undefined &&
          !this.isSafePath(action.operationRoute)) ||
        (action.order !== undefined && !Number.isInteger(action.order))
      )
        return false;
      return true;
    });
  },
  /** Validates bounded module-owned navigation metadata and hierarchy. */
  validateNavigation: function (navigation) {
    if (!Array.isArray(navigation) || navigation.length > 64) return false;
    let allowedContexts = [
      "environment",
      "tenant",
      "enterprise",
      "site",
      "catalog",
    ];
    let allowedFeatureStates = ["ACTIVE", "PREVIEW", "DISABLED", "HIDDEN"];
    let ids = navigation.map((item) => item && item.id);
    if (
      ids.some((id) => !this.isString(id, 128)) ||
      new Set(ids).size !== ids.length
    )
      return false;
    if (
      !navigation.every(
        (item) =>
          item &&
          !Object.keys(item).some(
            (key) =>
              ![
                "id",
                "label",
                "route",
                "icon",
                "order",
                "requiredPermissions",
                "labelKey",
                "parentId",
                "parentModuleName",
                "group",
                "perspectives",
                "contexts",
                "featureState",
                "badgeProvider",
                "workbenchTarget",
                "detailPanels",
                "workbenchPresentation",
                "help",
                "lifecycleActions",
              ].includes(key),
          ) &&
          this.isString(item.label) &&
          (item.route === undefined || this.isString(item.route, 512)) &&
          (item.order === undefined || Number.isInteger(item.order)) &&
          (item.icon === undefined || this.isString(item.icon, 64)) &&
          (item.labelKey === undefined || this.isString(item.labelKey)) &&
          (item.parentId === undefined ||
            (this.isString(item.parentId, 128) && item.parentId !== item.id)) &&
          (item.parentModuleName === undefined ||
            (item.parentId !== undefined &&
              contracts.moduleName.pattern &&
              new RegExp(contracts.moduleName.pattern).test(
                item.parentModuleName,
              ))) &&
          (item.group === undefined ||
            this.validateNavigationGroup(item.group)) &&
          (item.perspectives === undefined ||
            this.isStringList(item.perspectives, 16)) &&
          (item.contexts === undefined ||
            (this.isStringList(item.contexts, 8) &&
              item.contexts.every((context) =>
                allowedContexts.includes(context),
              ))) &&
          (item.featureState === undefined ||
            allowedFeatureStates.includes(item.featureState)) &&
          (item.badgeProvider === undefined ||
            this.validateNavigationBadgeProvider(item.badgeProvider)) &&
          (item.workbenchTarget === undefined ||
            this.validateNavigationWorkbenchTarget(item.workbenchTarget)) &&
          (item.detailPanels === undefined ||
            this.validateNavigationDetailPanels(item.detailPanels)) &&
          (item.workbenchPresentation === undefined ||
            this.validateNavigationWorkbenchPresentation(
              item.workbenchPresentation,
            )) &&
          (item.help === undefined || this.validateNavigationHelp(item.help)) &&
          (item.lifecycleActions === undefined ||
            this.validateNavigationLifecycleActions(item.lifecycleActions)) &&
          (item.requiredPermissions === undefined ||
            this.isStringList(item.requiredPermissions)),
      )
    )
      return false;
    let byId = Object.fromEntries(navigation.map((item) => [item.id, item]));
    if (
      navigation.some(
        (item) =>
          item.parentId &&
          item.parentModuleName === undefined &&
          !byId[item.parentId],
      )
    )
      return false;
    return navigation.every((item) => {
      let visited = new Set([item.id]);
      let parentId = item.parentId;
      let parentModuleName = item.parentModuleName;
      while (parentId) {
        if (parentModuleName !== undefined) return true;
        if (visited.has(parentId)) return false;
        visited.add(parentId);
        parentId = byId[parentId] && byId[parentId].parentId;
      }
      return true;
    });
  },
  /** Validates bounded declarative documentation sources contributed by one owning module. */
  validateDocumentation: function (documentation) {
    if (!Array.isArray(documentation) || documentation.length > 32)
      return false;
    let ids = documentation.map((source) => source && source.id);
    if (
      ids.some((id) => !this.isString(id, 128)) ||
      new Set(ids).size !== ids.length
    )
      return false;
    return documentation.every((source) => {
      if (!source || typeof source !== "object" || Array.isArray(source))
        return false;
      let allowed = [
        "id",
        "label",
        "labelKey",
        "type",
        "route",
        "order",
        "connectionModule",
        "site",
        "catalog",
        "defaultPage",
        "packCode",
        "openApiPath",
        "swaggerPath",
        "requiredPermissions",
        "dashboard",
      ];
      if (
        Object.keys(source).some((key) => !allowed.includes(key)) ||
        !this.isString(source.label) ||
        !["CMS", "OPENAPI"].includes(source.type) ||
        !this.isSafePath(source.route) ||
        !Number.isInteger(source.order) ||
        !new RegExp(contracts.moduleName.pattern).test(
          source.connectionModule || "",
        ) ||
        (source.labelKey !== undefined && !this.isString(source.labelKey)) ||
        (source.requiredPermissions !== undefined &&
          !this.isStringList(source.requiredPermissions)) ||
        !this.validateDocumentationDashboard(source.dashboard)
      )
        return false;
      if (source.type === "CMS") {
        return (
          ["site", "catalog", "defaultPage", "packCode"].every((key) =>
            this.isString(source[key], 128),
          ) &&
          this.isSafePath(source.defaultPage) &&
          source.openApiPath === undefined &&
          source.swaggerPath === undefined
        );
      }
      return (
        this.isSafePath(source.openApiPath) &&
        this.isSafePath(source.swaggerPath) &&
        ["site", "catalog", "defaultPage", "packCode"].every(
          (key) => source[key] === undefined,
        )
      );
    });
  },
  /** Validates bounded presentation and coverage metadata for the documentation dashboard. */
  validateDocumentationDashboard: function (dashboard) {
    if (dashboard === undefined) return true;
    if (!dashboard || typeof dashboard !== "object" || Array.isArray(dashboard))
      return false;
    let allowed = ["summary", "kind", "icon", "audiences", "coverage"];
    if (Object.keys(dashboard).some((key) => !allowed.includes(key)))
      return false;
    if (
      ["summary", "kind", "icon"].some(
        (key) =>
          dashboard[key] !== undefined &&
          !this.isString(dashboard[key], key === "summary" ? 320 : 64),
      )
    )
      return false;
    if (
      dashboard.audiences !== undefined &&
      !this.isStringList(dashboard.audiences, 12)
    )
      return false;
    if (dashboard.coverage === undefined) return true;
    let coverage = dashboard.coverage;
    if (!coverage || typeof coverage !== "object" || Array.isArray(coverage))
      return false;
    let coverageAllowed = ["score", "status", "signals", "gaps"];
    if (Object.keys(coverage).some((key) => !coverageAllowed.includes(key)))
      return false;
    if (
      !Number.isInteger(coverage.score) ||
      coverage.score < 0 ||
      coverage.score > 100 ||
      !["STRONG", "PARTIAL", "NEEDS_WORK", "REFERENCE"].includes(
        coverage.status,
      )
    )
      return false;
    return ["signals", "gaps"].every(
      (key) =>
        coverage[key] === undefined ||
        (this.isStringList(coverage[key], 12) &&
          coverage[key].every((item) => this.isString(item, 160))),
    );
  },
  /** Returns whether a string is a bounded application-relative path. */
  isSafePath: function (value) {
    return (
      this.isString(value, 512) &&
      value.startsWith("/") &&
      !value.startsWith("//") &&
      !value.includes("://")
    );
  },
  /** Returns whether a string is a bounded application-relative documentation route. */
  isSafeDocumentationRoute: function (value) {
    return this.isSafePath(value) && value.startsWith("/docs");
  },
  /** Validates optional module-owned BackOffice catalogue metadata. */
  validateBackofficeMetadata: function (metadata) {
    if (metadata === undefined) return true;
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata))
      return false;
    let allowed = [
      "enabled",
      "capabilityId",
      "displayName",
      "category",
      "icon",
      "contractVersion",
      "minimumClientContractVersion",
      "roles",
      "discovery",
      "uiComposition",
      "documentation",
      "requiredPermissions",
      "navigation",
    ];
    if (Object.keys(metadata).some((key) => !allowed.includes(key)))
      return false;
    if (metadata.enabled !== undefined && typeof metadata.enabled !== "boolean")
      return false;
    if (
      ["capabilityId", "displayName", "category", "icon"].some(
        (key) => metadata[key] !== undefined && !this.isString(metadata[key]),
      )
    )
      return false;
    if (
      ["contractVersion", "minimumClientContractVersion"].some(
        (key) =>
          metadata[key] !== undefined &&
          (!Number.isInteger(metadata[key]) || metadata[key] < 1),
      )
    )
      return false;
    if (
      metadata.requiredPermissions !== undefined &&
      !this.isStringList(metadata.requiredPermissions)
    )
      return false;
    let roleValues = contracts.moduleRole.enum;
    if (
      metadata.roles !== undefined &&
      (!this.isStringList(metadata.roles, roleValues.length) ||
        metadata.roles.some((role) => !roleValues.includes(role)))
    )
      return false;
    if (
      metadata.discovery !== undefined &&
      (!metadata.discovery ||
        typeof metadata.discovery !== "object" ||
        Array.isArray(metadata.discovery) ||
        Object.keys(metadata.discovery).some(
          (key) => !["openApiPath", "contractVersion"].includes(key),
        ) ||
        (metadata.discovery.openApiPath !== undefined &&
          (!this.isString(metadata.discovery.openApiPath, 512) ||
            !metadata.discovery.openApiPath.startsWith("/"))) ||
        (metadata.discovery.contractVersion !== undefined &&
          (!Number.isInteger(metadata.discovery.contractVersion) ||
            metadata.discovery.contractVersion < 1)))
    )
      return false;
    if (
      metadata.uiComposition !== undefined &&
      (!metadata.roles ||
        !metadata.roles.includes("UI_COMPOSITION_PROVIDER") ||
        !metadata.uiComposition ||
        typeof metadata.uiComposition !== "object" ||
        Array.isArray(metadata.uiComposition) ||
        Object.keys(metadata.uiComposition).some(
          (key) =>
            !["site", "catalog", "defaultPage", "fallbackMode"].includes(key),
        ) ||
        !["site", "catalog", "defaultPage"].every((key) =>
          this.isString(metadata.uiComposition[key]),
        ) ||
        metadata.uiComposition.fallbackMode !== "STATIC_RECOVERY_SHELL")
    )
      return false;
    if (
      metadata.contractVersion !== undefined &&
      metadata.minimumClientContractVersion !== undefined &&
      metadata.minimumClientContractVersion > metadata.contractVersion
    )
      return false;
    return (
      (metadata.navigation === undefined ||
        this.validateNavigation(metadata.navigation)) &&
      (metadata.documentation === undefined ||
        this.validateDocumentation(metadata.documentation))
    );
  },
  /** Validates one module registration against the bounded API contract. */
  validateRegistration: function (registration) {
    if (
      !registration ||
      typeof registration !== "object" ||
      Array.isArray(registration)
    )
      return false;
    let allowed = [
      "moduleName",
      "displayName",
      "parentModule",
      "canonicalIdentity",
      "instanceId",
      "version",
      "moduleKind",
      "capabilities",
      "clientCallable",
      "endpoint",
      "healthPath",
      "leaseTtlMs",
      "runtime",
      "backoffice",
    ];
    return (
      !Object.keys(registration).some((key) => !allowed.includes(key)) &&
      contracts.moduleName.pattern &&
      new RegExp(contracts.moduleName.pattern).test(
        registration.moduleName || "",
      ) &&
      this.isString(registration.displayName, 160) &&
      (registration.parentModule === undefined ||
        (registration.parentModule !== registration.moduleName &&
          new RegExp(contracts.moduleName.pattern).test(
            registration.parentModule,
          ))) &&
      this.isString(registration.canonicalIdentity, 2048) &&
      registration.canonicalIdentity
        .split("/")
        .every((segment) =>
          new RegExp(contracts.moduleName.pattern).test(segment),
        ) &&
      registration.canonicalIdentity.split("/").slice(-1)[0] ===
        registration.moduleName &&
      this.isString(registration.instanceId, 512) &&
      typeof registration.clientCallable === "boolean" &&
      (registration.healthPath === undefined ||
        (this.isString(registration.healthPath, 512) &&
          registration.healthPath.startsWith("/") &&
          !registration.healthPath.startsWith("//"))) &&
      (registration.capabilities === undefined ||
        this.isStringList(registration.capabilities, 256)) &&
      (registration.leaseTtlMs === undefined ||
        (Number.isInteger(registration.leaseTtlMs) &&
          registration.leaseTtlMs >= 1000)) &&
      (registration.runtime === undefined ||
        (registration.runtime &&
          typeof registration.runtime === "object" &&
          !Object.keys(registration.runtime).some(
            (key) => !["router", "publish", "web"].includes(key),
          ) &&
          Object.keys(registration.runtime).every(
            (key) => typeof registration.runtime[key] === "boolean",
          ))) &&
      this.validateBackofficeMetadata(registration.backoffice)
    );
  },
  /** Validates one bounded runtime registration batch and its stable instance identity. */
  validateRegistrationBatch: function (batch, limit) {
    if (
      !batch ||
      !this.isString(batch.instanceId, 512) ||
      !Array.isArray(batch.registrations) ||
      batch.registrations.length === 0 ||
      batch.registrations.length > Number(limit || 512)
    )
      return false;
    let allowed = [
      "instanceId",
      "environment",
      "server",
      "node",
      "registrations",
    ];
    let moduleNames = batch.registrations.map(
      (registration) => registration.moduleName,
    );
    return (
      !Object.keys(batch).some((key) => !allowed.includes(key)) &&
      (batch.environment === undefined || this.isString(batch.environment)) &&
      (batch.server === undefined || this.isString(batch.server)) &&
      (batch.node === undefined ||
        batch.node === null ||
        this.isString(batch.node)) &&
      new Set(moduleNames).size === moduleNames.length &&
      batch.registrations.every(
        (registration) =>
          registration.instanceId === batch.instanceId &&
          this.validateRegistration(registration),
      )
    );
  },
};
