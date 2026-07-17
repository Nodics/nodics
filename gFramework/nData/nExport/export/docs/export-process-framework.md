# Export Process Framework

`export` owns the shared outbound data contract for Nodics. It is the place
where export requests are normalized, governed, and delegated to an active
implementation. Format modules and provider/project modules plug into this
contract; they do not replace it with private shortcuts.

## Current Runtime Contract

The current framework implementation is intentionally fail-closed.

Implemented today:

- `DataExportController.export` normalizes HTTP body and query parameters into
  `request.export`.
- `DataExportFacade.export` delegates to `SERVICE.DataExportService.export`.
- `DataExportService.export` rejects with a clear not-configured Nodics error
  until a later active module provides real export behavior.
- `DataExportService.applyExportAccessPolicies` delegates to
  `DefaultSchemaReadAccessPolicyService.applyExportPolicies` when that service
  is active.
- Export access-policy filtering runs on export-safe model copies so a policy
  or formatter cannot mutate the selected source models in memory.
- `/system/export` is exposed through `nSystem` as a secured control-plane route
  for GET and POST, but the default service still rejects until implemented.

This is the correct default for an enterprise platform. Export is a data
egress capability, so the framework must not leak data because a generic module
is active.

## Target Architecture

A production exporter should follow this lifecycle:

1. Resolve a governed export definition by name.
2. Resolve tenant, authenticated principal, access groups, and route
   permission.
3. Validate allowed filters, format, destination alias, and delivery policy.
4. Load source data through generated schema services or owning domain
   services.
5. Apply schema/property export access policies before rendering.
6. Apply export processors, validators, and interceptors.
7. Render data through a format module such as JSON, CSV, Excel, JavaScript, or
   a project-owned format module.
8. Deliver output only to a governed destination alias.
9. Record diagnostics, counts, destination metadata, checksum/fingerprint,
   duration, failure reason, and retry information.
10. Return a sanitized export result to the caller.

Do not allow a request to provide arbitrary service names, filesystem paths,
URLs, credentials, bucket names, queue names, or target-system contracts.

## Module Boundaries

The shared `export` module owns:

- request normalization;
- fail-closed default behavior;
- access-policy delegation;
- export-safe copy behavior;
- shared lifecycle contracts;
- tests for default framework invariants.

Format modules own rendering only:

- `jsonExport`: JSON payload shape and serialization;
- `csvExport`: CSV column ordering, delimiter, escaping, and record rendering;
- `excelExport`: workbook, worksheet, header, and cell rendering;
- `jsExport`: trusted active-module JavaScript rendering or transformation.

Project or provider modules own:

- export definitions;
- target-system contracts;
- field mapping and transformation;
- delivery providers such as filesystem, SFTP, object storage, API push,
  message publication, or enterprise gateways;
- credentials, endpoints, destination aliases, and retry policy;
- live-provider release tests.

## Security Contract

Export must be treated as controlled data egress.

Every implementation must define:

- action-specific route permission;
- tenant scope;
- authenticated principal and access groups;
- allowed source schema/service;
- allowed filters and maximum result/window size;
- export access-policy behavior;
- safe destination aliases;
- sanitized diagnostics;
- audit/run history;
- retry and failure handling.

Broad access such as `userGroup` is not sufficient for a production export
operation. It is acceptable only while the default service fails closed.

## Testing Strategy

Framework export tests must prove:

- request normalization for GET and POST;
- default fail-closed behavior;
- access-policy delegation;
- selected models are not mutated by export policy filtering;
- route metadata remains secured.

Production export implementations must add:

- positive export behavior;
- missing/invalid export definition behavior;
- unauthorized user and tenant-isolation behavior;
- forbidden filter, format, and destination behavior;
- access-policy redaction behavior;
- rendering tests for the selected format;
- delivery-provider contract tests;
- sanitized error/diagnostic tests;
- retry or resumability tests when supported;
- override/customization tests proving a later module can change export
  behavior without editing Nodics framework code.

## Backlog

The framework still needs a complete governed export engine before export is a
production data-egress feature. Required future work includes:

- source-backed export definitions;
- action-specific route permissions;
- trusted operation and destination allowlists;
- export diagnostics and run history;
- format renderer service contracts;
- delivery provider contracts;
- checksum/fingerprint support;
- duplicate-run or idempotency support where required;
- retry and failure lifecycle;
- DaaS examples for product catalog delivery to multiple target systems.
