# csvExport Module

`csvExport` provides CSV-specific export support for the `nData/nExport` family. It owns CSV formatting defaults, delimiter/header conventions, and adapter wiring used by the shared export engine.

Use this module for CSV-only behavior. Export lifecycle, policy enforcement, and shared run handling belong in `nData/nExport/export`.

CSV export changes must preserve schema-driven output, tenant isolation, validation, and diagnostics so exported data remains traceable and reproducible.
