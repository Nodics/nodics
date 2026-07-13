# search Module

`search` is the provider-neutral search capability inside `nSearch`. It owns search facades, controllers, route contracts, index definitions, fallback behavior, cache policy integration, and shared search lifecycle rules.

Use this module for search behavior that should apply across engines. Engine-specific connection and query adapter behavior belongs in modules such as `nSearch/elastic`.

Search extensions should be driven by schemas, index definitions, layered configuration, and tests. Do not hardcode one project's indexing strategy into framework defaults.

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
