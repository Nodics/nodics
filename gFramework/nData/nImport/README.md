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

## Target Routing

Import headers route finalized models to one of two built-in target families:

- database/schema targets use `options.schemaName` and dispatch through the
  generated `Default<SchemaName>Service` operation;
- search/index targets use `options.indexName` and dispatch through the owning
  search service operation, falling back to `DefaultSearchService` when no
  index-specific service exists.

Both paths receive the resolved tenant, header user groups, query context, and
model array. Projects must extend target behavior through later module headers,
services, processors, interceptors, validators, or search providers instead of
adding direct database or search-engine calls outside the import lifecycle.

## Feeding Patterns

Nodics supports two primary ingestion patterns:

- Push-based import: an external system calls governed import APIs and sends a payload or approved input reference.
- Scheduled file import: external systems or business processes place files in configured import locations, and CronJob or another governed trigger starts the import.

Remote import is a governed staged adapter lifecycle. It is available for
project/provider modules that own an external source contract such as SFTP,
object storage, partner API file pulls, HTTPS pulls, or enterprise file
gateways. The framework does not accept arbitrary request-supplied URLs,
credentials, headers, processors, or routing definitions.

Remote import requests select a configured source name. The effective
`data.remoteImport` configuration resolves the source, transport, adapter,
tenant allowlist, module allowlist, header data type, cleanup behavior, timeout,
retry, size, extension, and checksum policy. The adapter stages data files into
an isolated server-owned path. Nodics then loads trusted headers from active
modules and runs the same finalization and processing pipelines used by local
and scheduled file imports.

A public production remote-import route remains gated until the owning project
or provider module supplies the adapter, route permission, source
configuration, tenant/module allowlists, credential handling, operational
monitoring, and guarded live integration or release tests.

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
- fail-fast behavior through `data.stopImportOnFailure`;
- finalized-record batch dispatch through `data.batchImport` or `header.options.batchImport`;
- file count, size, extension, checksum, and cleanup policy where files are involved.

For remote import, configuration must also define:

- `data.remoteImport.enabled`;
- named `sources`;
- named `transports`;
- the adapter service for each source or transport;
- source tenant and module allowlists;
- `headerDataType`, usually `core`, `init`, or `sample`;
- checksum, timeout, retry, extension, count, and size policies;
- cleanup behavior for the isolated staging folder.

Batch import is a throughput control. It groups finalized records before sending
them through the same model import pipeline and target service contract. It must
not be used as a reason to write directly to a database, search engine, file
system, or external provider outside the governed import lifecycle.

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
