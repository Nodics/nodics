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
