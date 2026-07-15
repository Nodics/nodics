# jsonImport Module

`jsonImport` provides JSON-specific import support for the `nData/nImport` capability. It registers `.json` files with the shared import engine, streams JSON arrays into model chunks, and sends those chunks into the import data handler selected by the import header.

Use this module for JSON parsing and chunking behavior. Shared import orchestration, tenant dispatch, diagnostics, run history, access policy, validation-only execution, rollback hooks, and remote-source governance belong to `nData/nImport/import`.

## Capability

The module contributes:

- `data.fileTypeProcess.json = 'jsonFileDataInitializerPipeline'`;
- `jsonFileDataInitializerPipeline`;
- `DefaultJsonFileDataProcessService`.

JSON input is expected to be an array stream compatible with `stream-json/streamers/StreamArray`. Each array value becomes a model record.

## Runtime Flow

1. The shared import module resolves a `.json` file to `jsonFileDataInitializerPipeline`.
2. `validateRequest` confirms `request.files` is an array and `request.outputPath` is present.
3. `processDataChunk` delegates to `handleFiles`.
4. Each JSON file is read as a stream.
5. `StreamArray` emits one array element at a time.
6. Records are accumulated until `data.readBufferSize` is exceeded.
7. Each chunk is assigned to `request.models`.
8. Import diagnostics increment `recordsRead` when diagnostics are active.
9. `request.outputPath.version` is set from file index and chunk version.
10. The import header's `options.dataHandler` pipeline processes the chunk.

## Configuration

Default configuration:

```js
module.exports = {
    data: {
        fileTypeProcess: {
            json: 'jsonFileDataInitializerPipeline'
        }
    }
};
```

Chunk size is controlled by the shared `data.readBufferSize` property owned by the import lifecycle configuration.

## Extension Path

Projects may customize JSON import by:

- contributing import headers and data handlers for JSON payloads;
- overriding `DefaultJsonFileDataProcessService` in a later active module;
- adding schema validation, validators, interceptors, or transformation processors;
- adding project-specific tests for JSON payload shape and tenant behavior.

Keep cross-format import rules in the shared import module. JSON-specific behavior should stay in this module or in a later project override.

## Tests

Current module coverage includes common and environment-local smoke tests. Changes to parsing or chunking should add focused tests for:

- missing files and missing output path;
- non-array request file input;
- JSON array streaming;
- chunking by `data.readBufferSize`;
- diagnostics `recordsRead` increments;
- `request.outputPath.version` behavior;
- malformed JSON failure behavior;
- project override behavior.

Run:

```bash
npm run test:import
npm run test:basic
npm run quality:docs
```

## What To Avoid

Avoid:

- assuming JSON payloads are trusted because they are structured;
- bypassing schema and access-policy validation;
- loading very large JSON files fully into memory when streaming is required;
- changing chunk behavior without tests;
- putting project-specific transformation in the framework parser;
- editing generated import artifacts manually.
