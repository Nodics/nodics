# nSearch

`nSearch` is the framework search family. It provides search/indexing abstractions, generated search APIs, cache policy integration, and provider extension points for engines such as Elasticsearch.

Use this root module for family-level search ownership and defaults. Provider-neutral search behavior belongs in `nSearch/search`; engine-specific integration belongs in adapter modules such as `nSearch/elastic`.

Search must remain schema-driven, tenant-aware, and governed by configuration. Projects can replace engines or tune policies without changing framework source.

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
