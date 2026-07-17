# cache

The `cache` module owns Nodics cache orchestration: layered channel and engine configuration, tenant-partitioned physical keys, API/item/search key creation, adapter dispatch, runtime configuration events, and cross-node invalidation.

Nodics exposes two primary business-cache layers:

- Router/API-response cache: the request pipeline caches full controller responses for cacheable router definitions. Keys are built from the resolved tenant, enterprise, HTTP method, URL/body where applicable, and governed principal context so security boundaries are not shared accidentally.
- DAO/schema-item cache: the database get pipeline caches schema read results behind the DAO/model layer. Keys are built from schema, tenant, query, search options, and read options. Cached values must still pass runtime schema/property read-access policies before being returned.

Both layers use the same adapter contract and layered channel mapping. A cache change is not complete unless router/API-response behavior and DAO/schema-item behavior are reviewed together, including tenant isolation, principal isolation where relevant, TTL semantics, response envelopes, invalidation, and overrideability through later modules.

For user-facing cache concepts, configuration examples, invalidation rules, diagnostics, and troubleshooting, read [How Cache Works](../../../gDocs/platform/how-cache-works.md). This module README is the implementation contract for the shared cache capability.

## What cache means in Nodics

In Nodics, cache is a controlled acceleration layer around source-of-truth behavior. It stores safe results that can be rebuilt from APIs, services, database models, search indexes, auth/runtime state, or provider systems. It is not an authority for business data, security rules, or runtime decisions.

Cache can be applied at different layers:

- route metadata enables router/API-response cache;
- schema metadata and database get pipelines enable DAO/schema-item cache;
- search/index behavior enables search query cache;
- security/runtime modules can use cache only when invalidation and tenant/principal isolation are strict.

Each layer must document what is cached, who owns the cached value, how the key is built, how long the value can live, what invalidates it, and what tests prove the behavior.

## Adapter contract

Every enabled engine declares `contractVersion`, handlers, and truthful capabilities for distribution, atomic consume, TTL, non-expiring TTL, prefix flush, key flush, and serialization. The existing dispatcher validates these declarations before connecting; projects extend the same path by overriding engine metadata and services in later module layers.

Cache activation is governed only by layered Nodics configuration. `cache.enabled: false` disables cache startup and runtime cache reads/writes. Enabled engines start during application startup even when no enabled channel currently uses them, so infrastructure readiness is validated early. If an enabled engine cannot connect, startup fails; connection properties such as Redis URLs are values only and must not enable cache behavior by themselves. Enabled channels bind to their configured enabled engine, while disabled channels skip cache reads/writes.

TTL `0` means non-expiring. Positive values are seconds. Undefined TTL resolves through channel, engine, then engine-option defaults. Negative and non-numeric values fail with `ERR_CACHE_00009`. Cache misses use `ERR_CACHE_00001`.

## Configuration model

Cache configuration has four main parts:

- global activation and diagnostics under `cache.enabled` and `cache.diagnostics`;
- cacheability policy under `cache.cacheability`;
- invalidation behavior under `cache.invalidation`;
- channels and engines under `cache.default.channels` and `cache.default.engines`.

Channels represent cache purposes such as `router` and `schema`. Engines represent provider implementations such as `local` or `redis`. Enabled channels bind to enabled engines. Enabled engines are validated at startup so provider problems fail early instead of appearing as silent cache misses later.

Router, schema, and auth channel mappings can redirect a specific route, schema, or tenant to a different cache channel:

```js
{
    cache: {
        routerCacheChannelNameMapping: {
            // getProducts: 'productApiCache'
        },
        schemaCacheChannelNameMapping: {
            // product: 'productItemCache'
        },
        authCacheChannelNameMapping: {
            // default: 'authCache'
        }
    }
}
```

Use layered properties for provider selection, TTL, channel mapping, cacheability limits, and invalidation behavior. Do not hardcode provider choices or connection values in business services.

