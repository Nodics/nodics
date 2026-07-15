# search Module

`search` is the provider-neutral search capability inside `nSearch`. It owns search facades, controllers, route contracts, index definitions, fallback behavior, cache policy integration, and shared search lifecycle rules.

Use this module for search behavior that should apply across engines. Engine-specific connection and query adapter behavior belongs in modules such as `nSearch/elastic`.

Search extensions should be driven by schemas, index definitions, layered configuration, and tests. Do not hardcode one project's indexing strategy into framework defaults.

## Capability

The module contributes:

- secured schema-level search route definitions;
- secured index-level search route definitions;
- generated search service templates in `src/service/common.js`;
- provider-neutral controller and facade structure;
- `SearchEngine` runtime state for active engine options, connection options, connection, and active indexes;
- `SearchError` for normalized search failure handling;
- source-owned index definition slots in `src/search/indexes.js`;
- pipeline extension points for indexing, querying, refresh, health, remove, schema, and cache behavior;
- tests for route contracts, service pipeline dispatch, request mapping, indexing service behavior, and cache policy.

The service template maps search operations to pipeline names. Generated schema services use this structure so every schema-specific search API follows the same provider-neutral dispatch path.

## Runtime Flow

1. A secured search route, service, or internal process receives a search operation.
2. The request resolves module, tenant, schema model, and index name.
3. The provider-neutral service retrieves the active `SearchModel` through `NODICS.getSearchModel`.
4. The operation dispatches into the matching search pipeline.
5. The active provider adapter maps the request to engine-specific client calls.
6. Cache policy is evaluated before eligible search results are written into cache.
7. Errors are normalized as `SearchError` values.

The contract test verifies pipeline dispatch for refresh, health, exists, get, search, save, bulk, remove, remove-by-query, schema, index removal, and indexing preparation.

## Route Contract

Search routes must remain secured. The route contract currently verifies schema and index operations for:

- refresh;
- cluster/index health;
- exists;
- get;
- search;
- save;
- bulk;
- remove;
- remove by query;
- schema get/update;
- index execution.

When adding or changing search routes, update route definitions, generated context, route contract tests, access groups, and documentation together.

## Index Definitions

Index definitions belong in `src/search/indexes.js` for the module that owns the searchable data. A definition should describe the owned schema/index, identity property, indexing processors, indexed properties, tenant/customer partitioning, refresh behavior, and cache expectations.

Keep provider-neutral index ownership in this module family. Engine-specific options belong in provider configuration or adapter modules.

## Engine Adapter Checklist

When adding a new search engine:

- keep facades, controllers, routes, cache policy, and generated search APIs
  provider-neutral;
- add engine-specific behavior in an adapter module or later project module;
- configure the active engine through layered `search` properties;
- map schema/index definitions to provider indexes without hardcoding one
  customer's model strategy;
- preserve tenant context, diagnostics, error envelopes, fallback behavior, and
  cache invalidation;
- test activation, query behavior, indexing behavior, disabled-engine behavior,
  failures, and later-module overrides.

## Tests

Run focused provider-neutral search coverage with:

```bash
node gFramework/nSearch/search/test/searchRouteContract.test.js
node gFramework/nSearch/search/test/searchServicePipelineContract.test.js
node gFramework/nSearch/search/test/searchControllerRequestMapping.test.js
node gFramework/nSearch/search/test/searchCachePolicyContract.test.js
node gFramework/nSearch/search/test/indexerServiceContract.test.js
npm run quality:docs
```

## What To Avoid

Avoid:

- adding Elasticsearch/OpenSearch/Solr client calls to provider-neutral services;
- creating unsecured search routes;
- resolving search models without tenant context;
- caching sensitive search payloads outside the shared cache policy;
- putting customer-specific ranking, fields, or aliases into framework defaults;
- editing generated schema search services manually.
