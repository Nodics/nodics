# redisCache

The `redisCache` module implements the supported distributed cache adapter using Redis 6.2+ semantics.

Values use JSON serialization. Positive TTL values use Redis expiration, TTL `0` is non-expiring, atomic consume uses `GETDEL`, prefix cleanup uses incremental `SCAN`, and explicit key cleanup uses namespaced deletion. Because all nodes share the store, Nodics does not publish redundant peer invalidation events for this adapter.

Set engine options such as `url`, socket/TLS, database, username, and password through layered configuration. Run `NODICS_CACHE_REDIS_URL=... npm run test:cache:redis-live` against an isolated Redis endpoint for guarded integration qualification.
