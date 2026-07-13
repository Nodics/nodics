# nData

`nData` groups data import, data export, and data-core capabilities.

Data import/export guidance must be driven by source code and module contracts.
Treat import/export as platform capabilities: definitions, parsers, processors,
audit, rollback, diagnostics, and tests belong to the owning data modules
instead of ad hoc scripts.

## Ownership

`nData` coordinates:

- import module ownership and shared configuration;
- export module ownership and shared configuration;
- reusable data-processing contracts;
- data movement governance across modules;
- documentation linking child module behavior.

## Extension Contract

Projects should customize data movement through later-loaded import/export
definitions, processors, services, configuration, and tests. Do not hardcode
customer file formats, storage providers, or data mappings in framework code.

Generated or derived data artifacts must be recreated from source definitions.
Operational imports and exports must preserve validation, audit, diagnostics,
and rollback/retry behavior where applicable.
