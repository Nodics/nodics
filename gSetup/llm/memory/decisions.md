# Nodics Decision Memory

This file records durable architecture decisions for future developer and AI sessions.

## Enterprise Architecture And Quality Prompt

The LLM enablement pack includes `gSetup/llm/prompts/enterprise-architecture-quality-prompt.md` for significant Nodics design, implementation, security, documentation, generated artifact, and testing work.

This prompt consolidates broad enterprise architecture and quality-engineering guidance into Nodics-specific rules for module ownership, overrideability, generated artifacts, schema hierarchy, documentation, security, runtime governance, diagnostics, access control, and test strategy.

Future AI sessions should use it with the base Nodics prompt whenever the work affects platform behavior, customer customization paths, runtime governance, or enterprise-quality expectations.

Root `AGENTS.md` now makes this posture mandatory for significant work. AI tools and human technical leaders should act with enterprise architecture, solution architecture, software architecture, principal engineering, quality engineering, AI-tool, and Nodics framework expertise; challenge assumptions; identify module boundaries, ownership, coupling risks, security and observability impact, scalability path, deployment impact, testing strategy, and AI/developer guidance impact; and avoid generic recommendations.

## Enterprise Platform Positioning

Nodics is an enterprise application platform and application factory, not a lightweight Node.js API framework.

The system must preserve modular capability architecture, layered generation, layered configuration, multi-tenancy, runtime behavior override, hooks/events/interceptors/pipelines, schema-driven models/APIs, import/export, monolithic or distributed topology, and admin-driven configuration.

## Layered Customization

Any customer project should customize Nodics by adding later-loaded modules, not by editing out-of-the-box framework modules.

Schemas, services, routers, pipelines, data, tests, configuration, and runtime behavior must be overrideable through module hierarchy.

## Mandatory Change Acceptance Contract

Every modification and every new source file must follow the Nodics patterns,
remain replaceable through the effective framework/project/environment/server/node
hierarchy, and ship with appropriate tests. Every new or changed extension point
requires an override/customization test proving that a later-loaded customer
project module can change effective behavior without modifying out-of-the-box
Nodics code. A customization path that is absent, undocumented, or untested
means the change is not complete.

## Progressive Change Gates

Normal development uses the compact `daily-change-checklist.md` once per coherent
change slice. The full `change-gate-contract.md` runs against the accumulated
diff at commit, merge/release, and periodic platform-audit gates. This preserves
strict ownership, customization, maintainability, and verification requirements
without repeatedly loading or restating the complete architecture pack.

## Backend/API First

Nodics is backend/API-first. The admin/backoffice/control plane should be implemented as a client of backend APIs. Backend governance APIs are the platform contract.

## Generated Artifact Rule

Generated artifacts are recreated by build and removed by clean. Source definitions live in modules.

Schema and router level generated tests must be regenerated when schema/router definitions change.

## Cache Layer Contract

Nodics provides two first-class cache layers that must be designed, reviewed,
tested, and documented together:

- Router/API-response cache lives in the request/router pipeline and speeds full
  controller responses for cacheable routes. It must preserve the standard
  response envelope and key entries by resolved tenant, enterprise, route,
  method/body where applicable, and governed principal/access context.
- DAO/schema-item cache lives behind the database/model get pipeline and speeds
  schema read results. It must key entries by schema, tenant, query, search
  options, and read options, and cached reads must still pass runtime
  schema/property access policies before returning data.

Both layers share the same layered cache channel and adapter contract. Save,
update, and remove pipelines must invalidate both router/API-response cache and
DAO/schema-item cache through `DefaultCacheService.invalidateResource`, not by
hardcoding an engine or channel. Any cache change must verify tenant isolation,
principal/security isolation where applicable, TTL semantics, response
envelopes, invalidation, Local/Redis adapter compliance, and later-module
overrideability.

Cache diagnostics belong at the shared cache orchestration layer by default, not
inside one adapter only. Diagnostics must be lightweight, non-sensitive,
filterable by module, tenant, channel, and operation, and overrideable or
forwardable by later project modules without changing the Local or Redis adapter
contracts.

Cache benchmarks in core should be deterministic path contracts first: prove
router/API-response cache hits bypass controller execution and DAO/schema-item
cache hits bypass model query execution, then emit timing evidence. Avoid
machine-specific latency thresholds in the core framework; customer projects may
add heavier deployment/load benchmarks in later layers.

Any benchmark or test assumption that a company/project may reasonably tune,
such as iteration count, simulated downstream delay, payload size, or threshold
policy, must be defined in layered properties with safe framework defaults. Do
not hardcode these values in framework tests or services when they should be
customizable through project, environment, server, or node modules.

Cacheability decisions must be centralized behind an overrideable policy service
and layered properties. Router/API, DAO/schema, and search query cache write
paths should not embed payload-size, sensitive-field, binary, empty-result, or
skip-reason logic directly. Skipped cache writes must be observable and must not
fail the business request.