## Tenancy and invalidation

API, item, and search operations pass the resolved tenant into storage. Physical keys are partitioned by channel, module, and tenant, so tenant-scoped flushes cannot remove another tenant's entries. Write, update, and remove pipelines call `invalidateResource`, which resolves layered channel mappings instead of hardcoding an engine or channel.

Schema save, update, and remove pipelines invalidate both affected cache layers: router/API-response cache for generated endpoints that may expose the changed schema data, and DAO/schema-item cache for direct model reads. Invalidation must continue to use `invalidateResource` rather than bypassing layered channel resolution.

Shared adapters such as Redis invalidate the shared store directly. Process-local adapters publish the configured `cacheInvalidation` event to peer module nodes; listeners suppress republication to prevent loops. Peer invalidation events must carry an explicit tenant, target module, and channel name before any local flush is applied.

## Error and troubleshooting contract

Cache errors use `ERR_CACHE_*` status definitions. Common operational meanings are:

- `ERR_CACHE_00001`: cache miss; caller should continue to source of truth when a miss is expected.
- `ERR_CACHE_00006`: no cache client is configured for the module/channel.
- `ERR_CACHE_00007`: mutation request escaped the authorized tenant or active module.
- `ERR_CACHE_00008`: selected adapter is disabled, unavailable, or cannot be activated.
- `ERR_CACHE_00009`: adapter contract, TTL, or required capability is invalid.
- `ERR_CACHE_00010`: invalidation event does not include the required tenant, target module, or channel scope.

When cache behavior looks wrong, check the effective `cache` properties, selected channel, selected engine, TTL, key dimensions, tenant, principal context, cacheability decision, invalidation event, and diagnostics snapshot before changing code.

Cache write decisions use `RSN_CACHE_*` reason codes. A skipped cache write should not fail the business request, but it should be visible in diagnostics through `cachePolicyDecision.reasonCode`.

For release readiness, run the fail-closed Redis gate against an isolated Redis endpoint:

```bash
NODICS_CACHE_REDIS_URL=redis://127.0.0.1:6379 npm run test:cache:release
```

## Security and customization

Public mutation routes require `runtimeConfigAdminUserGroup` plus `cache.flush`, `cache.configuration.router.update`, or `cache.configuration.item.update`. Flush routes use `DELETE`; configuration routes use `POST`. Service-level validation rejects tenant or module scope changes even when the service is called outside the router.

Cache configuration routes are operational event changes. Use them for scoped cache enablement, TTL, or cache-policy adjustments that can safely take effect in the running process through the cache event listeners. Do not use them as a hidden persistence or approval system.

When a cache-related change must be previewed, approved, audited, rolled back, or preserved as a tenant/business runtime decision, model it through the governed runtime configuration lifecycle owned by `nDynamo`. The direct cache routes and the `nDynamo` lifecycle may both influence cache behavior, but they have different contracts: cache routes are immediate operational controls; runtime configuration is the persisted control-plane contract.

Projects may override channel mappings, engine selection, capabilities, handlers, invalidation transport, and permissions through normal hierarchy layers. Overrides must preserve tenant isolation, capability honesty, response envelopes, diagnostics, and fail-closed security behavior.

## Cache Adapter Checklist

When adding a cache engine:

- keep router/API-response, DAO/schema-item, and search cache call sites
  provider-neutral;
- add provider behavior through an adapter module or later project module;
- declare `contractVersion`, handlers, and truthful capabilities;
- configure activation and channel mapping through layered `cache` properties;
- preserve tenant partitioning, principal isolation, TTL semantics,
  serialization, invalidation, diagnostics, and fail-closed startup behavior;
- add adapter validation, live-provider qualification where practical, and
  override tests.

## Diagnostics

`DefaultCacheService` records lightweight process-local diagnostics for all cache operations that pass through the orchestration layer. Metrics are grouped by module, tenant, channel, and operation, and track hit, miss, success, error, latency total, max latency, last result, and last error code.

