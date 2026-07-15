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

Projects customize data movement through later-loaded import/export
definitions, processors, services, configuration, and tests. Do not hardcode
customer file formats, storage providers, or data mappings in framework code.

Generated or derived data artifacts must be recreated from source definitions.
Operational imports and exports must preserve validation, audit, diagnostics,
and rollback/retry behavior where applicable.

## Import And Export Model

Data import/export is a platform capability. Nodics keeps that responsibility
in `nData` and its child modules.

An import/export flow defines:

- source or destination format;
- header and field mapping;
- target module and schema;
- tenant/customer context;
- validation behavior;
- duplicate and idempotency behavior;
- diagnostics and run history;
- retry and rollback impact;
- tests and sample/core data expectations.

Format support such as JavaScript, JSON, CSV, and Excel belongs in provider
modules. Add new formats through provider modules or project
modules, not by changing the generic import/export engine for one customer.

## Data Ownership

Importable data belongs to the module, environment, server, or node that owns
the records.

- `data/init` is for startup/bootstrap records that are required.
- `data/core` is for intentional reference imports.
- `data/sample` is for local/demo/test records.

Startup data must be idempotent. Sample data must never become a production
dependency.

## Runtime Safety

Imports and exports can affect many records quickly, so they must preserve
platform governance:

- validate headers and payloads before mutation;
- carry tenant and module context;
- avoid leaking credentials or sensitive data in diagnostics;
- record enough run history to explain what happened;
- expose failure counts and reason codes;
- support rollback or recovery where the business process requires it.
