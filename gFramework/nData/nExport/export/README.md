# Export Module

`export` is the executable export engine inside `nData/nExport`. It owns shared export orchestration, export access policy checks, dispatch behavior, and the framework contracts that format modules plug into.

Use this module when changing export lifecycle behavior that applies across CSV, Excel, JSON, JavaScript, or future export formats. Format-specific parsing and rendering belongs in the sibling format modules.

Export definitions should remain source-of-truth driven and tenant-aware. Generated export artifacts must be regenerated from definitions rather than edited by hand.

## Capability

The module currently contributes:

- `DataExportController.export`, which normalizes HTTP body and query data into `request.export`;
- `DataExportFacade.export`, which delegates to the active `DataExportService`;
- `DataExportService.export`, which defines the default fail-closed export contract;
- `DataExportService.applyExportAccessPolicies`, which delegates to `DefaultSchemaReadAccessPolicyService.applyExportPolicies` when that service is active;
- standard router, schema, pipeline, utility, status, enum, lifecycle, and test extension files.

The default `export` implementation rejects with a Nodics error until an active module overrides export behavior. This is intentional: an export surface must not leak data just because the module exists.

For the full engineering contract, read
[Export Process Framework](docs/export-process-framework.md).

## Runtime Flow

1. A caller invokes the export controller through a route, internal service, scheduled process, or test.
2. When an HTTP request is present, the controller copies the request body into `request.export`.
3. HTTP query parameters are preserved under `request.export.query`.
4. The facade delegates to `SERVICE.DataExportService.export`.
5. The base service rejects until a framework/provider/project module supplies governed export behavior.
6. Implemented exporters should apply schema/property access policy before rendering or delivery.
7. Export access-policy filtering must operate on export-safe model copies so source models are not mutated in memory.

## Extension Path

Projects or provider modules may override the export service through later active modules. A real implementation should:

- validate the selected export definition;
- verify tenant context, access group, and permission requirements;
- resolve source data through governed services or schemas;
- call `applyExportAccessPolicies` before data is serialized;
- delegate format rendering to CSV, Excel, JSON, JavaScript, or custom format services;
- write only to governed destination aliases;
- return a traceable result with status, counts, destination metadata, and diagnostics.

Keep delivery-provider details in their own services. Keep format rendering in format modules. Keep request normalization and cross-format policy in this module.

## Tests

Focused behavior is covered by `test/dataExportCapabilityBehavior.test.js`, which verifies HTTP request normalization, the default fail-closed service behavior, access-policy delegation, and export-safe model copy handling.

Run:

```bash
node gFramework/nData/nExport/export/test/dataExportCapabilityBehavior.test.js
npm run test:export
npm run quality:docs
```

Project implementations should add tests for successful export, access-policy filtering, tenant isolation, destination validation, retry behavior, and sanitized failure reporting.

## What To Avoid

Avoid:

- enabling a public export route before access control and schema/property export policy are proven;
- accepting arbitrary request-supplied URLs, credentials, or filesystem paths;
- putting CSV, Excel, JSON, or JavaScript rendering logic in the shared engine;
- bypassing the facade/service override path;
- returning raw internal errors or credentials in export diagnostics.
