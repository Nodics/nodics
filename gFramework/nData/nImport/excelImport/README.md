# excelImport Module

**Maturity: Production-ready format capability** when used through the shared
governed import lifecycle. External source/transport maturity is evaluated
separately.

`excelImport` provides spreadsheet-oriented import support for the `nData/nImport` capability. It registers Excel file extensions with the shared import engine, reads workbook rows through `exceljs`, maps row values by the header row, and sends parsed records into the import data handler selected by the import header.

Use this module for Excel-specific parsing behavior. Shared import orchestration, tenant dispatch, diagnostics, run history, access policy, validation-only execution, rollback hooks, and remote-source governance belong to `nData/nImport/import`.

## Capability

The module contributes:

- `data.fileTypeProcess` mappings for `xls`, `xlsb`, `xlsm`, and `xlsx`;
- `data.excelTypeParserOptions`;
- `excelFileDataInitializerPipeline`;
- `DefaultExcelFileDataProcessService`.

The first row of the selected worksheet is treated as the header row. Later rows become model objects keyed by those header names.

## Runtime Flow

1. The shared import module resolves an Excel file to `excelFileDataInitializerPipeline`.
2. `validateRequest` confirms `request.files` and `request.outputPath`.
3. `processDataChunk` delegates to `handleFiles`.
4. Each file is read with `exceljs`.
5. `convertExcelFile` selects the configured sheet, defaulting to the first worksheet.
6. Row one becomes the header list.
7. Later rows become record objects.
8. Empty fields are omitted only when `omitEmptyFields` is enabled.
9. Parsed records are assigned to `request.models`.
10. Import diagnostics increment `recordsRead` when diagnostics are active.
11. The import header's `options.dataHandler` pipeline processes the records.

## Configuration

Default configuration:

```js
module.exports = {
    data: {
        excelTypeParserOptions: {
            sheet: 1,
            isColOriented: false,
            omitEmptyFields: false,
            convertTextToNumber: true
        },
        fileTypeProcess: {
            xls: 'excelFileDataInitializerPipeline',
            xlsb: 'excelFileDataInitializerPipeline',
            xlsm: 'excelFileDataInitializerPipeline',
            xlsx: 'excelFileDataInitializerPipeline'
        }
    }
};
```

Only options supported by the current processor should be treated as active behavior. New parser options must be implemented in the service and covered by tests before documentation promises them.

## Extension Path

Projects may customize Excel import by:

- overriding parser options such as selected sheet or empty-field behavior;
- providing project-specific import headers and data handlers;
- overriding `DefaultExcelFileDataProcessService` in a later active module;
- adding validation through schema services, validators, interceptors, or import pipelines;
- adding focused tests for project-specific workbook layouts.

Do not hardcode one customer workbook layout into the framework processor.

## Tests

Current module coverage includes common and environment-local smoke tests. Changes to parsing should add focused tests for:

- missing files and missing output path;
- worksheet selection;
- header-row mapping;
- empty field handling;
- diagnostics `recordsRead` increments;
- data-handler pipeline invocation;
- project override behavior.

Run:

```bash
npm run test:import
npm run test:basic
npm run quality:docs
```

## What To Avoid

Avoid:

- bypassing the shared import lifecycle for Excel files;
- assuming every workbook uses the same sheet or column layout;
- importing spreadsheet values without schema validation;
- documenting parser options that the service does not implement;
- treating Excel files as trusted production data without diagnostics;
- editing generated import artifacts manually.

## Operations And Boundaries

Large workbooks require explicit size, row, sheet, batching, and memory limits. A future streaming implementation must preserve the same header, tenant, validation, diagnostics, and dispatch contracts.

## Continue

- Import family: [nImport](../README.md)
- Shared engine: [import](../import/README.md)
- Data processing: [dataCore](../../dataCore/README.md)
- Public data guide: [How To Work With Data](../../../../gDocs/data/how-to-work-with-data.md)
