# Example: Adding A New Nodics Feature

This example shows the expected thinking process for adding a new feature.

## Scenario

Add a control-plane capability that lets admins view import run history.

## Correct Ownership

- Owning module: `gFramework/nData/nImport/import`
- Schema namespace: `import.importRun`
- Handwritten behavior: import history service/facade/controller
- Generated persistence: generated `DefaultImportRunService`
- Router: import module router
- Tests: import module tests

## Correct Layering

1. Add source schema `import.importRun`.
2. Let build generate model/service/API/test artifacts.
3. Add `DefaultImportRunHistoryService` as an overrideable handwritten service.
4. Let diagnostics delegate to the history service.
5. Add facade/controller for API boundary.
6. Add secured routes.
7. Add module-owned tests.
8. Run clean/build and generated/basic tests.

## Why This Is Correct

The import engine does not directly know database details. It delegates to a service contract.

A project can override `DefaultImportRunHistoryService` to:

- redact failure details
- change retention
- publish history to Kafka
- store history in Elasticsearch
- enrich records with custom metadata
- disable persistence for selected environments

No core import processing code needs to be changed for those customizations.

## Verification

Expected commands:

```bash
npm run test:import
npm run clean
npm run build
npm run test:generated
npm run test:basic
```
