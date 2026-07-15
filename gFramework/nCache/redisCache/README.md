# redisCache

The `redisCache` module implements the supported distributed cache adapter using Redis 6.2+ semantics.

Use this module when cache state must be shared across Nodics nodes. Redis is the supported distributed cache path for shared item cache, API cache, search cache, auth/session acceleration, and other cross-process cache channels that require one shared backing store.

## Capability

The Redis adapter supports:

- JSON serialization for stored values;
- positive TTL values through Redis expiration;
- explicit non-expiring entries when TTL is `0`;
- standard cache miss errors;
- atomic consume through Redis `GETDEL`;
- tenant-aware storage keys;
- explicit key deletion;
- prefix cleanup through incremental `SCAN`;
- Redis keyspace event subscription for configured expiration events.

Because all nodes share Redis, Nodics does not need redundant peer invalidation events for ordinary distributed cache writes.

## Runtime Flow

1. The cache engine resolves a channel to the Redis engine.
2. `DefaultRedisCacheEngineService.initCache` builds Redis client options from layered configuration.
3. Supported options include `url`, socket host/port/TLS, database, username, password, and client name.
4. The Redis client connects before the engine is exposed to cache channels.
5. `DefaultRedisCacheService` performs put, get, consume, prefix flush, and key flush operations through the canonical cache key builder.
6. Event registration configures `notify-keyspace-events` and subscribes to the configured database event channel.

## Source Contracts

- `src/service/engine/defaultRedisCacheEngineService.js` owns Redis client creation and event subscription.
- `src/service/cache/defaultRedisCacheService.js` owns Redis put/get/consume/flush behavior.
- `test/cacheRedisLive.test.js` owns optional live Redis qualification.
- The provider participates in the generic cache contract owned by `gFramework/nCache/cache`.

## Configuration

Redis connection data must come from layered configuration or secret-backed runtime configuration. Do not hardcode Redis URLs, credentials, database numbers, TLS settings, or key prefixes in services.

Typical engine options:

```js
{
    engine: 'redis',
    options: {
        url: 'redis://127.0.0.1:6379',
        database: 0,
        prefix: 'profile',
        ttl: 30
    }
}
```

For secured environments, keep credentials and TLS settings in governed configuration or secrets.

## Release Gate

Live Redis qualification is optional during normal local development but mandatory for release pipelines that claim Redis support.

Run a guarded live test with an isolated Redis endpoint:

```bash
NODICS_CACHE_REDIS_URL=redis://127.0.0.1:6379 npm run test:suite -- --suite=cache-redis-live
```

Release and CI pipelines should fail closed with:

```bash
NODICS_CACHE_REDIS_URL=redis://127.0.0.1:6379 npm run test:cache:release
```

The release command must use an isolated Redis endpoint. Never point the live gate at shared developer, staging, or production data.

## Extension Path

Projects may customize Redis behavior by:

- contributing Redis engine/channel configuration in later modules;
- overriding `DefaultRedisCacheEngineService` for advanced connection handling;
- overriding `DefaultRedisCacheService` while preserving serialization, TTL, consume, and invalidation semantics;
- adding live-provider tests for project-specific Redis topology.

## Tests

The generic cache adapter contract verifies Redis operation parity through a mocked Redis client. `cacheRedisLive.test.js` verifies the same behavior against a real Redis endpoint when `NODICS_CACHE_REDIS_URL` is supplied.

Run:

```bash
node gFramework/nCache/cache/test/cacheAdapterContract.test.js
npm run test:suite -- --suite=cache-redis-live
npm run quality:docs
```

## What To Avoid

Avoid:

- making Redis required for `npm run test:basic`;
- using shared Redis data for release gates;
- hardcoding Redis credentials or endpoints in source code;
- using Redis without tenant-aware key prefixes;
- replacing `GETDEL` atomic consume with non-atomic get/delete behavior;
- using blocking key scans for prefix cleanup.
