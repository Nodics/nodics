# csvExport Module

`csvExport` provides CSV-specific export support for the `nData/nExport` family. It owns CSV formatting defaults, delimiter/header conventions, and adapter wiring used by the shared export engine.

Use this module for CSV-only behavior. Export lifecycle, policy enforcement, and shared run handling belong in `nData/nExport/export`.

CSV export changes must preserve schema-driven output, tenant isolation, validation, and diagnostics so exported data remains traceable and reproducible.

## Capability Status

The module currently contributes standard Nodics structure for a CSV export adapter:

- layered configuration extension files;
- schema, router, and pipeline extension slots;
- enum, status, and utility files;
- common and environment-local smoke tests;
- generated LLM context.

It does not currently provide a complete CSV writer service. A production CSV exporter should be implemented through this module or a later active project/provider module.

## Extension Path

A CSV exporter should define:

- field selection and ordering rules;
- header naming rules;
- delimiter, quote, escape, newline, and encoding options;
- null/blank value handling;
- date, number, boolean, and enum formatting;
- streaming or batch behavior for large files;
- destination handoff behavior through governed export delivery services;
- tests for rendered output and edge cases.

Keep CSV rendering here. Keep source-data selection, access policy, run orchestration, and delivery governance in the shared export engine or delivery/provider modules.

## Configuration

CSV configuration should come from layered properties or export definitions. Typical options include delimiter, quote character, header mode, encoding, newline style, file naming policy, and maximum row handling.

Do not hardcode customer-specific headers, target paths, tenant mappings, or credentials in framework code.

## Tests

Run the current module baseline with:

```bash
npm run structure:audit -- --fail
npm run quality:docs
```

A real CSV implementation should add deterministic tests that compare exact rendered output for headers, escaping, empty values, multiline fields, and tenant-specific field restrictions.

## What To Avoid

Avoid:

- building CSV strings before export access policy is applied;
- hiding destination behavior inside the format writer;
- assuming one delimiter or header contract for every customer;
- accepting arbitrary file paths from API requests;
- treating smoke tests as release coverage for a production CSV exporter.
