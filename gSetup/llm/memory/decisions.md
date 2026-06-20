# Nodics Decision Memory

This file records durable architecture decisions for future developer and AI sessions.

## Enterprise Architecture And Quality Prompt

The LLM enablement pack includes `gSetup/llm/prompts/enterprise-architecture-quality-prompt.md` for significant Nodics design, implementation, security, documentation, generated artifact, and testing work.

This prompt consolidates broad enterprise architecture and quality-engineering guidance into Nodics-specific rules for module ownership, overrideability, generated artifacts, schema hierarchy, documentation, security, runtime governance, diagnostics, access control, and test strategy.

Future AI sessions should use it with the base Nodics prompt whenever the work affects platform behavior, customer customization paths, runtime governance, or enterprise-quality expectations.

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
