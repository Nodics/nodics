# Export Module

**Maturity: Guarded implementation.** It provides the common export boundary,
schema-workbench read path, access-policy hook, file rendering, and nMedia-backed
generated-file storage. It remains fail-closed when disabled or when required
runtime collaborators are not active.

`export` is the executable export engine inside `nData/nExport`. It owns shared export orchestration, export access policy checks, dispatch behavior, and the framework contracts that format modules plug into.

Use this module when changing export lifecycle behavior that applies across CSV, Excel, JSON, JavaScript, or future export formats. Format-specific parsing and rendering belongs in the sibling format modules.

Export definitions should remain source-of-truth driven and tenant-aware. Generated export artifacts must be regenerated from definitions rather than edited by hand.

## Capability

The module currently contributes:

- `DataExportController.export`, which normalizes HTTP body and query data into `request.export`;
- `DataExportFacade.export`, which delegates to the active `DataExportService`;
- `DataExportService.export`, which executes bounded schema exports through
  Schema Workbench and stores generated files through nMedia;
- `DataExportService.applyExportAccessPolicies`, which delegates to `DefaultSchemaReadAccessPolicyService.applyExportPolicies` when that service is active;
- standard router, schema, pipeline, utility, status, enum, lifecycle, and test extension files.

The default implementation is intentionally conservative: it accepts only
configured formats, reads data through the authorized schema workbench, applies
export policy to model copies, and stores generated files as nMedia `exportFiles`
records. It does not accept arbitrary filesystem paths, database names,
credentials, URLs, or custom destination instructions from the caller.

For the full engineering contract, read
Export Process Framework (canonical documentation: `capability.data-exchange.technical-reference`).

## Runtime Flow

1. A caller invokes the export controller through a route, internal service, scheduled process, or test.
2. When an HTTP request is present, the controller copies the request body into `request.export`.
3. HTTP query parameters are preserved under `request.export.query`.
4. The facade delegates to `SERVICE.DataExportService.export`.
5. The service resolves the schema descriptor through Schema Workbench.
6. Records are collected through bounded Workbench search pages using the
   configured maximum export size.
7. Export access-policy filtering runs against export-safe model copies so
   source models are not mutated in memory.
8. The service renders CSV or JSON and asks nMedia to create a generated media
   object under the configured export folder.
9. The response returns file name, media summary, exported count, available
   count, and truncation status.
10. When a user or integration downloads that generated file, the caller uses
    the generic nMedia media-code download contract. Export does not implement a
    second file-delivery path.
11. nMedia resolves the provider, file path, MIME type, access policy, and
    content-disposition metadata. nRouter streams the file through the existing
    `fileDownloadResponseHandler`.

## Generated Export Downloads

Generated export files are media records. Export owns the source read,
transformation, rendering, and target-write lifecycle that creates those media
records. It does not own delivery after the media record exists.

Axis and other clients download generated files through the generic nMedia
download route:

```http
GET /nodics/media/v0/download/{mediaCode}
Authorization: Bearer <employee-token>
```

This route is governed by nMedia permissions and delivery policy, such as
`media.content.download`. Granting `export.run` allows export generation; it
does not automatically grant broad media download rights. Do not add export
download routes, export binary streaming, or export-specific file-response
handlers. Use nMedia delivery and the framework `fileDownloadResponseHandler`.

## Extension Path

Projects or provider modules may override or extend the export service through
later active modules. A real implementation should:

- validate the selected schema, format, query, and export policy;
- verify tenant context, access group, and permission requirements;
- resolve source data through governed services or schemas;
- call `applyExportAccessPolicies` before data is serialized;
- delegate format rendering to CSV, Excel, JSON, JavaScript, or custom format services;
- write only through governed media/storage provider aliases;
- return a traceable result with status, counts, destination metadata, and diagnostics.

Keep delivery-provider details in their own services. Keep format rendering in format modules. Keep request normalization and cross-format policy in this module.

## Tests

Focused behavior is covered by `test/dataExportCapabilityBehavior.test.js`, which verifies HTTP request normalization, the default fail-closed service behavior, access-policy delegation, export-safe model copy handling, and the rule that generated file downloads remain owned by nMedia.

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

## Continue

- Export family and completion gate: [nExport](../README.md)
- Public data guide: [How To Work With Data](https://github.com/Nodics/nodicsdocs)
- Data access policy: [database](../../../nDatabase/database/README.md)
- Maturity matrix: [Provider And Capability Maturity Matrix](https://github.com/Nodics/nodicsdocs)
