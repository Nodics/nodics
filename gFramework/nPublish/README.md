# nPublish

`nPublish` provides framework publishing support for runtime/module activation patterns. It is the place for generic publish-time contracts, schemas, routes, and pipeline hooks that support publishable module variants.

Use this module for publish capability behavior that is not specific to one provider or domain. Variant modules such as `vDatabase` or `vMongodb` should contain variant wiring, not duplicated publish infrastructure.

Publishing behavior must remain source-of-truth driven, auditable, rollback-aware, and safe for layered overrides across environment, server, node, tenant, and customer layers.

Versioned persistence is currently provided through variant modules such as
`vDatabase`, `vMongodb`, and `vService`. The broader business lifecycle for
staged data, validation, approval, publish activation, online visibility, and
rollback must be defined as a governed publish contract before a project treats
it as complete runtime behavior.

## Capability Status

The module currently provides:

- a standard framework module boundary for publish contracts;
- layered configuration files;
- router, schema, pipeline, utility, enum, and status extension slots;
- common and environment-local smoke tests;
- generated LLM context.

It does not yet implement the full business publish lifecycle by itself. Versioned storage support lives in variant modules, while project/business publishing rules must be added through owning business modules or future framework publish services.

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

## What To Avoid

Avoid:

- treating the current scaffold as a complete publish engine;
- duplicating versioned database behavior already owned by `vDatabase` or provider variants;
- putting one project's content/product approval rules into the framework module;
- making publish activation non-auditable or non-revertible;
- changing generated artifacts manually.
