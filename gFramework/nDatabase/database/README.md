# database

The `database` module owns schema-driven persistence contracts, tenant/module
database configuration, connection lifecycle, model generation, CRUD pipeline
integration, ownership enforcement, and database adapter extension points.

Existing module/tenant handles contribute required readiness without opening
probe connections. Central shutdown closes registered handles through their
configured adapter services.

## Provider-neutral transactions

`DefaultDatabaseTransactionService` is the only provider-neutral entry point
for multi-record atomic work. It resolves the registered module/tenant
database, requires a truthful `multiRecordAtomic` capability, and gives the
callback an opaque context that generated operations propagate to the adapter.

Contexts are callback- and database-scoped. Cross-database, expired, and
unsupported-adapter use fails closed. Business modules must never import a
provider driver to obtain a native transaction.

Transaction participation is also schema-owned and explicit. A participating
schema must declare:

```js
transaction: {
    enabled: true,
    sideEffects: 'none'
},
cache: {
    enabled: false
},
event: {
    enabled: false
}
```

The framework rejects transaction contexts for schemas that do not meet this
contract. This protects atomicity because generated cache or event side effects
could otherwise be emitted before the database transaction commits. A domain
module still owns the schema and business invariant; nService and nDatabase own
generated CRUD execution, transaction-context validation, connections, and
provider adapters.

The same validation runs while static schemas are composed and while nDynamo
activates a runtime `schemaConfiguration`. Transaction eligibility is therefore
one standard schema contract, not a consumer-specific convention.

Database adapters report capabilities discovered from the live connection.
The generic `Database` wrapper stores that provider-neutral snapshot. The
transaction service must not infer deployment capability merely because an
adapter implements transaction methods.

```js
databaseTransactions: {
    enabled: true,
    failClosed: true,
    maximumCommitTimeMs: 5000
}
```

Adapters supporting this contract must prove commit, forced rollback,
context isolation, concurrency conflict, and live deployment topology.

## Tenant and module configuration

Database configuration is resolved from the effective layered `database`
property for the active tenant. `database.default` supplies inherited options
and adapter definitions; a later module entry such as `database.profile` may
override only its connection or adapter delta without copying the framework
configuration.

Before a connection is attempted, `DefaultDatabaseConfigurationService`
requires:

- an active module and active tenant;
- `database.default` in the tenant-effective configuration;
- an effective `options.databaseType`;
- an adapter `options.connectionHandler`;
- a master `URI` and `databaseName`.

Invalid input fails before clients or models are constructed. Registered
database handles are isolated by both module and tenant. Projects may override
the configuration service in a later layer, but must preserve these validation
and isolation contracts.

## Save and cache coherence

Generated single-model saves invalidate the schema router cache and, when
enabled, the schema item cache through `DefaultCacheService`. The save pipeline
waits for each best-effort invalidation attempt before returning success. This
keeps an immediate read after save or core import from observing an older
cached projection.

Cache-provider failure does not reverse an already-committed database write.
The pipeline logs the invalidation failure and completes the save, allowing
operators to diagnose or flush the affected scoped cache. Projects overriding
the save lifecycle must preserve this ordering and must not call a cache
provider directly.

## Per-schema versioning

The ordinary `default.base` schema is always non-versioned. Loading the
`vDatabase` capability makes the `default.versioned` contract available, but
does not automatically version every model.

The module that owns a schema selects versioned persistence by contributing
`isVersionedEnabled: true` on that schema. During schema composition, the
database schema handler merges the versioned fields and exposes the internal
`versioned` model flag consumed by `vService` and version-aware database
providers. Schemas without the flag continue through ordinary persistence.

Configuration fails fast when a schema enables versioning but the active module
topology does not provide the `vDatabase` contract. This prevents a deployment
from silently losing version history.

Test databases remain conditional on the active test configuration. Production
configuration and credentials must be contributed by project, environment,
server, node, external, or governed runtime layers rather than hardcoded into
framework services.

## Schema Maintenance APIs

Schema index and schema validator rebuild routes are control-plane APIs. They
are secured and must carry action-specific permissions:

- `system.schema.index.rebuild` for schema index rebuild routes;
- `system.schema.validator.rebuild` for schema validator rebuild routes.

Projects may override these routes in later modules, but must keep explicit
permission metadata or a governed `permissionConfig`. Do not rely only on broad
groups such as `userGroup` for schema maintenance APIs.

These routes also carry the `schemaMaintenance` `apiExposure` category. If a
project wants to disable schema maintenance APIs for a specific topology, do it
through layered `apiExposure.categories.schemaMaintenance.enabled` configuration
instead of removing framework routes.

## Layered named schema policies

Reusable schema access and ownership defaults belong in layered
`schemaPolicies` configuration rather than local JavaScript factories inside a
schema registry. A schema references one or more policies:

