# csvImport Module

`csvImport` provides CSV-specific import support for the `nData/nImport` capability. It registers `.csv` files with the shared import engine, parses CSV rows into model objects, chunks records by configured buffer size, and sends each chunk into the import data handler selected by the import header.

Use this module for CSV-only parsing and preprocessing behavior. Shared import orchestration, tenant dispatch, diagnostics, run history, access policy, validation-only execution, rollback hooks, and remote-source governance belong to `nData/nImport/import`.

## Capability

The module contributes:

- `data.fileTypeProcess.csv = 'csvFileDataInitializerPipeline'`;
- `data.csvTypeParserOptions` defaults for `csvtojson`;
- `csvFileDataInitializerPipeline`;
- `DefaultCsvFileDataProcessService`;
- `DefaultTenantImportInterceptorService.convertActiveValueToBoolean`.

CSV input is expected to contain header names that match the import header and target schema mapping expected by the shared import lifecycle.

## Runtime Flow

1. The shared import module resolves a `.csv` file to `csvFileDataInitializerPipeline`.
2. `validateRequest` confirms `request.files` and `request.outputPath`.
3. `processDataChunk` delegates to `handleFiles`.
4. Each file is streamed through `csvtojson` with layered parser options.
5. Parsed rows are accumulated until `data.readBufferSize` is exceeded.
6. Each chunk is assigned to `request.models`.
7. Import diagnostics increment `recordsRead` when diagnostics are active.
8. `request.outputPath.version` is set from file index and chunk version.
9. The import header's `options.dataHandler` pipeline processes the chunk.

## Configuration

Default configuration:

```js
module.exports = {
    data: {
        csvTypeParserOptions: {
            output: 'json',
            trim: true,
            ignoreEmpty: true
        },
        fileTypeProcess: {
            csv: 'csvFileDataInitializerPipeline'
        }
    }
};
```

Projects may override parser options in later layers when CSV files need different trimming, empty-row, delimiter, quote, or parser behavior supported by the CSV parser.

## Extension Path

Projects may customize CSV import by:

- overriding `data.csvTypeParserOptions`;
- adding tenant or schema-specific import headers and data handlers;
- overriding `DefaultCsvFileDataProcessService` in a later module;
- contributing preprocessing interceptors such as active-flag conversion;
- adding validation in the shared import pipeline or target schema services.

Do not put one supplier's CSV layout into the framework parser. Supplier-specific mapping belongs in import definitions, processors, or project modules.

## Tests

Current module coverage includes common and environment-local smoke tests. Changes to parsing or chunking should add focused tests for:

- missing files and missing output path;
- parser option behavior;
- chunking by `data.readBufferSize`;
- diagnostics `recordsRead` increments;
- `request.outputPath.version` behavior;
- active-value boolean conversion;
- project override behavior.

Run:

```bash
npm run test:import
npm run test:basic
npm run quality:docs
```

## What To Avoid

Avoid:

- bypassing the shared import lifecycle for CSV files;
- hardcoding tenant, supplier, or schema-specific CSV columns in framework code;
- importing CSV records without diagnostics and validation;
- changing parser defaults without tests;
- treating CSV string booleans as trusted target types without conversion or validation;
- editing generated import artifacts manually.