Cacheability decisions and resource invalidations are also recorded through the same diagnostics registry. Policy decisions use the `policyDecision` operation and aggregate accepted/skipped counts by `reasonCode` and cache layer (`router`, `schema`, or `search`). Resource invalidations use the `invalidateResource` operation and aggregate affected resource names and cache types without exposing payload values.

Configuration lives under `cache.diagnostics`:

```js
{
    enabled: true,
    includeTenant: true
}
```

Use `DefaultCacheService.getCacheMetricsSnapshot(filter)` to read counters and `DefaultCacheService.resetCacheMetrics()` in tests or controlled diagnostics flows. Filters support `moduleName`, `tenant`, `channelName`, `operation`, `cacheLayer`, `reasonCode`, and `resourceName`. Projects may override or forward these diagnostics to an external observability system from a later module layer, but must not bypass the cache service operation contract.

## Lightweight benchmark contract

`cacheBenchmarkContract.test.js` is intentionally a deterministic path benchmark rather than a machine-specific load test. It proves router/API-response cache hits bypass controller execution and DAO/schema-item cache hits bypass model query execution, then prints timing evidence for hit and miss paths. Customer or project modules may add heavier load tests later, but this contract keeps the core framework fast-path behavior guarded in the standard cache suite.

Benchmark defaults live under `cache.benchmark` so companies and projects can override them through normal module hierarchy:

```js
{
    iterations: 12,
    simulatedControllerDelayMs: 4,
    simulatedDaoDelayMs: 4
}
```

The printed `routerHitMs`, `routerMissMs`, `itemHitMs`, and `itemMissMs` values are runtime measurements, not configured targets. The workload assumptions that produce those measurements are configurable.

## Cacheability governance

`DefaultCachePolicyService` centralizes the decision to cache router/API responses, DAO/schema-item results, and search query results. The policy preserves legacy `UTILS.isApiCashable` and `UTILS.isItemCashable` behavior where applicable, then applies layered enterprise guardrails from `cache.cacheability`.

Default policy:

```js
{
    enabled: true,
    maxPayloadBytes: 262144,
    allowSensitiveFields: false,
    skipEmptyResults: false,
    skipBinaryPayloads: true,
    logSkippedReason: true,
    handlerFailureMode: 'failClosed',
    policyHandlers: [],
    sensitiveFieldNames: [
        'password',
        'token',
        'accessToken',
        'refreshToken',
        'authorization',
        'apiKey',
        'secret',
        'credential'
    ]
}
```

Skipped cache writes do not fail the business request. The decision is attached to the request as `cachePolicyDecision` with a stable `reason` and `reasonCode`, such as `payloadTooLarge` with `RSN_CACHE_00007` or `sensitiveField` with `RSN_CACHE_00005`. Framework-owned reason codes live in this module's `src/utils/statusDefinitions.js`; properties configure behavior, not canonical code catalogs.

Projects should tune cacheability through layered properties before replacing core services. Add ordered `policyHandlers` when tenant, project, route, schema, or payload-specific rules are needed:

```js
{
    code: 'tenant-cache-policy',
    index: 100,
    handler: 'TenantCachePolicyService.evaluate',
    active: true
}
```

The handler is a normal layered Nodics service method. It receives `(context, decision, handler)` and may return `{ cacheable: false, reason: 'tenantRuleDenied', reasonCode: 'RSN_TENANTCACHE_00001' }` to reject a write with a project-specific code. Project-specific reason codes should be added to the owning project/module `src/utils/statusDefinitions.js`. Core safety checks run first, so handlers extend accepted decisions and do not bypass built-in binary, sensitive-field, serialization, or payload-size protections unless the layered properties explicitly change those protections. `handlerFailureMode: 'failClosed'` rejects cache writes when a configured handler is missing or throws; set it to `'ignore'` only when the project intentionally prefers cache availability over custom-rule enforcement.
