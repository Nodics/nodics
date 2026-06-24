# cache

The `cache` module owns Nodics cache orchestration: layered channel and engine configuration, tenant-partitioned physical keys, API/item/search key creation, adapter dispatch, runtime configuration events, and cross-node invalidation.

Nodics exposes two primary business-cache layers:

- Router/API-response cache: the request pipeline caches full controller responses for cacheable router definitions. Keys are built from the resolved tenant, enterprise, HTTP method, URL/body where applicable, and governed principal context so security boundaries are not shared accidentally.
- DAO/schema-item cache: the database get pipeline caches schema read results behind the DAO/model layer. Keys are built from schema, tenant, query, search options, and read options. Cached values must still pass runtime schema/property read-access policies before being returned.

Both layers use the same adapter contract and layered channel mapping. A cache change is not complete unless router/API-response behavior and DAO/schema-item behavior are reviewed together, including tenant isolation, principal isolation where relevant, TTL semantics, response envelopes, invalidation, and overrideability through later modules.

## Adapter contract

Every supported engine declares `contractVersion`, `supported`, handlers, and truthful capabilities for distribution, atomic consume, TTL, non-expiring TTL, prefix flush, key flush, and serialization. The existing dispatcher validates these declarations before connecting; projects extend the same path by overriding engine metadata and services in later module layers.

TTL `0` means non-expiring. Positive values are seconds. Undefined TTL resolves through channel, engine, then engine-option defaults. Negative and non-numeric values fail with `ERR_CACHE_00009`. Cache misses use `ERR_CACHE_00001`.

## Tenancy and invalidation

API, item, and search operations pass the resolved tenant into storage. Physical keys are partitioned by channel, module, and tenant, so tenant-scoped flushes cannot remove another tenant's entries. Write, update, and remove pipelines call `invalidateResource`, which resolves layered channel mappings instead of hardcoding an engine or channel.

Schema save, update, and remove pipelines invalidate both affected cache layers: router/API-response cache for generated endpoints that may expose the changed schema data, and DAO/schema-item cache for direct model reads. Invalidation must continue to use `invalidateResource` rather than bypassing layered channel resolution.

Shared adapters such as Redis invalidate the shared store directly. Process-local adapters publish the configured `cacheInvalidation` event to peer module nodes; listeners suppress republication to prevent loops.

For release readiness, run the fail-closed Redis gate against an isolated Redis endpoint:

```bash
NODICS_CACHE_REDIS_URL=redis://127.0.0.1:6379 npm run test:cache:release
```

## Security and customization

Public mutation routes require `runtimeConfigAdminUserGroup` plus `cache.flush`, `cache.configuration.router.update`, or `cache.configuration.item.update`. Flush routes use `DELETE`; configuration routes use `POST`. Service-level validation rejects tenant or module scope changes even when the service is called outside the router.

Projects may override channel mappings, engine selection, capabilities, handlers, invalidation transport, and permissions through normal hierarchy layers. Overrides must preserve tenant isolation, capability honesty, response envelopes, diagnostics, and fail-closed security behavior.

## Diagnostics

`DefaultCacheService` records lightweight process-local diagnostics for all cache operations that pass through the orchestration layer. Metrics are grouped by module, tenant, channel, and operation, and track hit, miss, success, error, latency total, max latency, last result, and last error code.

Configuration lives under `cache.diagnostics`:

```js
{
    enabled: true,
    includeTenant: true
}
```

Use `DefaultCacheService.getCacheMetricsSnapshot(filter)` to read counters and `DefaultCacheService.resetCacheMetrics()` in tests or controlled diagnostics flows. Projects may override or forward these diagnostics to an external observability system from a later module layer, but must not bypass the cache service operation contract.

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

`DefaultCachePolicyService` centralizes the decision to cache router/API responses and DAO/schema-item results. The policy preserves legacy `UTILS.isApiCashable` and `UTILS.isItemCashable` behavior, then applies layered enterprise guardrails from `cache.cacheability`.

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
