# csvImport Module

`csvImport` provides CSV-specific import support for `nData/nImport`. It owns CSV parsing conventions such as headers, delimiters, row mapping, and adapter wiring used by the shared import engine.

Use this module for CSV-only format behavior. Import lifecycle, validation flow, diagnostics, run history, and remote transport governance belong in `nData/nImport/import`.

CSV import changes should remain schema-driven and tenant-aware. Projects extend the format through configuration and processors instead of editing framework defaults.
