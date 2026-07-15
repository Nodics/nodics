# nImport

`nImport` owns data import orchestration and import-specific extension points.

Import behavior must remain definition-driven, tenant-aware, auditable, and overrideable by project modules.

## Module Family

The import family is split by responsibility:

- `import` owns init, core, sample, local, and remote import orchestration; tenant-safe dispatch; diagnostics; run history; validation-only execution; remote staging governance; and access-policy enforcement.
- `csvImport` owns CSV file parsing and CSV-specific processing.
- `excelImport` owns spreadsheet parsing and workbook/sheet-specific processing.
- `jsonImport` owns JSON file parsing and JSON-specific processing.
- `jsImport` owns trusted active-module JavaScript data definitions and must not execute request-supplied code.

## Ownership

`nImport` should own:

- import definitions;
- parser and reader contracts;
- processor and validation steps;
- mapping from external input into Nodics models;
- import diagnostics, audit, retry, and rollback behavior where applicable;
- tests for default imports and project-level overrides.

## Extension Contract

Projects add file formats, providers, mappings, processors, and validation
through later modules and configuration. Do not hardcode customer formats,
storage locations, credentials, or tenant mappings in framework import code.

## Runtime Flow

1. A startup process, API request, CronJob, local file trigger, or governed remote adapter starts an import.
2. The selected import type resolves active module headers and data sources.
3. Tenant precedence is applied so request tenant can narrow but not broaden header scope.
4. File/data processors convert source input into model arrays.
5. `dataCore` applies processors, import interceptors, and validators.
6. Models are saved through generated schema services and pipelines.
7. Import diagnostics and run history record counts, checksums, fingerprints, retry metadata, failures, and rollback evidence.
8. Finalized import events can dispatch follow-up behavior such as search indexing or business processing.

## Feeding Patterns

Nodics supports two primary ingestion patterns:

- Push-based import: an external system calls governed import APIs and sends a payload or approved input reference.
- Scheduled file import: external systems or business processes place files in configured import locations, and CronJob or another governed trigger starts the import.

Direct remote pull is an internal staged adapter lifecycle. It remains gated until a project/provider module owns the external source contract and release tests.

## Configuration

Import configuration belongs in layered properties, module-owned headers, active module data directories, and governed runtime/secrets. A production import should define:

- import type;
- source modules;
- header data type;
- tenant scope;
- schema target;
- operation;
- processor list;
- interceptor and validator contracts;
- retry and duplicate protection;
- diagnostics and rollback policy;
- file count, size, extension, checksum, and cleanup policy where files are involved.

## Tests

Run:

```bash
npm run test:import
node gFramework/nData/nImport/import/test/importGovernanceLifecycleContract.test.js
node gFramework/nData/nImport/import/test/remoteImportTransportGovernance.test.js
npm run quality:docs
```

Format-specific tests should also be added when adding readers or processors.

## What To Avoid

Avoid:

- introducing direct persistence paths outside the governed import pipeline;
- allowing request-supplied arbitrary URLs, credentials, headers, processors, or executable code;
- broadening tenant scope from request data;
- placing customer-specific mappings in framework source;
- skipping import run diagnostics and history;
- editing generated import artifacts manually.
