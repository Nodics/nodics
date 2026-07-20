# nSearch

`nSearch` is the search capability group. It separates the business meaning of
an index and query from the external engine that stores and searches documents.

Initialized search providers contribute optional readiness and close their
unique connections through the central runtime lifecycle contract. Provider
modules retain connection ownership; the lifecycle service only orders hooks.

`nSearch` is the framework search family. It provides search/indexing abstractions, generated search APIs, cache policy integration, and provider extension points for engines such as Elasticsearch.

Use this root module for family-level search ownership and defaults. Provider-neutral search behavior belongs in `nSearch/search`; engine-specific integration belongs in adapter modules such as `nSearch/elastic`.

Search must remain schema-driven, tenant-aware, and governed by configuration. Projects can replace engines or tune policies without changing framework source.

## Choose A Search Module

| Module | Role | Current maturity |
| --- | --- | --- |
| [search](search/README.md) | Provider-neutral schemas, routes, indexing, query, cache, and error contract | Production-ready capability |
| [elastic](elastic/README.md) | Elasticsearch client and operation adapter | Guarded provider |

Another engine such as OpenSearch or Solr belongs in its own provider module
behind the `search` contract. Do not place its client calls in the group or
generic capability.

## Module Family

The search family is split by responsibility:

- `search` owns provider-neutral search APIs, generated search service templates, secured route contracts, index definition structure, cache policy integration, pipeline dispatch, search errors, and shared lifecycle rules.
- `elastic` owns Elasticsearch-specific configuration, connection handling, raw search model loading, operation mapping, and provider client calls.

This split is important for framework extension. A project can replace Elasticsearch, add OpenSearch/Solr, tune ranking, or change indexing rules through active modules and layered configuration while the rest of Nodics continues to call the provider-neutral search contract.

## Capability

`nSearch` supports:

- source-owned index definitions in `src/search/indexes.js`;
- secured schema-level search routes;
- secured index-level search routes;
- search model lookup through tenant, module, schema, and index context;
- indexing, refresh, health, exists, get, search, save, bulk, remove, remove-by-query, schema, and index lifecycle operations;
- pipeline dispatch for search operations;
- cacheability policy integration for search results;
- provider adapter registration and replacement;
- normalized `SearchError` behavior.

## Search Index Definitions

Search indexes are source definitions. Modules that expose searchable data
should declare index ownership in `src/search/indexes.js` and keep index
behavior aligned with schemas, routes, services, cache policy, tests, and
generated context.

An index definition should document:

- owning module and schema;
- indexed fields;
- tenant/customer partitioning;
- indexing trigger;
- refresh behavior;
- search route/API exposure;
- cache interaction;
- fallback behavior when search is unavailable;
- diagnostics and tests.

Do not make engine-specific index names or credentials part of generic search
source code. Those belong to layered configuration or governed runtime/secret
layers.

## Indexing And Retrieval Flow

A search flow normally includes:

1. Source data changes through the owning schema/service.
2. Indexing service receives the record or batch.
3. Provider-neutral search service resolves effective engine/configuration.
4. Engine adapter writes, refreshes, queries, or deletes provider-specific
   documents.
5. Search route or service returns normalized results.
6. Diagnostics capture failures, retries, and indexer logs.

Projects may tune ranking, fields, filters, provider selection, and fallback
policy through later modules and configuration.

## Adding A Search Engine

New search engines must be added as provider modules or project modules behind
the provider-neutral `nSearch/search` contract. For example, Solr, OpenSearch,
Endeca, or a commerce-cloud search provider uses the
existing `elastic` adapter shape, not by changing search call sites for one
engine.

The implementation path is:

1. Create an owned engine module or project module.
2. Contribute layered `search` configuration for the active engine, timeout,
   fallback behavior, connection handler, credentials, index naming, and engine
   options.
3. Implement engine-specific indexing, querying, refresh, and error handling
   behind the shared search service/adapter contract.
4. Preserve schema/index definitions, tenant context, cache policy,
   diagnostics, fallback-to-database semantics where enabled, and route
   contracts.
5. Add tests for engine activation, disabled engine behavior, query/index
   contracts, failure handling, cache interaction, and later-module override
   behavior.

Endpoints, credentials, index names, aliases, tenant routing, and provider
topology must come from layered configuration or governed runtime layers.

## Configuration

Search configuration belongs in layered `properties.js` files and governed runtime/secret layers. Configuration should define:

- active engine name;
- engine connection handler;
- schema/index handler;
- host or provider endpoint aliases;
- retry, timeout, refresh, health, search, save, bulk, remove, and schema options;
- index naming and alias policy;
- tenant/customer routing policy;
- fallback and cacheability behavior.

Do not place engine endpoints, credentials, customer-specific index names, tenant mappings, or target topology directly into provider-neutral source code.

## Tests

Search behavior is covered through focused contract tests in `nSearch/search` and `nSearch/elastic`. Run:

```bash
node gFramework/nSearch/search/test/searchRouteContract.test.js
node gFramework/nSearch/search/test/searchServicePipelineContract.test.js
node gFramework/nSearch/search/test/searchCachePolicyContract.test.js
node gFramework/nSearch/elastic/test/elasticConnectionHandlerContract.test.js
node gFramework/nSearch/elastic/test/elasticSearchModelOperationContract.test.js
npm run quality:docs
```

## What To Avoid

Avoid:

- putting Elasticsearch-specific logic into provider-neutral search services;
- hardcoding index names, aliases, credentials, or host URLs in source files;
- bypassing tenant context when resolving search models;
- caching search results without the centralized cacheability policy;
- creating search routes that are not secured;
- editing generated search artifacts manually.

## Operations And Qualification

Search is usually a derived view of authoritative data. Define reindex,
reconciliation, alias/version migration, refresh, backup, recovery, outage,
fallback, and stale-result behavior. Monitor indexing lag, rejected documents,
query and bulk latency, error rate, cache effects, index size, and tenant
isolation.

Provider-neutral deterministic tests do not qualify an external cluster. Run
guarded live tests for connection, health, indexing, querying, failure,
recovery, and cleanup before production enablement.

## Continue

- Generic search contract: [search](search/README.md)
- Elasticsearch provider: [elastic](elastic/README.md)
- Provider maturity: [Provider And Capability Maturity Matrix](../../gDocs/reference/provider-capability-maturity-matrix.md)
- Public platform guide: [How Platform Capabilities Work](../../gDocs/platform/how-platform-capabilities-work.md)
