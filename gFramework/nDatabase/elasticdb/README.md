# elasticdb Module

`elasticdb` is the Elasticsearch-backed database adapter boundary for `nDatabase`. It provides the module structure where Elasticsearch-specific database persistence behavior can be contributed when a project needs a database-style implementation backed by Elasticsearch.

General search indexing and retrieval belong in `nSearch`. This module is only for database-adapter behavior that participates in the `nDatabase` contract.

## Capability Status

The module currently contributes:

- standard module metadata;
- empty layered configuration;
- empty schema, router, pipeline, enum, status, and utility extension files;
- common and environment-local smoke tests;
- generated LLM context.

It does not currently define a complete Elasticsearch database connection handler, model handler, persistence implementation, or live-provider release gate.

## Extension Path

A project or framework provider implementation may complete Elasticsearch database support by adding:

- provider configuration under the database property namespace;
- connection/client handler service;
- schema/index mapping behavior for database persistence;
- model/query handler service;
- tenant-aware index naming and namespace resolution;
- retry, timeout, bulk operation, refresh, and diagnostics policy;
- deterministic adapter tests;
- guarded live Elasticsearch integration/release tests.

Keep search-facing behavior in `nSearch`. Keep database persistence behavior in this adapter or a later project/provider module.

## Configuration

Connection and index values must come from layered configuration or secrets. Typical Elasticsearch concerns include nodes, cloud id, credentials, TLS, index prefix, tenant namespace, refresh policy, bulk size, retry, and timeout policy.

Do not hardcode endpoint, credential, index, or tenant namespace values in source code.

## Tests

Current tests are smoke-level. A real Elasticsearch database adapter must add focused tests for:

- connection option resolution;
- tenant/index resolution;
- schema-to-index mapping;
- CRUD operation envelopes;
- bulk and refresh behavior;
- sanitized diagnostics;
- live-provider release qualification.

Run the current baseline with:

```bash
npm run structure:audit -- --fail
npm run quality:docs
```

## What To Avoid

Avoid:

- confusing this adapter boundary with `nSearch`;
- presenting the current module as production-ready Elasticsearch database support;
- putting Elasticsearch-specific persistence rules into generic database services;
- hardcoding endpoints, credentials, or index names;
- enabling a provider without deterministic and live-provider tests.
