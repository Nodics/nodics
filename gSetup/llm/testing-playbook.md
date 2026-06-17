# Testing Playbook

## Testing Philosophy

Nodics tests must protect platform capabilities, layered customization, generated artifacts, tenant isolation, runtime governance, and modular deployment.

Tests should not only validate one happy path. They should prove the framework remains customizable and safe when used by future project modules.

## Basic And Full Suites

`basic` should validate core platform health:

- syntax
- configuration loading
- governance checks
- status catalog
- traceability
- headers/auth normalization
- route contracts
- generated artifacts
- system capability behavior
- import capability behavior
- profile capability behavior
- EMS capability behavior

`full` should include basic plus runtime topology checks:

- consolidated server startup
- modular/microservice startup
- inter-module API communication
- event communication when enabled
- import/data scenarios
- broader business workflows

## Consolidated And Modular Testing

Nodics supports both single-process and distributed module deployment.

When behavior crosses module boundaries, test both:

- consolidated mode: many modules in one application server.
- modular mode: profile, NEMS, cronjob, and other modules run separately and communicate over APIs/events.

Profile often needs to be available before modules that require tenant/enterprise/user context. Event-dependent modules require NEMS/EMS capability when included.

## Environment-Specific Tests

Some tests are module-generic. Some are environment/server/node-specific.

The test framework should load tests according to the active module hierarchy, environment, server, and node. Do not assume every project uses `kickoff`.

Project modules may override or replace framework tests when their behavior intentionally differs.

## Dedicated Test Tenant

Tests should use dedicated test tenant/database context where possible so test data does not pollute active environment data.

Default tenant is useful during startup. Active tenant should be used for request/customer behavior.

## Generated Tests

Schema-driven CRUD/API tests should be generated from effective schema and route definitions.

Generated tests must:

- live under generated test folders
- be removable by clean
- be recreated by build
- reflect final schema after layered overrides
- avoid destructive live operations unless explicitly marked and guarded

## Import Tests

Import tests should cover:

- initializer validation
- core/sample data catalog behavior
- format processors: JSON, CSV, Excel
- diagnostics and failure traceability
- import/export access policy enforcement
- import run summaries
- import run history persistence/query APIs

Recent import history tests prove:

- `DefaultImportRunHistoryService` persists through generated `DefaultImportRunService`
- diagnostics delegates history persistence without blocking import
- routes expose import run history through secured APIs
- generated tests include `import.importRun` after clean/build

## Workflow Tests

Workflow tests should preserve the three workflow submodule responsibilities:

- `flowSchema` owns schema-driven workflow models, services, and generated CRUD/API tests.
- `flowCore` owns workflow lifecycle behavior and service-to-pipeline contracts.
- `flowApi` owns custom workflow API routes such as carrier initialization, carrier release/update, and action processing.

Do not move schema CRUD coverage into custom `flowApi` tests. When migrating Postman workflow requests, first decide whether an endpoint is schema-generated CRUD, custom API behavior, or inactive historical behavior that needs a governed compatibility decision.

## CronJob Tests

CronJob tests should protect both the API lifecycle and the scheduler lifecycle without requiring a live scheduler for basic coverage:

- route contracts own the create/update/run/start/stop/remove/pause/resume HTTP surface.
- controller tests map route params, request bodies, and query options into facade requests.
- service tests map create/update/run to tenant job lookup plus container execution.
- lifecycle tests map start/stop/remove/pause/resume to the CronJob container.
- full/integration tests may exercise live cron execution, node ownership, events, and distributed topology when the owning modules and external dependencies are active.

Keep CronJob tests in `gCore/cronjob/test` unless a project module intentionally overrides the CronJob behavior in a later layer.

## Search Tests

Search tests should separate framework search contracts from external search-engine availability:

- route contracts own schema-name and index-name search APIs.
- controller tests map route params, request bodies, ids, index names, and indexer codes into facade requests.
- service tests map search operations to the expected pipelines without requiring Elasticsearch.
- indexer tests validate indexer lookup, target-index matching, and dispatch to `indexerInitializerPipeline`.
- full/integration tests may exercise Elasticsearch/OpenSearch connectivity, real indexing, refresh, health, delete, and distributed topology when the search module and engine are active.

Keep basic Search tests under `gFramework/nSearch/search/test`. Project modules can add their own search/indexer tests when they contribute module-owned indexes or indexers.

## Required Verification By Change Type

Schema/router/generation changes:

```bash
npm run clean
npm run build
npm run test:generated
npm run test:basic
```

Import changes:

```bash
npm run test:import
npm run test:basic
```

Runtime governance changes:

```bash
npm run test:runtime-overrides
npm run test:governance
npm run test:basic
```

Topology changes:

```bash
npm run test:topology:consolidated
npm run test:topology:modular
npm run test:full
```
