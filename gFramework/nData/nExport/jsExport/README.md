# jsExport Module

`jsExport` is the JavaScript-oriented export format module under `nData/nExport`. It contributes the format-specific runtime surface used when export definitions need executable JavaScript transformation or rendering behavior.

Use this module for JavaScript export adapters, script execution contracts, and format-specific export defaults. Keep export orchestration, access policy, run history, and shared lifecycle behavior in `nData/nExport/export`.

Projects should extend this capability through layered configuration, format processors, and tests. Do not hardcode tenant data, credentials, or one-project export assumptions in the framework module.