Every cacheability decision must include both a stable `reason` and a unique
`reasonCode` so logs, diagnostics, reports, tests, and customer governance can
match decisions without parsing message text.
Framework-owned reason codes belong in the owning module's
`src/utils/statusDefinitions.js` as `RSN_*` definitions. Layered properties
configure cache behavior and handlers; they must not become canonical code
catalogs.

Project-specific cacheability rules should be added with ordered
`cache.cacheability.policyHandlers` that point to normal layered service methods
instead of editing Nodics core or overriding the full policy service for every
business rule. Handler results may return custom `reason` and `reasonCode`
values, while core safety checks remain the default first gate.

## Testing Direction

Tests should support basic and full categories.

Basic validates platform health and important module behavior. Full adds consolidated and modular topology execution.

Tests must respect module/environment/server/node layering and dedicated testing tenant isolation.

## Import Observability

Import observability now includes import run summaries and import run history.

Recent implementation:

- `import.importRun` schema owns import run persistence metadata.
- `DefaultImportDiagnosticsService.finalizeRun()` creates final summary counters and delegates history persistence.
- `DefaultImportRunHistoryService` records and queries history through generated `DefaultImportRunService`.
- `DefaultImportRunHistoryFacade` and `DefaultImportRunHistoryController` expose control-plane operations.
- Secured routes expose `GET /run/history` and `GET /run/history/:runId`.
- Tests validate persistence, query filters, diagnostics delegation, schema visibility, controller mapping, route contracts, clean/build, generated tests, and basic suite.

This enables admin/control-plane visibility into import run id, status, data type, tenant, modules, duration, file/header counts, records handled, failures, and validation errors.

## Configuration Hierarchy

Configuration hierarchy is metadata-driven. Environment, server, and node roles
come from `package.json.nodics.kind`, parent relationships, and index ordering,
not from names, suffixes, folder depth, or project examples. Names may be
human-friendly, but behavior must be selected by metadata and layered
configuration.

`activeModules.groups` and `activeModules.modules` decide which modules run in
the current process. `servers.*` entries describe local or remote endpoint
coordinates and must not be treated as local activation. Framework code must not
hardcode sample, customer, or project-specific module names.

## Tenant Model, Data Placement, And Runtime Isolation

Nodics may keep multiple tenants active in one runtime, but tenant-sensitive
behavior must resolve tenant context explicitly from request, enterprise, token,
active-tenant registry, runtime governance, import header, or job definition.
Startup and bootstrap may use `defaultTenant`; request processing should use the
resolved active tenant and avoid silent fallback when tenant context should have
been present.

Tenant boundaries apply to persistence, configuration, cache keys, search
indexes, jobs, events, auth stamps, audit, diagnostics, import/export, and
runtime governance. Cross-tenant behavior requires an explicit governed
permission or contract.

Tenant also represents data placement. Shared infrastructure can use the
`default` tenant when the business accepts shared database, search, cache,
storage, import/export, audit, diagnostics, and governance behavior. A dedicated
tenant can point those same capabilities to private or approved infrastructure
when privacy, residency, regulatory, operational, or customer policy requires
stronger separation.

## Versioned Data And Publish Lifecycle

Versioned data is the foundation for staged, validated, approved, published, and
rollback-capable business data. `vDatabase` owns the provider-neutral versioned
schema contract, `vMongodb` owns MongoDB-specific versioned persistence, and
`vService` routes generated save/update behavior for versioned schema models.

Projects should mark publishable schemas as versioned through source schema
metadata and then add governed preview, approval, publish, visibility, rollback,
tenant-isolation, and audit contracts. Published and publishable data must stay
persisted so business users can inspect and revert prior versions.

## Module Generation

Custom project, environment, server, and node modules must be generated from
Nodics contracts, not copied from retired framework templates. The
`nCommon/templates` scaffold path is intentionally removed until guarded
contract-driven tooling exists.

New modules must declare metadata first, including runtime kind, ownership,
parent relationships, index order, active-module registration, layered
configuration, source definitions, generated artifact lifecycle, tests,
README/AGENTS/docs, and regenerated LLM context. Do not copy whole framework
modules or services to change one decision; contribute the smallest later-layer
override and prove it with a customization test.

## Modular Identity Bootstrap

Internal module-to-module token access remains secured. Human login routes may
be pre-authentication, but internal token routes require configured route
permissions and a service principal with the necessary grants.

Mandatory identity bootstrap may reconcile safe non-secret service-principal
metadata and missing mandatory groups on startup. It must not rotate, generate,
or overwrite credential values. Bootstrap must be idempotent across repeated
starts, tolerate populated reference shapes from model reads, and record audit
only when it actually reconciles state.
