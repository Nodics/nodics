# How Cache Works

Cache is a performance capability that stores safe, repeatable results so Nodics does not have to recompute or reload the same data for every request. It is useful for API responses, database reads, search results, authentication/session acceleration, expensive computed values, and provider lookups.

Cache must never become the source of truth. The source of truth remains the database, source definitions, runtime configuration records, search indexes, event logs, or provider system that owns the business data. Cache is a controlled acceleration layer around that source of truth.

## Beginner Summary

Cache is like a short-term memory for data that is expensive to read or compute.
It can make APIs, database reads, search, authentication checks, and provider
lookups faster.

The important warning is simple:

```text
Cache can speed up truth, but cache is not truth.
```

If data changes, cache must be expired, flushed, or invalidated. Otherwise a
user may see stale data. If permissions change, auth or API cache must also be
invalidated so an old permission result is not reused.

Use cache only when you can answer:

- What exact data is cached?
- Which tenant, user, route, schema, or search query owns the key?
- When does this cached value expire?
- Which save/update/remove/security/configuration event invalidates it?
- What happens if cache is unavailable?

## When To Use Cache

Use cache when the same data is read many times and can safely be reused for a known period or until an invalidation event happens.

Good cache candidates include:

- read-only or mostly-read API responses;
- schema/model reads that are repeated by services or generated CRUD APIs;
- search query results that are expensive to recompute;
- authentication or authorization state that has strict invalidation rules;
- provider lookups where the provider is slow or rate-limited;
- computed values that can be regenerated from source data.

Do not use cache for:

- data that must reflect every write immediately unless invalidation is guaranteed;
- secret values or credential payloads;
- user-specific data unless the cache key includes the governed principal context;
- behavior that should be modeled as source-controlled configuration or governed runtime configuration;
- compensating for slow business logic without understanding the invalidation impact.

## Cache Layers

Nodics supports cache at multiple framework layers. Each layer has a different owner and key strategy.

| Layer | What Is Cached | Owner | Configuration Source | Key Scope |
| --- | --- | --- | --- | --- |
| Router/API cache | Full safe controller response for a route | Router and cache modules | Route metadata plus `cache` properties | Tenant, enterprise, method, URL/body, and governed principal context |
| Schema/item cache | Model or DAO read result behind generated services | Schema/database/cache modules | Schema metadata plus `cache` properties | Tenant, schema, query, search options, and read options |
| Search cache | Repeatable search query result | Search and cache modules | Search/index metadata plus `cache` properties | Tenant, index/schema, query, filters, and search options |
| Auth/runtime cache | Security or runtime acceleration data | Owning security/runtime module plus cache | Owning module configuration and cache properties | Tenant, principal, token/session/stamp, and security context |

Router/API cache belongs near the request pipeline. It can avoid controller execution when the route, tenant, user/security context, and request shape match a cached response.

Schema/item cache belongs behind the persistence service. It can avoid repeated database reads, but cached values must still pass schema/property access-policy checks before being returned.

Search cache belongs around repeatable search operations. It is useful only when indexing and invalidation rules are clear enough to prevent stale search results from being trusted incorrectly.

## Where To Add Cache Behavior

| Need | Change here |
| --- | --- |
| Enable or disable cache globally or by channel | `gFramework/nCache/cache/config/properties.js` or later layered `config/properties.js` |
| Cache a full API response | Route metadata and router/cache configuration |
| Cache generated schema reads | Schema/database/cache metadata and cache configuration |
| Cache search results | Search index/query service and cache configuration |
| Add provider such as Redis | Cache provider module and engine configuration |
| Invalidate data after save/update/remove | Model pipelines and cache service invalidation |
| Add project-specific cacheability rule | Later module policy handler/service override |
| Troubleshoot cache behavior | Cache diagnostics and status/reason codes |

Do not call Redis, local memory, or another cache provider directly from
business controllers. Use the Nodics cache service so tenant scope, channel
mapping, invalidation, diagnostics, and provider fallback stay consistent.

## How Cache Is Configured

Cache configuration is layered like other Nodics configuration. Framework defaults live in `gFramework/nCache/cache/config/properties.js`. Projects, environments, servers, nodes, tenants, or later modules can override the values through the standard hierarchy.

The most important configuration areas are:

