# excelExport Module

**Maturity: Placeholder or scaffold.** The module owns the future format
boundary but does not yet provide a production writer.

`excelExport` provides spreadsheet-oriented export support for the `nData/nExport` family. It owns Excel-specific output conventions, workbook/sheet mapping behavior, and adapter wiring used by the shared export engine.

Use this module for spreadsheet format behavior only. Shared export lifecycle, access policy, and orchestration remain owned by `nData/nExport/export`.

Project-specific workbook layouts should be supplied through definitions and layered configuration rather than hardcoded in framework code.

## Capability Status

The module currently contributes standard Nodics structure for an Excel export adapter:

- layered configuration extension files;
- schema, router, and pipeline extension slots;
- enum, status, and utility files;
- common and environment-local smoke tests;
- generated LLM context.

It does not currently provide a complete workbook writer service. A production Excel exporter should be implemented through this module or a later active project/provider module.

## Extension Path

An Excel exporter should define:

- workbook structure;
- sheet names and sheet ordering;
- column definitions;
- cell value conversion;
- date, number, boolean, enum, and rich text formatting;
- optional formulas, styles, freeze panes, and filters;
- memory/streaming policy for large exports;
- delivery behavior through governed export destination services;
- tests that verify workbook contents, sheet names, cell values, and edge cases.

Keep spreadsheet rendering here. Keep source-data selection, access policy, run orchestration, and delivery governance in the shared export engine or delivery/provider modules.

## Configuration

Excel configuration should come from layered properties or export definitions. Typical options include workbook template name, sheet mapping, column mapping, style profile, file naming policy, maximum row handling, and output type.

Do not hardcode customer workbook layouts, local filesystem paths, target credentials, or tenant mappings in framework source.

## Tests

Run the current module baseline with:

```bash
npm run structure:audit -- --fail
npm run quality:docs
```

A real Excel implementation should add deterministic workbook tests that open the generated file and verify sheets, rows, columns, values, formulas, and access-policy filtering.

## What To Avoid

Avoid:

- generating workbooks before export access policy is applied;
- embedding destination behavior inside workbook creation;
- assuming every customer uses the same sheet layout;
- loading unbounded data into memory without a streaming or batch policy;
- treating smoke tests as release coverage for a production Excel exporter.

## Production Completion Boundary

A complete writer must prove bounded memory or streaming behavior for large workbooks, deterministic sheet/cell contracts, and safe formula handling.

## Continue

- Export family: [nExport](../README.md)
- Shared fail-closed engine: [export](../export/README.md)
- Maturity matrix: [Provider And Capability Maturity Matrix](../../../../gDocs/reference/provider-capability-maturity-matrix.md)
- Public data guide: [How To Work With Data](../../../../gDocs/data/how-to-work-with-data.md)
