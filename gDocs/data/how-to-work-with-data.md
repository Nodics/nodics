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

## Schema Definitions

Schemas are the starting point for models, DAO behavior, services, facades, controllers, routers, and generated APIs.

Treat schema definitions as source definitions. They affect:

- persistence models;
- generated CRUD behavior;
- services and facades;
- route/API contracts;
- search indexes;
- validators and interceptors;
- import/export behavior;
- OpenAPI output;
- generated schema, CRUD, API, and scenario tests;
- runtime governance and access policies.

Do not edit generated model or API output to change schema behavior. Change the schema definition, regenerate, and validate.

## Schema Extension

Nodics supports layered schema contribution and override behavior. A later project module may extend, replace, or refine schema definitions when the capability contract allows it.

When changing a schema through a later module, document:

- the original owning module;
- the later module that contributes the change;
- the fields added, removed, or changed;
- generated artifacts affected;
- migration or data compatibility impact;
- tenant and access-policy impact;
- tests proving the default schema and override schema behavior.

## Nested And Referenced Data

Data may be embedded, nested, or referenced depending on the business model.

Use embedded or nested data when the child data belongs fully to the parent lifecycle. Use references when records have their own lifecycle, permissions, ownership, or reuse.

For referenced data, document:

- referenced schema;
- relationship cardinality;
- lookup behavior;
- delete/update impact;
- tenant boundary;
- import/export representation.

## Database Providers

Nodics supports database behavior through provider modules.

For example, MongoDB and Cassandra support live under their own provider areas. If a project needs another database such as Oracle, add it as a provider module with its own connection handling, DAO behavior, configuration, tests, and documentation.

Do not put Oracle-specific behavior into the generic database layer.

## Adding A New Database Provider

A new provider defines:

- Connection configuration.
- Connection lifecycle.
- Model or query abstraction.
- DAO operations.
- Tenant-aware database resolution.
- Error handling.
- Health diagnostics.
- Tests for normal and failure behavior.
- Documentation explaining how projects activate it.

The generic database capability describes the contract. The provider module implements it.

## Data Access Layer

The data access layer owns persistence operations and protects the rest of the application from provider-specific details.

Business behavior calls services or facades. Controllers do not directly query the database. Provider-specific DAO logic lives in the provider module or project module that owns that implementation.

When adding a new DAO function, document:

- target schema;
- input contract;
- output contract;
- tenant behavior;
- error and retry behavior;
- provider-specific assumptions;
- tests for default and failure paths.

## Initial Data

Initial data is loaded during startup when the system needs baseline records.

Use initial data for required records such as core groups, permissions, or mandatory catalog entries.

Initial data is idempotent. Starting the server twice does not create duplicate records.

## Sample Data

Sample data is optional data used for demonstrations, testing, or local development.

Sample data is not required production data.

## Import And Export

Nodics supports import and export flows for structured data.

For a business-oriented data hub pattern, read [How To Use Nodics As Data As A Service](how-to-use-nodics-as-data-as-a-service.md).

## Data Feeding Patterns

Nodics supports two main ways to feed data into the platform.

### Push-Based Import

In push-based import, an external system calls Nodics import APIs and sends the data to Nodics.

Use this pattern when the source system controls when data should be delivered.

Examples:

- an ERP system pushes product or inventory updates;
- a partner system pushes customer, order, or catalog records;
- a supplier portal sends product attributes;
- an admin tool uploads an approved import payload;
- a business application pushes data after its own workflow completes.

The flow is:

```text
External system
  -> Nodics import API
  -> import pipeline
  -> filters, validators, processors, interceptors
  -> tenant-aware persistence
  -> events, search indexing, audit, import history
```

The caller may provide the payload or file reference allowed by the route contract. Nodics still owns validation, tenant resolution, access control, diagnostics, and persistence behavior.

### Scheduled File Import

In scheduled file import, data is placed in a configured location and Nodics picks it up through a scheduled process, usually a CronJob.

Use this pattern when the source system produces files on a schedule or cannot call Nodics APIs directly.

Examples:

- supplier CSV files are placed in an import folder;
- ERP exports Excel files every night;
- product catalog JSON files are placed in a governed server import location;
- business users upload approved files to a governed server location;
- a CronJob checks for pending files every few minutes or hours.

The flow is:

```text
External system
  -> configured file location
  -> Nodics CronJob or scheduled trigger
  -> import service
  -> import pipeline
  -> filters, validators, processors, interceptors
  -> tenant-aware persistence
  -> events, search indexing, audit, import history
```

Scheduled file import can use JSON, JavaScript data definitions, Excel, CSV, or any other supported file processor. The source system or operations process is responsible for placing files in the expected Nodics import location. Nodics is responsible for reading only the configured files, validating them, importing them through the same governed pipeline, and recording diagnostics.

Remote import adapters are a specialized scheduled file import pattern. They are used when Nodics must directly pull or stage files from SFTP, object storage, partner APIs, HTTPS pulls, enterprise file gateways, or similar external locations before running the import pipeline. This requires a project or provider source to be selected, configured, governed, and tested.

Both patterns must enter the same governed import lifecycle. Do not create a separate persistence path just because the source is API-based, file-based, scheduled, or remote.

An import process explains:

- Which file formats are supported.
- Which tenant receives the data.
- Which schema is targeted.
- How validation works.
- How duplicate headers are handled.
- What diagnostics are produced.
- Whether import history is recorded.
- Whether rollback or retry behavior exists.

Direct remote pull stays gated until a project or provider module owns the production adapter, source configuration, tenant/module allowlists, checksum policy, staging behavior, sanitized diagnostics, and live integration tests. Do not expose a public remote-import route for a source that has only deterministic framework tests.

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
