# nSearch

`nSearch` is the framework search family. It provides search/indexing abstractions, generated search APIs, cache policy integration, and provider extension points for engines such as Elasticsearch.

Use this root module for family-level search ownership and defaults. Provider-neutral search behavior belongs in `nSearch/search`; engine-specific integration belongs in adapter modules such as `nSearch/elastic`.

Search must remain schema-driven, tenant-aware, and governed by configuration. Projects can replace engines or tune policies without changing framework source.

## Adding A Search Engine

New search engines must be added as provider modules or project modules behind
the provider-neutral `nSearch/search` contract. For example, Solr, OpenSearch,
Endeca, or a commerce-cloud search provider should be implemented like the
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