```js
address: {
    super: 'base',
    schemaPolicies: ['customerOwned'],
    model: true
}
```

The owning module contributes the named policy through `properties.js`.
nDatabase resolves policies before schema inheritance and materializes the
established `accessGroups` and `ownership` properties. Generated CRUD, access
handlers, ownership enforcement, models, and APIs continue to consume only the
effective schema. Named policies are composition inputs, not another runtime
authorization authority.

Ownership collections use keyed booleans so later modules can extend and
remove entries predictably. `true` includes a group/type and `false` removes
an inherited entry. Policies are namespaced by the schema-owning module,
several policies compose in listed order, explicit schema properties take
final precedence, and unknown policy names fail startup.

## Schema Workbench discovery

Schema Workbench lets an authorized BackOffice client discover a module's
model contracts without receiving database, service, interceptor, or
credential internals. Every eligible model is discoverable with generated
Search, Read, Create, Update, and Delete operations by default, filtered by the
caller's effective access. It is a metadata API, not another CRUD
implementation.

An owning module adds mutation behavior or presentation metadata explicitly:

```js
backoffice: {
    enabled: true,
    label: 'Address',
    displayProperty: 'code',
    displayProperties: ['city', 'code'],
    operations: ['search', 'read', 'create', 'update', 'delete'],
    relationships: {
        contacts: {
            label: 'Contact methods',
            targetModule: 'profile',
            actions: ['SELECT_EXISTING', 'CREATE_RELATED']
        }
    }
}
```

`displayProperty` remains the stable primary presentation field.
`displayProperties` may add ordered, client-safe identifying values so a
selector can show a meaningful label such as `Default tenant — default`
instead of only an opaque persistence identifier. Relationship labels describe
the source field's business role, so two references to the same target schema
can appear as `Parent enterprise` and `Sub-enterprises`. Define the label on
the source field or override it in `backoffice.relationships`.

When `displayProperties` is omitted, Schema Workbench supplies the stable
`displayProperty` followed by `description`. Axis presents that contract as
`code - description`; if a legacy model has no code, its configured stable
identity (usually `_id`) is used instead. This applies consistently to every
discovered model while allowing the owning module to override the fields.

The secured module-local endpoints are:

- `GET /nodics/{module}/v0/schema/workbench`
- `GET /nodics/{module}/v0/schema/workbench/:schema`
- `POST /nodics/{module}/v0/schema/workbench/:schema/records`
- `POST /nodics/{module}/v0/schema/workbench/:schema/delete-impact`
- `POST /nodics/{module}/v0/schema/workbench/:schema/bulk`
- `POST /nodics/{module}/v0/schema/workbench/:schema/aggregate`

Discovery, record search, and delete-impact preview require
`system.schema.workbench.view`. Bulk and aggregate commands require the
separate `system.schema.workbench.manage` permission. Every route also requires
the `schemaWorkbench` API exposure category. The returned operations are intersected with the caller's
effective schema access point. A non-model schema, an explicitly disabled
schema, or a schema the caller cannot read is not disclosed.

The layered `schemaWorkbench` configuration controls default discovery:

- `discoverModelsByDefault` enables safe model discovery;
- `defaultModelOperations` defaults to generated `search`, `read`, `create`,
  `update`, and `delete`.
- `defaultRelationshipActions` controls the relationship choices advertised by
  default. The standard contract offers `SELECT_EXISTING` and `CREATE_RELATED`;
  Axis shows create-related only when the target schema also authorizes create.
- `defaultPageSize`, `allowedPageSizes`, and `maximumPageSize` bound record
  browsing;
- `maximumSearchLength` bounds free-text input.

Set `backoffice.enabled: false` on a model that must never appear. Use an
explicit `operations` list to narrow a model to read-only or another approved
subset.

The descriptor is generated from the already composed `module.rawSchema`.
Therefore inherited fields remain visible and there is no parallel schema
loader or registry. Data reads and mutations still use the existing generated
CRUD routers or an explicitly declared module-owned domain operation.

The record browser endpoint accepts only a plain search string, a one-based
page number, an allowed page size, and a descriptor-advertised sort field and
direction. It escapes the search as literal text, searches only safe string
fields, and invokes the schema's existing generated service. It does not
accept client-supplied MongoDB operators or create a parallel query authority.
The response includes the page records, total count, effective page, page
size, and sort. Axis cancels obsolete in-flight requests when the employee
changes search, sort, page, or selected schema.

Descriptors also advertise scalar `filterFields`, their type-safe operators,
and the supported `AND`/`OR` group operators. Browser filters are limited to
20 conditions and three group levels by default. Text, enum, number, boolean,
and date values are validated and normalized before an internal query is
created. Projects may reduce these limits through layered
`schemaWorkbench` configuration. Raw query fragments, field names, operators,
regular expressions, scripts, and URLs are never accepted from the client.

