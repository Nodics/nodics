# dataCore

`dataCore` owns shared data movement contracts used by import and export
modules.

Use this module for reusable data abstractions that are not specific to import
or export. Capability-specific behavior should stay in `nImport`, `nExport`, or
project modules.

## Ownership

`dataCore` may own:

- shared data processing contracts;
- reusable validation or transformation helpers;
- common diagnostics and result shapes;
- shared test utilities for data movement.

## Extension Contract

Keep shared contracts provider-neutral and tenant-aware. Project-specific data
formats, storage providers, credentials, and mappings belong in later modules or
configuration.

## Capability

`dataCore` provides:

- shared import/export interceptor cache management;
- shared import/export validator cache management;
- schema data handler processing;
- processor execution before schema data handling;
- interceptor execution;
- validator execution;
- data filter pipeline execution;
- per-record import dispatch;
- optional finalized data file writing;
- data writer services and file writer process services;
- finalizer process services;
- event listener extension slots.

It is the common processing layer used by import/export capabilities. It should not know about one customer's file format, storage provider, credentials, or target system.

## Runtime Flow

1. A data movement request reaches import/export orchestration.
2. The header identifies target schema, module, processors, validators, interceptors, and processing pipeline.
3. `dataCore` applies processors if configured.
4. Import/export interceptors are resolved through data configuration.
5. Validators run for the tenant and schema.
6. A process pipeline filters or transforms the model set.
7. Models are dispatched into persistence or written as finalized files depending on header options.
8. Diagnostics can record dispatch, success, failure, and finalization counts.

## Extension Path

Projects extend `dataCore` by:

- adding processors;
- adding import/export interceptors;
- adding import/export validators;
- adding process pipelines;
- overriding data writer behavior;
- adding focused tests for transformation, validation, failure handling, tenant isolation, and diagnostics.

Format-specific readers belong in import/export format modules. Source/destination-specific integration belongs in project/provider modules.

## Tests

Run:

```bash
npm run test:import
npm run quality:docs
```

Add focused tests whenever shared data processing, validator/interceptor refresh, finalization, or writer behavior changes.

## What To Avoid

Avoid:

- putting CSV, Excel, JSON, JavaScript, SFTP, object storage, or customer API behavior into `dataCore`;
- bypassing validators or interceptors during import/export;
- processing tenant data without tenant context;
- hiding diagnostics failures;
- hardcoding customer mappings or storage paths.
