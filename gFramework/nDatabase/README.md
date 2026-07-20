# nDatabase

`nDatabase` is the database capability group. It organizes the generic
persistence contract and its provider modules. The child
[database](database/README.md) module owns schema-driven persistence,
tenant/module database configuration, connection lifecycle, generated models,
CRUD pipelines, access-policy enforcement, and provider extension points.

Provider modules such as [mongodb](mongodb/README.md) and
[cassandradb](cassandradb/README.md) implement provider-specific behavior. The
group itself must not become a second persistence implementation.

Developer guidance for this module covers schema definition, nested schema
design, model middleware, validators, generated model/service behavior, DAO
contracts, and provider adapters. Current behavior must always be verified from
the owning source files, active configuration, and tests.

## Ownership

The `nDatabase` group is responsible for capability composition and shared
navigation. The `database` child capability is responsible for:

- loading schema definitions from active modules;
- merging schema extensions through module hierarchy;
- creating generated models and persistence contracts;
- owning generic DAO/model CRUD behavior;
- wiring validators, interceptors, and model middleware;
- supporting embedded and referential schema patterns where current source
  permits them;
- preserving tenant-aware database resolution;
- keeping database behavior overrideable by later modules.

## When To Use Each Module

| Need | Module |
| --- | --- |
| Understand generic schema, model, connection, CRUD, tenant, and access-policy behavior | [database](database/README.md) |
| Configure or implement MongoDB behavior | [mongodb](mongodb/README.md) |
| Configure or implement Cassandra behavior | [cassandradb](cassandradb/README.md) |
| Evaluate another database adapter | Start with the generic [database provider checklist](database/README.md#provider-adapter-checklist), then create an owned provider module. |

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

## Schema Loader Process

Schema loading is a multi-step process: collect definitions,
merge them through the layered architecture, create runtime schema/model
objects, and expose generated behavior. Nodics applies this through
module-owned `src/schemas/schemas.js`, generated artifacts, and runtime
validation.

Schema loading must preserve:

- active module order;
- default/common schema contributions;
- module-owned schema contributions;
- governed override metadata where schema runtime governance is involved;
- validators and interceptors;
- tenant-aware model/database resolution;
- generated tests and OpenAPI/API impact.

If a later module changes a schema, that change must be explicit, documented,
and tested. Do not rely on accidental merge order or hidden object mutation.

## Model Middleware

Model middleware extends generated persistence behavior without forcing every
schema to hand-write persistence code.

Use model middleware for reusable persistence hooks such as default query
behavior, reference population, lifecycle handling, validation hooks, or
provider-neutral transformations.

When adding or changing middleware, document:

- which generated model behavior it affects;
- whether it runs before or after persistence;
- input and output shape;
- tenant/request context behavior;
- failure behavior;
- provider assumptions;
- tests for default and override behavior.

Middleware must not bypass schema access policy, tenant database resolution, or
interceptor behavior.

## DAO And Generated CRUD

`nDatabase` owns the platform data-access layer: generated model functions,
generic CRUD behavior, and customization/generalization points for persistence.

Generated DAO/model operations must remain schema-driven, tenant-aware, and
overrideable through services, validators, interceptors, middleware, and later
module schema definitions. Do not bypass runtime access policy, cache policy,
or tenant database resolution from direct persistence helpers.

Treat generated CRUD as a capability contract. If a schema exposes
retrieve, save, update, remove, or query behavior, that behavior needs
validation, access control, diagnostics, generated tests, and documentation.
Do not delete generated functions to change behavior; change source definitions
or the generation contract.

## Nested Schema Guidance

Use embedded schemas for data that belongs inside the parent aggregate. Use
referential schemas only when the relationship must be independently persisted
and queried. Referential designs need clear service ownership, validation, and
tests because they create cross-model consistency concerns.

Nested and referenced schema choices affect import/export format, generated
API response shape, search indexing, update semantics, and rollback behavior.
Capture those impacts in the owning module README when the schema is
business-visible.

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

## Security, Performance, And Operations

- Resolve every database handle by both module and tenant where the contract
  requires isolation.
- Validate provider configuration before opening clients or building models.
- Keep secrets outside source and safe diagnostics.
- Apply schema read/write access policy before persistence behavior.
- Treat pool size, deadlines, indexes, query shape, retry behavior, and
  connection cleanup as provider-qualified operational concerns.
- Do not claim a provider is production-ready without live contract,
  performance, failure, recovery, and isolation evidence for the target use.

## Verification

The group has no independent persistence runtime. Verify the generic child and
the selected provider:

```bash
node gFramework/nDatabase/database/test/tenantDatabaseConfigurationValidation.test.js
node gFramework/nDatabase/database/test/schemaReadAccessPolicyService.test.js
node gFramework/nDatabase/database/test/schemaWriteAccessPolicyService.test.js
node gFramework/nDatabase/database/test/modelSaveInitializerPipelineContract.test.js
npm run quality:docs
npm run test:basic
```

Provider changes also require provider-specific invalid configuration,
connection, query, tenant isolation, failure, cleanup, and live integration
tests where external infrastructure is involved.

## Common Mistakes

- Adding provider-specific branches to generic DAO or generated CRUD code.
- Treating the `nDatabase` group as the runtime persistence implementation.
- Sharing a connection or model across tenants without an explicit contract.
- Bypassing schema access policy through a convenience query path.
- Editing generated models instead of source schema definitions.

## Continue

- Public data guide: [How To Work With Data](../../gDocs/data/how-to-work-with-data.md)
- Generic persistence capability: [database](database/README.md)
- Provider maturity: [Provider And Capability Maturity Matrix](../../gDocs/reference/provider-capability-maturity-matrix.md)
- Framework map: [gFramework](../README.md)
