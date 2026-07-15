# How To Work With Data

Nodics data behavior is built around schemas, data access services, import/export, tenant context, and provider modules.

Data changes must be safe, testable, and reversible where the business process requires it.

## Schemas

A schema defines the shape of stored data.

When creating or changing a schema, document:

- Purpose of the data.
- Required fields.
- Optional fields.
- Relationships to other schemas.
- Tenant behavior.
- Index requirements.
- Access policy.
- Import/export behavior.
- Generated API impact.

After changing schemas, rebuild and run generated tests.

## Database Providers

Nodics supports database behavior through provider modules.

For example, MongoDB and Cassandra support live under their own provider areas. If a project needs another database such as Oracle, it should be added as a provider module with its own connection handling, DAO behavior, configuration, tests, and documentation.

Do not put Oracle-specific behavior into the generic database layer.

## Adding A New Database Provider

A new provider should define:

- Connection configuration.
- Connection lifecycle.
- Model or query abstraction.
- DAO operations.
- Tenant-aware database resolution.
- Error handling.
- Health diagnostics.
- Tests for normal and failure behavior.
- Documentation explaining how projects activate it.

The generic database capability should describe the contract. The provider module should implement it.

## Initial Data

Initial data is loaded during startup when the system needs baseline records.

Use initial data for required records such as core groups, permissions, or mandatory catalog entries.

Initial data should be idempotent. Starting the server twice should not create duplicate records.

## Sample Data

Sample data is optional data used for demonstrations, testing, or local development.

Sample data should not be treated as required production data.

## Import And Export

Nodics supports import and export flows for structured data.

An import process should explain:

- Which file formats are supported.
- Which tenant receives the data.
- Which schema is targeted.
- How validation works.
- How duplicate headers are handled.
- What diagnostics are produced.
- Whether import history is recorded.
- Whether rollback or retry behavior exists.

Run import-related tests through:

```bash
npm run test:import
```

## Access Policy

Data access must respect authentication, authorization, tenant context, schema access policy, and route permissions.

Do not add direct database access that bypasses the owning service or policy layer.

## What To Avoid

Avoid:

- Writing direct database code in controllers.
- Mixing provider-specific logic into generic services.
- Creating duplicate data during repeated startup.
- Editing generated model or API output manually.
- Importing production data into test tenants.
- Storing secrets in source-controlled configuration.

