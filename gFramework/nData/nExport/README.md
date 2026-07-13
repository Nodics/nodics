# nExport

`nExport` owns data export orchestration and export-specific extension points.

Export guidance should be refined from current source as export contracts
mature. Export behavior must remain definition-driven, tenant-aware, and safe
for operational use.

## Ownership

`nExport` should own:

- export definitions;
- query and selection contracts;
- formatter and writer contracts;
- delivery/provider integration points;
- export diagnostics, audit, and retry behavior where applicable;
- tests for default exports and project-level overrides.

## Extension Contract

Projects add formats, destinations, filters, providers, and delivery policies
through later modules and configuration. Do not hardcode customer destinations,
credentials, file paths, or tenant mappings in framework export code.
