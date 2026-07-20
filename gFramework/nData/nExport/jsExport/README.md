# jsExport Module

**Maturity: Placeholder or scaffold.** The module owns the future format
boundary but does not yet provide a production writer.

`jsExport` is the JavaScript-oriented export format module under `nData/nExport`. It contributes the format-specific runtime surface used when export definitions need executable JavaScript transformation or rendering behavior.

Use this module for JavaScript export adapters, script execution contracts, and format-specific export defaults. Keep export orchestration, access policy, run history, and shared lifecycle behavior in `nData/nExport/export`.

Projects should extend this capability through layered configuration, format processors, and tests. Do not hardcode tenant data, credentials, or one-project export assumptions in the framework module.

## Capability Status

The module currently contributes standard Nodics structure for a JavaScript-oriented export adapter:

- layered configuration extension files;
- schema, router, and pipeline extension slots;
- enum, status, and utility files;
- common and environment-local smoke tests;
- generated LLM context.

It does not currently provide a complete executable export processor. A production JavaScript exporter should be implemented through this module or a later active project/provider module with strict governance.

## Extension Path

A JavaScript export adapter should define:

- trusted processor discovery;
- allowed processor names;
- input envelope shape;
- output contract shape;
- timeout and resource limits;
- error normalization;
- diagnostics and audit behavior;
- tests for successful transformation, rejected processors, failure reporting, and tenant isolation.

Keep executable transformation behavior here only when the code comes from trusted active modules. Keep user-uploaded scripts, arbitrary request-provided functions, and external code execution out of this module unless a separate governed execution feature is explicitly implemented.

## Configuration

JavaScript export configuration should come from layered properties or export definitions. Typical options include processor name, target contract version, output format, timeout, maximum records, and diagnostics policy.

Do not allow API requests to provide executable code, filesystem paths, module names, external URLs, or credentials.

## Tests

Run the current module baseline with:

```bash
npm run structure:audit -- --fail
npm run quality:docs
```

A real JavaScript export implementation should add deterministic tests for processor selection, trusted-code enforcement, input/output envelopes, timeout behavior, failure sanitization, and access-policy filtering.

## What To Avoid

Avoid:

- executing arbitrary code from request payloads or uploaded data;
- serializing data before export access policy is applied;
- hiding delivery behavior inside JavaScript processors;
- hardcoding customer contracts in framework processors;
- treating smoke tests as release coverage for executable export behavior.

## Production Completion Boundary

Executable transformation must come only from trusted active modules with bounded execution and sanitized failures; never execute request-supplied code.

## Continue

- Export family: [nExport](../README.md)
- Shared fail-closed engine: [export](../export/README.md)
- Maturity matrix: [Provider And Capability Maturity Matrix](../../../../gDocs/reference/provider-capability-maturity-matrix.md)
- Public data guide: [How To Work With Data](../../../../gDocs/data/how-to-work-with-data.md)
