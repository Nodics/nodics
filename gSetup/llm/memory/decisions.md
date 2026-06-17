# Nodics Decision Memory

This file records durable architecture decisions for future developer and AI sessions.

## Enterprise Platform Positioning

Nodics is an enterprise application platform and application factory, not a lightweight Node.js API framework.

The system must preserve modular capability architecture, layered generation, layered configuration, multi-tenancy, runtime behavior override, hooks/events/interceptors/pipelines, schema-driven models/APIs, import/export, monolithic or distributed topology, and admin-driven configuration.

## Layered Customization

Any customer project should customize Nodics by adding later-loaded modules, not by editing out-of-the-box framework modules.

Schemas, services, routers, pipelines, data, tests, configuration, and runtime behavior must be overrideable through module hierarchy.

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
