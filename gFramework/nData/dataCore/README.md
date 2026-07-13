# dataCore

`dataCore` owns shared data movement contracts used by import and export
modules.

Use this module for reusable data abstractions that are not specific to import
or export. Capability-specific behavior should stay in `nImport`, `nExport`, or
project modules.

## Ownership

`dataCore` may own:

- shared data processing contracts;
- reusable validation or transformation helpers;
- common diagnostics and result shapes;
- shared test utilities for data movement.

## Extension Contract

Keep shared contracts provider-neutral and tenant-aware. Project-specific data
formats, storage providers, credentials, and mappings belong in later modules or
configuration.
