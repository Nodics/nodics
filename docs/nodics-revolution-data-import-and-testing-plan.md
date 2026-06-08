# Nodics Revolution: Data Import and Testing Plan

This note records the agreed first-pass modernization plan so the data import and testing work does not lose context.

## Guiding Principles

- Treat Nodics as a configurable enterprise application platform and application factory.
- Preserve capabilities; modernize implementation, validation, diagnostics, and safety.
- Do not flatten layered module, environment, server, node, tenant, or data/test hierarchy.
- Environment-specific sample data belongs in the active environment modules' own data folders.
- Data required only by a module belongs under that module, even if the schema is owned by another capability module.
- Do not move module-specific cron jobs, indexers, workflow definitions, validators, or sample data into a central module just because the target schema lives there.
- Active modules should decide which module-owned data is imported; this avoids unnecessary records when optional modules are inactive.
- Preserve layered override behavior: project/environment/client modules can override base services, facades, controllers, routers, pipelines, configuration, and data definitions by load order.
- Diagnostics must be additive and metadata-driven so custom modules can override behavior without changing Nodics framework code.
- Testing must cover both supported deployment shapes:
  - one consolidated application running all selected modules
  - modular/microservice-style startup where modules run as separate applications and communicate with each other

## Data Import Work

### 1. Correctness Fixes

- Fix system data import request validation so missing, non-array, or empty module lists are rejected safely.
- Confirm and fix init-required flag handling in profile module startup.
- Review `DefaultProfileService.isInitRequired()` against the MongoDB connection handler behavior and correct any inverted logic.
- Keep data path typo fixes, such as `schema2Workflow`.
- Keep CSV parser option fallback fix so parser options remain objects.

### 2. Import Diagnostics

- Add a generated import run id for each import execution.
- Track import type: `init`, `core`, `sample`, `local`, or `remote`.
- Track requested tenant, active tenants, modules, and recursive module expansion.
- Track discovered headers, enabled headers, disabled headers, and duplicate/conflicting header names.
- Track discovered data files, files matched to headers, and unmatched files.
- Track start time, finish time, status, and duration.

### 3. Import Result Summary

- Summarize files processed.
- Summarize records read.
- Summarize records finalized into temp import files.
- Summarize records inserted or updated.
- Summarize skipped records.
- Summarize failed records and failure reasons.
- Include module, header, file, tenant, schema/index, and operation context for failures.

### 4. Validation-Only Mode

- Add a dry-run mode that validates import inputs without inserting data.
- Validate that headers exist and are enabled intentionally.
- Validate that data files match headers by prefix.
- Validate that schema or index names exist.
- Validate that target service and operation exist.
- Validate that file type processors exist for discovered files.
- Validate tenant targeting rules before processing records.

### 5. Tenant-Aware Import Behavior

- Confirm how `request.tenant` overrides header `tenants`.
- Confirm how header-level `tenants` behaves when no request tenant is provided.
- Document default tenant bootstrap separately from enterprise tenant bootstrap.
- Verify tenant-specific initialization does not contaminate real environment data when running test tenants.

### 6. Module-Owned Data Behavior

- Preserve module-owned data boundaries.
- A module may define data for schemas owned by another module when that data is required only by the defining module.
- Example: cron job definitions required only by an optional feature module should stay under that feature module, not under the global cron job capability module.
- Import should include that data only when the owning module is active.
- Diagnostics should report both the owning module and the target schema/module so this behavior is visible.

### 7. Environment-Specific Sample Data

- Preserve the current rule: sample data is loaded from active modules.
- For environment-specific sample data, place sample files in environment modules.
- Add validation/tests proving environment modules can contribute `data/sample` files.
- Avoid adding nested `data/sample/env/...` conventions unless a future requirement needs it.

### 8. Governance Later

- Add import history storage.
- Add file checksum/version tracking.
- Prevent accidental duplicate imports where the operation is not idempotent.
- Add controlled retry support.
- Add rollback hooks for future admin control-plane operations.

## Testing Framework Work

### 1. Test Discovery and Execution Baseline

- Re-check how `TEST.uTestPool` and `TEST.nTestPool` are populated.
- Make test loading behavior explicit and observable.
- Preserve layered loading:
  - module `test/common`
  - environment-specific tests
  - server-specific tests
  - node-specific tests
- Keep test data isolated through the dedicated testing tenant/database design.

### 2. Test Categories

- Add or formalize `basic` tests:
  - framework startup
  - module loading
  - route availability
  - internal auth token availability
  - profile availability
  - mandatory init data availability
  - inter-module communication smoke checks
- Add or formalize `full` tests:
  - module test suites
  - init/core/sample import flows
  - tenant scenarios
  - workflow behavior
  - cron behavior
  - NEMS/event behavior
  - import/export flows
  - distributed inter-module calls

### 3. Topology Coverage

- Consolidated topology:
  - start the default server, such as `kickoffLocalServer`
  - verify all selected modules run in one application
  - verify internal service calls resolve locally
- Modular/microservice topology:
  - start profile first
  - start NEMS before modules depending on events
  - start cron after profile and NEMS where required
  - start business/content/workflow/data modules separately
  - verify inter-module API/event communication works across process boundaries
- Testing commands should make topology explicit so failures can be tied to the runtime shape.

### 4. Data Import Test Integration

- Basic tests should verify mandatory init data can bootstrap the system.
- Full tests should verify init, core, sample, local, and remote import paths where applicable.
- Sample data tests should include environment-module sample data.
- Tests should verify tenant isolation and avoid polluting real environment data.

### 5. Reporting

- Report suite count, test count, pass/fail/skip counts.
- Report modules, environment, server, node, tenant, and topology under test.
- Report startup order for modular topology.
- Report failed module/server/node context.
- Report import run summaries when tests exercise data import.

### 6. Command Surface

- Add or formalize commands similar to:
  - `npm run test:basic`
  - `npm run test:full`
  - `npm run test:basic:consolidated`
  - `npm run test:basic:modular`
  - `npm run test:full:consolidated`
  - `npm run test:full:modular`
  - `npm run test:import`

## Suggested Execution Order

1. Finish low-risk data import correctness fixes.
2. Add import diagnostics and summary objects.
3. Add data import validation-only mode.
4. Add focused data import tests.
5. Fix and formalize test discovery/execution.
6. Add basic consolidated topology tests.
7. Add basic modular topology tests.
8. Expand into full tests for import, workflow, cron, NEMS, tenants, and distributed communication.
