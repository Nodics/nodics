# jsonExport Module

`jsonExport` provides JSON-specific export support for the `nData/nExport` family. It owns JSON serialization defaults, JSON export adapter wiring, and format-specific contracts used by the shared export engine.

Keep cross-format export orchestration in `nData/nExport/export`. This module should only contain behavior that is specific to JSON payload shape, encoding, schema mapping, or JSON export configuration.

Projects can override JSON export behavior through active modules and layered configuration. Framework defaults should stay generic, auditable, and safe for tenant-specific extension.

## Capability Status

The module currently contributes standard Nodics structure for a JSON export adapter:

- layered configuration extension files;
- schema, router, and pipeline extension slots;
- enum, status, and utility files;
- common and environment-local smoke tests;
- generated LLM context.

It does not currently provide a complete JSON writer service. A production JSON exporter should be implemented through this module or a later active project/provider module.

## Extension Path

A JSON exporter should define:

- root payload shape;
- field selection and nesting rules;
- array and object ordering where deterministic output matters;
- null, blank, and missing-value handling;
- date, number, boolean, enum, and identifier formatting;
- schema-to-contract mapping for target systems;
- pretty/minified output options;
- delivery behavior through governed export destination services;
- tests that verify exact payload shape and access-policy filtering.

Keep JSON serialization here. Keep source-data selection, access policy, run orchestration, and delivery governance in the shared export engine or delivery/provider modules.

## Configuration

JSON configuration should come from layered properties or export definitions. Typical options include payload root name, field mapping, target contract version, pretty-print mode, output encoding, file naming policy, and maximum record handling.

Do not hardcode customer target contracts, endpoint URLs, credentials, or tenant mappings in framework code.

## Tests

Run the current module baseline with:

```bash
npm run structure:audit -- --fail
npm run quality:docs
```

A real JSON implementation should add deterministic tests for payload shape, field filtering, nested objects, null handling, ordering, and target-contract compatibility.

## What To Avoid

Avoid:

- serializing data before export access policy is applied;
- mixing API response contracts with export file contracts unless the definition explicitly says so;
- accepting arbitrary delivery URLs or credentials from requests;
- placing JSON-specific mapping in the shared export engine;
- treating smoke tests as release coverage for a production JSON exporter.
