# database

The `database` module owns schema-driven persistence contracts, tenant/module
database configuration, connection lifecycle, model generation, CRUD pipeline
integration, ownership enforcement, and database adapter extension points.

Existing module/tenant handles contribute required readiness without opening
probe connections. Central shutdown closes registered handles through their
configured adapter services.

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

## Provider Adapter Checklist

Use this checklist when adding a new database adapter such as Oracle:

- define the provider module and metadata so Nodics can load it as an active
  module;
- contribute layered `database` configuration for `databaseType`,
  `connectionHandler`, URI, database name, credentials, pool options, and
  provider-specific options;
- implement the connection handler and model/query adapter behind the generic
  database service contract;
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