Relationship metadata may identify another module through `targetModule`.
`LOCAL_OR_REMOTE` means the client resolves the target through BackOffice
module discovery and calls the target module directly. It does not authorize
nDatabase to perform a distributed transaction. Cross-module workflows must
use a domain operation, ordered compensation, or reference-only behavior
according to the owning modules' consistency contract.

Relationship descriptors also expose bounded presentation-neutral metadata:
relationship type, ownership direction, inverse field, target-delete policy,
maximum nested-create depth, cycle handling, and whether governed delete impact
can be inspected. These values are derived from the effective schema and its
`backoffice.relationships` override. They are not a second relationship
registry.

### Bulk, concurrency, and aggregate commands

Bulk mutation is disabled unless the owning schema explicitly declares
`backoffice.bulkOperations`. The first generic operation is bounded
`DELETE`; it requires `system.schema.workbench.manage`, an 8-128 character
`Idempotency-Key`, and no more than `schemaWorkbench.maximumBulkItems`
identities. Execution delegates to the existing generated remove service, so
authorization, ownership, interceptors, validation, reference integrity,
tenant isolation, and provider behavior remain authoritative.

When an effective schema has a `revision` field, its descriptor advertises a
compare-and-set identity requirement. A later layer may configure another
effective revision field through `backoffice.concurrency`; it may not invent a
browser-only timestamp check.

Aggregate operations are also opt-in:

```js
backoffice: {
    aggregateOperations: {
        SAVE_WITH_RELATIONSHIPS: {
            enabled: true,
            label: 'Save with related records',
            purpose: 'SAVE_WITH_RELATIONSHIPS',
            consistency: 'ATOMIC',
            service: 'DefaultAddressAggregateService',
            operation: 'saveWithRelationships'
        }
    }
}
```

The descriptor exposes only inert name, label, purpose, consistency, and
confirmation metadata. It never exposes service names. The generic endpoint
only delegates; the owning service must validate the complete command and use
`DefaultDatabaseTransactionService` for supported same-database atomic work.
Cross-database or cross-module consistency must use a module-owned Workflow or
saga with explicit compensation. Workbench never simulates a distributed
transaction.

### Reference-safe deletion

Generated deletion can enforce an inbound relationship without introducing a
second relationship registry. The source schema owns the rule on its existing
`refSchema` entry:

```js
refSchema: {
    contacts: {
        enabled: true,
        moduleName: 'profile',
        schemaName: 'contact',
        type: 'many',
        propertyName: 'code',
        onTargetDelete: 'RESTRICT'
    }
}
```

`RESTRICT` means a referenced target record cannot be deleted until the source
reference is removed. The shared remove pipeline discovers these declarations
from effective schemas before persistence. It supports same-module and
cross-module contracts when the source model is available in the current
runtime.

The guard is configured through layered `referenceIntegrity` properties:

- `enabled` activates the generic guard;
- `failClosed` rejects deletion when a declared source cannot be checked;
- `maximumTargetRecords` bounds target inspection per delete;
- `maximumRelationships` bounds the number of evaluated declarations.

The default is deliberately fail-closed. A distributed deployment may override
`DefaultReferenceIntegrityService` with a governed remote or indexed
implementation, but must continue deriving declarations from effective
`refSchema`, preserve tenant context, and return the same conflict/unavailable
semantics. It must not introduce an independently managed relationship list.

`CASCADE` is not implemented by this contract. Declaring any value other than
`RESTRICT` does not authorize cascading deletion. A cascade requires an
explicit module-owned business operation with its own transaction,
compensation, authorization, audit, and failure contract.

## Provider Adapter Checklist

Use this checklist when adding a new database adapter such as Oracle:

- define the provider module and metadata so Nodics can load it as an active
  module;
- contribute layered `database` configuration for `databaseType`,
  `connectionHandler`, URI, database name, credentials, pool options, and
  provider-specific options;
- implement the connection handler and model/query adapter behind the generic
  database service contract;
- declare transaction capability honestly and implement transaction adapter
  methods when multi-record atomic work is supported;
- keep generated DAO/model CRUD behavior provider-neutral;
- preserve tenant/module keying for registered connections and models;
- preserve schema read/write access policy, interceptors, middleware,
  validators, diagnostics, and error codes;
- add contract tests for valid configuration, invalid configuration, tenant
  isolation, module isolation, query behavior, and override behavior;
- document any provider limitations, required external libraries, live-test
  requirements, and secret-management expectations.

If this checklist cannot be satisfied without editing generic DAO or generated
CRUD call sites, the framework is missing an extension point. Add that extension
point deliberately rather than wiring a provider shortcut into the core path.
