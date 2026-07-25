# database Agent Contract

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the root Nodics AI contract: `../../../AGENTS.md`.
- Follow global AI/development guidance: `../../../gSetup/llm/README.md`.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Module Work Rules

- Treat this directory as a layered Nodics module boundary when it contains `package.json`.
- Keep capabilities stable and make implementations replaceable through the module hierarchy.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Put configurable behavior in layered configuration, schemas, routers, services, pipelines, data, and runtime governance.
- Update `README.md`, permanent `docs/`, `llm/` guidance, generated context, and tests whenever behavior or extension contracts change.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.
- Use `DefaultDatabaseTransactionService` for multi-record atomic work. Business
  modules receive only an opaque transaction context and must pass it through
  generated service requests; they must not import a database driver.
- Transaction contexts are module-, tenant-, database-, and callback-scoped.
  Reject missing capabilities, cross-database reuse, expired contexts, and
  adapters that cannot truthfully guarantee atomic commit and abort.
- Only schemas that explicitly declare `transaction.enabled: true` and
  `transaction.sideEffects: 'none'` may receive a transaction context. Their
  cache and event side effects must be disabled so no generated pipeline effect
  can escape before commit.
- Do not describe ordered writes, compensation, or record-level CAS as a
  multi-record transaction.
- Declare target-delete protection on the authoritative source `refSchema`
  relationship with `onTargetDelete: 'RESTRICT'`; never create a separate
  reference registry for Workbench or another client.
- Preserve fail-closed reference validation, tenant boundaries, bounded
  inspection, stable conflict semantics, and the shared generated remove
  pipeline when overriding reference-integrity behavior.
- Do not infer or implement cascading deletion from relationship metadata.
  Cascade behavior requires a module-owned business operation and explicit
  transaction or compensation rules.
- Keep every eligible model discoverable with generated Search, Read, Create,
  Update, and Delete operations by default, filtered through effective schema
  access. Treat `backoffice.enabled: false` as an explicit exclusion and use
  an explicit operations list to narrow sensitive models.
- Put reusable schema access and ownership defaults in layered
  `schemaPolicies` and reference stable capability names from schemas. Preserve
  final `accessGroups` and `ownership` as the sole runtime enforcement
  contract; named policies are composition inputs only.
- Use keyed booleans for extensible ownership group/type collections. Later
  layers add entries with `true` and remove inherited entries with `false`.
- Schema Workbench bulk actions must be schema-explicit, bounded, separately
  permissioned, idempotency-keyed, and delegated to generated CRUD or an
  owning domain service. Do not create a second mutation path.
- Derive relationship, delete-impact, concurrency, and aggregate metadata from
  effective schemas. Aggregate execution only delegates to the declared owning
  service; same-database atomic work uses `DefaultDatabaseTransactionService`
  and cross-module consistency uses an owning Workflow or saga.