```js
{
    cache: {
        enabled: true,
        diagnostics: {
            enabled: true,
            includeTenant: true
        },
        cacheability: {
            enabled: true,
            maxPayloadBytes: 262144,
            allowSensitiveFields: false,
            skipEmptyResults: false,
            skipBinaryPayloads: true,
            handlerFailureMode: 'failClosed',
            policyHandlers: []
        },
        invalidation: {
            crossNode: true,
            eventName: 'cacheInvalidation'
        },
        default: {
            channels: {
                router: {
                    enabled: true,
                    fallback: true,
                    engine: 'local'
                },
                schema: {
                    enabled: true,
                    fallback: true,
                    engine: 'local'
                }
            },
            engines: {
                local: {
                    enabled: true,
                    ttl: 100
                },
                redis: {
                    enabled: false,
                    ttl: 100
                }
            }
        }
    }
}
```

`cache.enabled` controls whether cache starts and whether reads/writes are attempted. Engine connection values such as Redis host, port, or URL are values only; they must not activate cache by themselves.

Channels define cache purposes such as router/API cache and schema/item cache. Engines define the provider implementation such as local memory or Redis. A channel selects an engine. An enabled channel must point to an enabled and initialized engine.

TTL controls expiry. `0` means non-expiring, positive values are seconds, and invalid values fail during cache operation validation.

## Cacheability Reasons

Not every response or read result should be cached. Nodics evaluates cacheability before writing a value.

The cacheability policy can skip writes for reasons such as:

- cacheability policy disabled;
- route or schema is not cacheable;
- payload contains binary data;
- payload contains an empty result when empty results are configured to be skipped;
- payload contains sensitive fields such as password, token, authorization, apiKey, secret, or credential;
- payload cannot be serialized safely;
- payload is larger than `cache.cacheability.maxPayloadBytes`;
- a project-defined policy handler rejected the write;
- a project-defined policy handler failed and `handlerFailureMode` is `failClosed`.

Accepted or skipped write decisions should carry a stable `reason` and `reasonCode`. Framework reason codes use `RSN_CACHE_*` definitions in `gFramework/nCache/cache/src/utils/statusDefinitions.js`. Project-specific reasons should be added by the owning project or module.

## How Cache Works At Runtime

At startup, Nodics builds effective cache configuration from active modules and layered properties. The cache engine service validates enabled engines before binding channels to them. Unsupported or disabled adapters fail closed when selected.

For a cache read:

1. The caller asks the Nodics cache service for a value by channel and key.
2. The cache service resolves the active channel and engine.
3. The key is built with tenant and resource scope.
4. The provider adapter attempts the read.
5. A hit returns the cached value through the normal response contract.
6. A miss returns `ERR_CACHE_00001` and the caller continues to the source of truth.

For a cache write:

1. The business operation produces a response or read result.
2. The cache policy checks route/schema/search metadata and payload safety.
3. If accepted, the cache service writes through the configured engine.
4. If skipped, the business operation still succeeds and diagnostics record why the write was skipped.

For a cache mutation such as flush or configuration update:

1. The route requires the correct runtime configuration group and permission.
2. The service validates tenant and module scope.
3. The cache service applies the flush or publishes the configuration event.
4. Local engines may publish invalidation to peer nodes.
5. Distributed engines such as Redis invalidate shared storage directly.

## Cache Invalidation

Invalidation removes or expires cached values when source data or access rules change.

Invalidate cache when:

- a model is saved, updated, or removed;
- schema, router, search, permission, user-group, or access-policy behavior changes;
- auth/session state changes;
- runtime configuration changes;
- search index data changes;
- provider health or provider data becomes unsafe;
- a project-specific rule says a cached result is no longer valid.

Schema save, update, and remove pipelines invalidate both related cache layers:

- router/API cache for generated endpoints that may expose the changed data;
- schema/item cache for direct generated service or DAO reads.

Invalidation must use the cache service, not direct provider calls. The service resolves channel mappings, tenant scope, module scope, and cross-node behavior.

Process-local engines use the configured `cacheInvalidation` event to tell peer module nodes to flush the same scoped resource. Shared engines such as Redis invalidate the shared store and normally do not need a second peer event for the same key.

## Operational Cache Routes

Cache exposes secured operational routes for flush and scoped API/item cache configuration. These routes are useful for administration and support work while the system is running.

Operational routes require runtime configuration administrator access and permissions such as:

- `cache.flush`;
- `cache.configuration.router.update`;
- `cache.configuration.item.update`.

Use these routes for immediate operational changes. Use `nDynamo` runtime configuration when the change must be previewed, approved, audited, rolled back, or preserved as a business/tenant runtime decision.

