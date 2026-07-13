# nDatabase

`nDatabase` owns database configuration, schema loading, model construction,
validators, interceptors, model middleware, and generated persistence contracts.

Developer guidance for this module covers schema definition, nested schema
design, model middleware, validators, generated model/service behavior, DAO
contracts, and provider adapters. Current behavior must always be verified from
the owning source files, active configuration, and tests.

## Ownership

`nDatabase` is responsible for:

- loading schema definitions from active modules;
- merging schema extensions through module hierarchy;
- creating generated models and persistence contracts;
- owning generic DAO/model CRUD behavior;
- wiring validators, interceptors, and model middleware;
- supporting embedded and referential schema patterns where current source
  permits them;
- preserving tenant-aware database resolution;
- keeping database behavior overrideable by later modules.

## Schema Contract

Schemas are source definitions. Generated models and generated service behavior
must be derived from schema definitions and regenerated during build. Do not
hand-edit generated persistence artifacts as the source of truth.

Schema changes must document:

- owning module and model;
- generated artifacts affected;
- validation rules;
- interceptors and middleware involved;
- tenant/database behavior;
- API/router impact;
- tests for default behavior and later-module overrides.

## DAO And Generated CRUD

`nDatabase` owns the platform data-access layer: generated model functions,
generic CRUD behavior, and customization/generalization points for persistence.

Generated DAO/model operations must remain schema-driven, tenant-aware, and
overrideable through services, validators, interceptors, middleware, and later
module schema definitions. Do not bypass runtime access policy, cache policy,
or tenant database resolution from direct persistence helpers.

## Nested Schema Guidance

Use embedded schemas for data that belongs inside the parent aggregate. Use
referential schemas only when the relationship must be independently persisted
and queried. Referential designs need clear service ownership, validation, and
tests because they create cross-model consistency concerns.

## Extension Contract

Later modules may extend schemas, override validators, add interceptors, or
replace services without editing framework modules. If a schema behavior cannot
be customized through the module hierarchy, treat that as a framework extension
gap rather than hardcoding a project rule.

## Adding A Database Provider

New database engines must be added as provider modules or project modules that
implement the `nDatabase/database` contracts. For example, a customer project
that needs Oracle should add an Oracle database adapter in the customer/project
layer, or contribute a reusable `oracledb` provider module only when the
framework intentionally supports it out of the box.

The implementation path is:

1. Create an owned provider module, following the shape of existing provider
   modules such as `mongodb` or `cassandradb`.
2. Add provider configuration under the layered `database` property, including
   the provider `databaseType`, connection handler, master URI, database name,
   credentials, pooling, and provider options required by the adapter.
3. Implement the provider connection, model, and query behavior behind the
   existing database adapter contracts. Do not change generic DAO or generated
   CRUD call sites for one provider.
4. Preserve tenant-aware database resolution, module isolation, schema access
   policy, validation, interceptors, model middleware, diagnostics, and error
   envelopes.
5. Add tests for the provider contract, configuration validation,
   tenant/module isolation, and later-module override behavior.
6. Update the provider module README, examples, and generated LLM context.

Provider endpoints, credentials, schema spaces, database names, service names,
wallet paths, or cluster topology must come from configuration or governed
secret/runtime layers. They must not be hardcoded in framework modules.
