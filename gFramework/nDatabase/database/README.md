# database

The `database` module owns schema-driven persistence contracts, tenant/module
database configuration, connection lifecycle, model generation, CRUD pipeline
integration, ownership enforcement, and database adapter extension points.

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

Test databases remain conditional on the active test configuration. Production
configuration and credentials must be contributed by project, environment,
server, node, external, or governed runtime layers rather than hardcoded into
framework services.

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
