# nodeCache

**Maturity: Sample or reference.** The adapter is implemented and tested for
process-local behavior, but it does not provide distributed consistency.

The `nodeCache` module implements the supported process-local cache adapter using `node-cache`.

Use this module when a cache channel should be local to one Node.js process. It is useful for fast local reads and isolated development/test behavior, but it is not a distributed cache. When multiple Nodics nodes run the same capability, invalidation must be propagated through Nodics cache events and topology behavior.

## Capability

The local adapter supports:

- clone-on-write and clone-on-read behavior so cached values do not mutate caller-owned objects;
- positive TTL values;
- explicit non-expiring entries when TTL is `0`;
- standard cache miss errors;
- atomic consume inside the local event loop;
- tenant-aware storage keys;
- prefix and explicit key invalidation;
- event registration through `node-cache` events.

## Runtime Flow

1. The cache engine resolves a channel to the local engine.
2. `DefaultLocalCacheEngineService.initCache` creates a `NodeCache` client from layered engine options.
3. Schema channels initialize only when the target module has raw schema definitions.
4. Router channels initialize only when the target module has router support enabled.
5. `DefaultLocalCacheService` performs put, get, consume, prefix flush, and key flush operations through the canonical cache key builder.

## Source Contracts

- `src/service/engine/defaultLocalCacheEngineService.js` owns local client creation and channel activation rules.
- `src/service/cache/defaultLocalCacheService.js` owns local put/get/consume/flush behavior.
- `config/properties.js` is the provider-local configuration contribution point.
- The provider participates in the generic cache contract owned by `gFramework/nCache/cache`.

## Configuration

Provider-specific defaults are contributed through layered cache configuration owned by the cache module. This provider README describes the behavior; the effective channel and engine selection come from `cache.default`, module-specific cache configuration, and later project/environment/server/node overrides.

Typical engine options include:

```js
{
    engine: 'local',
    options: {
        ttl: 30,
        prefix: 'profile'
    }
}
```

Keep provider selection configurable. Do not hardcode `nodeCache` in business services.

## Extension Path

Projects may customize local cache behavior by:

- changing channel or engine configuration in `config/properties.js`;
- overriding `DefaultLocalCacheEngineService` in a later active module;
- overriding `DefaultLocalCacheService` while preserving operation envelopes;
- contributing focused tests for TTL, tenant keying, invalidation, and clone behavior.

Use local cache when distribution is not required. Use Redis or another qualified distributed adapter when cross-node shared cache state is required.

## Tests

The generic cache adapter contract verifies local behavior, including TTL semantics, clone behavior, atomic consume, tenant-scoped invalidation, and prefix/key flush.

Run:

```bash
node gFramework/nCache/cache/test/cacheAdapterContract.test.js
npm run test:basic
npm run quality:docs
```

## What To Avoid

Avoid:

- using local cache as proof of distributed cache behavior;
- relying on local cache for strict cross-node auth/session state;
- mutating objects after writing them and expecting cache state to change;
- bypassing tenant-aware storage key generation;
- hardcoding local cache selection in framework or project services;
- disabling invalidation events when multiple nodes can serve the same capability.

## Operations And Performance

Local cache consumes the memory of each Node.js process. Bound entry count,
payload size, and TTL for the target workload; monitor heap use, eviction,
hit/miss rate, clone cost, and invalidation failures. A process restart clears
the cache and must not lose authoritative state.

Do not use a local benchmark as evidence for multi-node correctness. Validate
the selected topology, especially when several nodes can serve the same tenant
or capability.

## Continue

- Generic cache contract: [cache](../cache/README.md)
- Distributed cache: [redisCache](../redisCache/README.md)
- Provider selection: [nCache](../README.md)
- Public guide: [How Cache Works](../../../gDocs/platform/how-cache-works.md)
