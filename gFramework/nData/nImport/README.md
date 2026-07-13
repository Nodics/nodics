# nImport

`nImport` owns data import orchestration and import-specific extension points.

Import guidance should be refined from current source as import contracts
mature. Import behavior must remain definition-driven and overrideable by
project modules.

## Ownership

`nImport` should own:

- import definitions;
- parser and reader contracts;
- processor and validation steps;
- mapping from external input into Nodics models;
- import diagnostics, audit, retry, and rollback behavior where applicable;
- tests for default imports and project-level overrides.

## Extension Contract

Projects add file formats, providers, mappings, processors, and validation
through later modules and configuration. Do not hardcode customer formats,
storage locations, credentials, or tenant mappings in framework import code.
