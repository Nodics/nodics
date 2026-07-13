# excelImport Module

`excelImport` provides spreadsheet-oriented import support for `nData/nImport`. It owns workbook/sheet parsing conventions, row mapping, and adapter wiring used by the shared import engine.

Use this module only for Excel-specific behavior. Shared import lifecycle, diagnostics, access policy, run history, and remote transport governance remain in `nData/nImport/import`.

Project-specific spreadsheet layouts should be represented as import definitions and layered configuration, not hardcoded framework assumptions.
