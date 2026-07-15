# elastic Module

`elastic` is the Elasticsearch engine adapter for `nSearch`. It owns Elasticsearch-specific configuration, schemas, route wiring, and pipeline hooks used by the provider-neutral search capability.

Use this module for Elastic connection and engine behavior only. Shared search APIs, cache policy, fallback semantics, and index lifecycle contracts belong in `nSearch/search`.

Endpoints, credentials, index names, and deployment topology must come from layered configuration. Keep this adapter replaceable by preserving the engine contract.

## Capability

The module contributes:

- default Elasticsearch configuration under `search.default.elastic`;
- search data type mapping defaults;
- connection handler wiring through `DefaultElasticSearchEngineConnectionHandlerService`;
- schema handler wiring through `DefaultElasticSearchSchemaHandlerService`;
- Elastic operation defaults for exists, health, save, bulk, search, remove, schema, refresh, and index lifecycle behavior;
- raw search model definition loading from `src/schemas/elasticSearchModel.js`;
- Elastic model operation implementations for create index, refresh, health, exists, get, search, save, bulk, update, remove, remove by query, get schema, update schema, and remove index.

The adapter maps Nodics search model operations to the active Elasticsearch client. Provider-neutral services should not know which client is active.

## Runtime Flow

1. Layered configuration activates the Elastic engine and supplies connection/options.
2. The Elastic connection handler loads raw model definitions and registers them through the search configuration service.
3. Search model operations receive provider-neutral requests from `nSearch/search`.
4. Elastic model functions merge default engine options with request options.
5. The adapter lowercases index/type names and calls the Elasticsearch client.
6. Responses or errors return through the provider-neutral pipeline and error contracts.

## Configuration

Elastic configuration belongs in layered properties or governed runtime/secret layers. Typical settings include:

- connection handler service;
- schema handler service;
- hosts or cloud endpoint aliases;
- log and timeout behavior;
- health, refresh, search, save, bulk, remove, schema, and index lifecycle options;
- data type mapping;
- tenant/index naming policy.

The framework default points to a local Elastic endpoint for development shape only. Customer, environment, server, node, tenant, and production values must override this through governed configuration.

## Extension Path

Projects may customize Elastic behavior by:

- overriding `search.*.elastic` configuration in later active modules;
- replacing the connection or schema handler service;
- overriding Elastic model operation behavior through a later module;
- adding provider-specific pipelines where needed;
- adding live-provider release tests for production Elastic/OpenSearch environments.

If the project needs OpenSearch, Solr, or another engine with different client semantics, create a provider adapter module that preserves the `nSearch/search` contract instead of changing shared search services.

## Tests

Run focused Elastic coverage with:

```bash
node gFramework/nSearch/elastic/test/elasticConnectionHandlerContract.test.js
node gFramework/nSearch/elastic/test/elasticSearchModelOperationContract.test.js
npm run quality:docs
```

Live provider validation should be added before enabling a production cluster.

## What To Avoid

Avoid:

- putting Elastic client calls into provider-neutral search services;
- hardcoding production hosts, credentials, aliases, or index names;
- enabling a production engine without live-provider release tests;
- bypassing search model and pipeline contracts;
- returning raw provider errors that expose connection details;
- assuming Elastic type semantics are valid for every future search engine.
