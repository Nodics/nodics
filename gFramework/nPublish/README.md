# nPublish

`nPublish` provides framework publishing support for runtime/module activation patterns. It is the place for generic publish-time contracts, schemas, routes, and pipeline hooks that support publishable module variants.

Use this module for publish capability behavior that is not specific to one provider or domain. Variant modules such as `vDatabase` or `vMongodb` should contain variant wiring, not duplicated publish infrastructure.

Publishing behavior must remain source-of-truth driven, auditable, rollback-aware, and safe for layered overrides across environment, server, node, tenant, and customer layers.

Versioned persistence is provided through variant modules such as `vDatabase`,
`vMongodb`, and `vService`. `nPublish` governs the provider-neutral business
lifecycle for staged data, validation, approval, activation, online visibility,
and rollback.

## Capability Status

The module now provides:

- authoritative generic `publicationRequest` contract with an atomically stored
  transition journal and a query-oriented `publicationAudit` projection;
- governed Staged, validation, approval, activation, Online, failure, and rollback states;
- layered transition, dependency-bound, event, domain-adapter, version-provider,
  and workflow-provider configuration;
- executable lifecycle orchestration for create, validate, approval, activation,
  failure, and rollback flows;
- optimistic revision enforcement, idempotent terminal replays, sanitized audit
  evidence, bounded dependencies, and fail-fast provider resolution;
- a generated-service-backed repository extension point that atomically applies
  state, optimistic revision, and immutable transition evidence in one CAS write;
- bounded, tenant-scoped, idempotent reconciliation of missing audit projections
  from authoritative publication journals;
- layered configuration files;
- router, schema, pipeline, utility, enum, and status extension slots;
- common and environment-local smoke tests;
- generated LLM context.

CMS now supplies the first executable domain adapter and target deployment
implementation. Additional domains remain extension work. Versioned storage remains owned by provider variants;
workflow remains owned by `gCore/workflow`; business validation and dependency
rules remain in owning domain adapters. No business module may introduce a
parallel publication state machine.

The default deployment contract uses two independent runtime authorities:

- Staged activates publish/version variants and stores editable immutable versions;
- Online does not activate version variants and stores the deployed target form;
- an approved workflow invokes the domain adapter, which deploys through an
  authenticated target transport rather than writing the Online database;
- each publishable domain, including CMS or a product catalog, contributes its
  own dependency resolver, validation, manifest/export shape, and target adapter.

## Publish Lifecycle Direction

A complete publish lifecycle should cover:

- staged data creation;
- validation;
- approval request;
- approval decision;
- activation;
- online visibility;
- persisted published version;
- rollback to a previous version;
- audit history;
- tenant isolation;
- export/search/cache refresh where required.

The source of truth must remain module definitions, schemas, services, pipelines, runtime governance, and persisted version records. Business users should be able to publish and revert data without modifying framework source files.

## Extension Path

Projects may extend publish behavior by:

- using `vDatabase`, `vMongodb`, or `vService` where versioned behavior is required;
- adding business-owned publish services and pipelines;
- adding approval/activation/rollback models where required;
- connecting publish events to search/cache/export refresh;
- adding tenant-aware tests for stage, validate, approve, publish, rollback, and diagnostics.

Keep provider-specific version storage in provider variants. Keep business-specific catalog/content/product publish rules in the owning business module.

## Tests

Run:

```bash
npm run structure:audit -- --fail
npm run quality:docs
```

Add focused tests before this module owns executable publish behavior beyond scaffold extension slots.

The focused orchestration contract can be run with:

```bash
node gFramework/nPublish/test/publicationLifecycleService.test.js
node gFramework/nPublish/test/publicationAtomicAuditContract.test.js
node gFramework/nPublish/test/publicationAuditReconciliationService.test.js
```

## What To Avoid

Avoid:

- treating the generic lifecycle as a domain dependency resolver or target adapter;
- duplicating versioned database behavior already owned by `vDatabase` or provider variants;
- putting one project's content/product approval rules into the framework module;
- making publish activation non-auditable or non-revertible;
- changing generated artifacts manually.
