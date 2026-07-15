# nExport Module

`nExport` is the data export module family under `nData`. It defines the export capability boundary, the shared executable export engine, and the format-specific adapter modules used to move governed Nodics data out of the platform.

Use this module family when implementing outbound data flows such as catalog feeds, tenant-specific content exports, reporting extracts, integration handoff files, or Data-as-a-Service delivery contracts. Keep export behavior definition-driven, tenant-aware, auditable, and safe for operational use.

## Module Family

The export family is split by responsibility:

- `export` owns shared export request handling, facade/service delegation, access-policy application, and cross-format lifecycle contracts.
- `csvExport` owns CSV-specific formatting and adapter behavior.
- `excelExport` owns workbook, sheet, and spreadsheet-oriented output behavior.
- `jsonExport` owns JSON serialization and payload-shape behavior.
- `jsExport` owns JavaScript-oriented export behavior where a trusted active module needs executable transformation or rendering logic.

Format modules currently provide standard Nodics module structure and extension points. Production exporters must be completed through active framework/provider/project modules that implement the published export service contract and prove behavior with tests.

## Capability

`nExport` should own:

- export definitions and outbound data contracts;
- query and selection contracts;
- formatter and writer contracts;
- destination and delivery/provider integration points;
- export access-policy enforcement;
- export diagnostics, audit, retry, and failure behavior where applicable;
- tests for default behavior and project-level overrides.

Exports must be driven by active module definitions and layered configuration. A customer project should be able to decide what data is exported, which tenant owns it, what shape the target system expects, and which delivery policy applies without editing out-of-the-box Nodics code.

## Runtime Flow

A typical export flow should follow this shape:

1. A route, scheduled job, integration process, or internal service requests an export.
2. The request selects a governed export definition, format, tenant context, query, and destination policy.
3. The shared export engine validates the request and delegates to the active export service.
4. Schema/property access policy is applied before data leaves the platform.
5. The selected format adapter renders CSV, Excel, JSON, JavaScript-driven output, or another project-owned format.
6. Delivery behavior writes to the governed destination, records diagnostics, and exposes traceable results.

The current base `DataExportService.export` intentionally rejects until an active module provides implementation behavior. This prevents accidental data leakage through a partially configured exporter.

## Configuration

Export configuration belongs in layered `properties.js` files or secret-governed runtime configuration. Good export configuration includes:

- export definition name;
- source schema or service;
- tenant scope;
- allowed filters;
- format;
- formatter options;
- destination provider;
- delivery path or target alias;
- retry and timeout policy;
- access group or permission requirements.

Do not hardcode customer destinations, credentials, file paths, tenant mappings, or target-system contracts in framework source files.

## Extension Contract

Projects add formats, destinations, filters, providers, and delivery policies through later active modules and layered configuration.

When adding a new export capability:

- keep shared orchestration in `nData/nExport/export`;
- keep format-only behavior in the relevant format module;
- create a new format/provider module when behavior does not belong to an existing format;
- implement services under `src/service` using Nodics `module.exports` service style;
- keep credentials and external endpoints in governed configuration;
- add tests for request normalization, access policy, tenant isolation, rendering, delivery, and failure behavior;
- regenerate generated context after changing definitions or contracts.

## What To Avoid

Avoid:

- exporting data before schema/property access policy is applied;
- allowing requests to provide arbitrary external URLs, file paths, or credentials;
- mixing import behavior into export modules;
- placing format-specific rendering in the shared export engine;
- hand-editing generated export artifacts;
- treating the current format modules as completed production writers without implementation and release tests.
