# jsImport Module

`jsImport` provides JavaScript data-definition import support for the `nData/nImport` capability. It registers `.js` files with the shared import engine, loads trusted module-owned JavaScript data objects, merges them, and sends the resulting model list into the import data handler selected by the import header.

Use this module for trusted JavaScript import definitions that live inside active Nodics modules. Do not use it as an upload or remote-pull mechanism for arbitrary external JavaScript.

## Capability

The module contributes:

- `data.fileTypeProcess.js = 'jsFileDataInitializerPipeline'`;
- `jsFileDataInitializerPipeline`;
- `DefaultJsFileDataProcessService`.

JavaScript import files are loaded through Node's module loading path. This is powerful and must stay limited to trusted source-controlled module data definitions.

## Runtime Flow

1. The shared import module resolves a `.js` file to `jsFileDataInitializerPipeline`.
2. `validateRequest` confirms `request.files` is an array and `request.outputPath` is present.
3. `processDataChunk` loads and merges all requested JavaScript files through `handleFiles`.
4. The merged object values are converted into `request.models`.
5. Import diagnostics increment `recordsRead` when diagnostics are active.
6. `request.outputPath.version` is set to `0_0`.
7. The import header's `options.dataHandler` pipeline processes the model list.

## Configuration

Default configuration:

```js
module.exports = {
    data: {
        fileTypeProcess: {
            js: 'jsFileDataInitializerPipeline'
        }
    }
};
```

The JavaScript import path is intentionally small. Additional execution policy, allowed locations, or trust rules should be configured and tested before expanding behavior.

## Extension Path

Projects may customize JavaScript import by:

- contributing trusted module-owned data files;
- contributing import headers and data handlers for those files;
- overriding `DefaultJsFileDataProcessService` in a later active module;
- adding validation through schema services, validators, interceptors, or import pipelines;
- adding project-specific tests for data definition shape and tenant behavior.

When importing external data, prefer JSON, CSV, Excel, API push, or scheduled file pickup. JavaScript import is for trusted data definitions, not external executable payloads.

## Tests

Current module coverage includes common and environment-local smoke tests. Changes to JS import behavior should add focused tests for:

- missing files and missing output path;
- trusted file loading and merge behavior;
- diagnostics `recordsRead` increments;
- data-handler pipeline invocation;
- rejection or prevention of untrusted locations when such policy is added;
- project override behavior.

Run:

```bash
npm run test:import
npm run test:basic
npm run quality:docs
```

## What To Avoid

Avoid:

- accepting arbitrary external JavaScript as import input;
- using JS import for supplier, partner, or customer-uploaded data;
- hiding transformation rules in executable files when schema/import definitions can express them;
- bypassing tenant, schema, validation, diagnostics, or access-policy behavior;
- changing JS import trust boundaries without security review and tests;
- editing generated import artifacts manually.
