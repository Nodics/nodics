# jsonImport Module

`jsonImport` provides JSON-specific import support for `nData/nImport`. It owns JSON payload parsing, object mapping, and adapter wiring used by the shared import lifecycle.

Keep cross-format lifecycle behavior in `nData/nImport/import`. This module should focus on JSON payload shape, schema mapping, encoding, and JSON-specific validation concerns.

Projects can extend JSON import behavior through active modules, layered configuration, and test-backed processors while preserving the framework contracts for traceability and rollback.