## What To Check When Cache Fails

Start with the error code and the layer where the failure happened.

| Symptom | Check |
| --- | --- |
| Cache does not start | `cache.enabled`, selected channel, selected engine, engine `enabled`, adapter contract, and provider connection values |
| Redis test is skipped | `NODICS_CACHE_REDIS_URL` must be exported before running `npm run test:cache:release` |
| Adapter selected but unavailable | Engine capability metadata, connection handler, cache handler, and `ERR_CACHE_00008` |
| Unexpected cache miss | Tenant, module, channel, route/schema mapping, request method, URL/body, query/search options, and TTL |
| Wrong user sees cached data | Router/API key must include governed principal/access context; check route cache metadata and key creation |
| Stale data returned | Confirm save/update/remove pipelines call `invalidateResource`; check cross-node invalidation and provider shared/local behavior |
| Cache write skipped | Inspect `cachePolicyDecision.reasonCode`, sensitive fields, payload size, binary payloads, empty-result policy, and policy handlers |
| Flush fails | Confirm the caller has permission, tenant and module scope match, and the route uses `DELETE` |
| Runtime cache configuration does not apply | Confirm the cache event listener is registered, event target/module is correct, and the configuration contains router or schema identifiers |
| Sensitive values appear cacheable | Check `cache.cacheability.allowSensitiveFields`, `sensitiveFieldNames`, and custom policy handlers |

Useful files and services:

- `gFramework/nCache/cache/config/properties.js` for defaults;
- `DefaultCacheConfigurationService` for channel, engine, key, and TTL resolution;
- `DefaultCacheEngineService` for adapter validation and startup binding;
- `DefaultCacheService` for get, put, consume, flush, invalidation, metrics, and runtime cache events;
- `DefaultCachePolicyService` for cacheability decisions and reason codes;
- `gFramework/nCache/cache/src/utils/statusDefinitions.js` for cache error and reason codes.

## Beginner Decision Checklist

Before adding cache, confirm:

- The route/service/search result is safe to reuse.
- The cache key includes tenant and user/security context when required.
- Sensitive fields such as tokens, passwords, API keys, secrets, and credentials
  cannot be cached accidentally.
- The invalidation path is known and tested.
- The route or schema still works correctly when cache is disabled.
- Metrics or diagnostics can explain hits, misses, skipped writes, and failures.

## Diagnostics

Cache diagnostics are stored in process memory by `DefaultCacheService`.

Use `DefaultCacheService.getCacheMetricsSnapshot(filter)` to inspect:

- operation counts;
- hit, miss, success, error, accepted, and skipped results;
- reason-code counts;
- affected resources;
- cache layers;
- latency totals and latest result/error.

Use `DefaultCacheService.resetCacheMetrics()` in tests or controlled diagnostics flows.

Diagnostics are governed by:

```js
{
    cache: {
        diagnostics: {
            enabled: true,
            includeTenant: true
        }
    }
}
```

Projects may forward diagnostics to an observability platform from a later module layer, but they should not bypass the cache service contract.

## Testing Cache Changes

Run the deterministic cache suite for normal framework changes:

```bash
npm run test:cache
```

Run the Redis release gate when validating distributed cache behavior:

```bash
NODICS_CACHE_REDIS_URL=redis://127.0.0.1:6379 npm run test:cache:release
```

Run broader checks when cache changes touch routing, schemas, search, auth, runtime configuration, or topology:

```bash
npm run test:runtime-overrides
npm run test:config
npm run llm:validate
npm run quality:docs
```

## Customizing Cache

Prefer configuration before code. A project can override:

- channel enablement;
- channel-to-engine mapping;
- engine activation;
- TTL defaults;
- provider connection values;
- router/schema/auth channel name mappings;
- cacheability policy;
- ordered policy handlers;
- invalidation event settings;
- operational route permissions.

Use a new or later provider module when adding a cache engine. The provider must declare its contract version, handlers, and truthful capabilities. Business modules should continue calling the Nodics cache capability instead of calling provider clients directly.

## What To Avoid

Avoid:

- hardcoding Redis, local memory, or any provider in business services;
- using provider connection values as activation switches;
- caching security-sensitive payloads;
- removing tenant or principal context from keys;
- broad production flushes when targeted invalidation is possible;
- using cache as the only copy of business data;
- changing runtime behavior through direct cache events when the change needs approval and rollback;
- adding policy logic in random routers or DAOs instead of `DefaultCachePolicyService` or configured policy handlers.
