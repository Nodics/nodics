# jsonExport Module

`jsonExport` provides JSON-specific export support for the `nData/nExport` family. It owns JSON serialization defaults, JSON export adapter wiring, and format-specific contracts used by the shared export engine.

Keep cross-format export orchestration in `nData/nExport/export`. This module should only contain behavior that is specific to JSON payload shape, encoding, schema mapping, or JSON export configuration.

Projects can override JSON export behavior through active modules and layered configuration. Framework defaults should stay generic, auditable, and safe for tenant-specific extension.
