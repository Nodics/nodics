# cassandradb Module

`cassandradb` is the Cassandra database adapter boundary for `nDatabase`. It provides the module structure where Cassandra-specific configuration, schemas, routes, pipelines, services, and tests can be contributed through the standard Nodics loader.

The current module is an adapter boundary, not a complete Cassandra production implementation. Shared DAO contracts, schema access policy, generated CRUD behavior, tenant database validation, and provider-neutral database lifecycle rules belong in `nDatabase/database`.

## Capability Status

The module currently contributes:

- standard module metadata;
- empty layered configuration;
- empty schema, router, pipeline, enum, status, and utility extension files;
- common and environment-local smoke tests;
- generated LLM context.

It does not currently define a Cassandra connection handler, model handler, query implementation, schema mapper, or live-provider release gate.

## Extension Path

A project or framework provider implementation may complete Cassandra support by adding:

- provider configuration under the database property namespace;
- connection handler service;
- schema handler service;
- model/query handler service;
- tenant-aware database/keyspace resolution;
- retry, timeout, consistency, paging, and diagnostics policy;
- generated service compatibility tests;
- deterministic adapter tests;
- guarded live Cassandra integration/release tests.

Provider-specific behavior belongs in this adapter or a later project/provider module. Do not add Cassandra assumptions to the provider-neutral database layer.

## Configuration

Connection values must come from layered configuration or secrets. Typical Cassandra concerns include contact points, local datacenter, keyspace, credentials, TLS, consistency, pooling, retry, and timeout policy.

Do not hardcode endpoint, credential, keyspace, or datacenter values in source code.

## Tests

Current tests are smoke-level. A real Cassandra implementation must add focused tests for:

- connection option resolution;
- tenant/keyspace resolution;
- schema mapping;
- CRUD operation envelopes;
- query paging and consistency behavior;
- sanitized diagnostics;
- live-provider release qualification.

Run the current baseline with:

```bash
npm run structure:audit -- --fail
npm run quality:docs
```

## What To Avoid

Avoid:

- presenting the current module as production-ready Cassandra support;
- putting Cassandra-specific logic into generic database services;
- hardcoding connection details;
- enabling a provider without deterministic and live-provider tests;
- bypassing generated service contracts and tenant database validation.
