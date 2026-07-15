# nCache

`nCache` groups the cache orchestration module and its Local, Redis, and Hazelcast adapter modules.

- `cache` defines the layered adapter, tenancy, security, and invalidation contracts.
- `nodeCache` is the supported process-local implementation.
- `redisCache` is the supported distributed implementation.
- `hazelcastCache` remains unsupported until a real project-provided adapter overrides it.

Applications customize cache behavior through module configuration and service overrides; they do not modify Nodics core code.

## Cache Layers

Cache behavior must remain tenant-aware, configuration-driven, and safe for
both consolidated and modular runtime. Strict security-sensitive caches, such as
auth/session caches, must use engines that provide the required atomicity and
failure semantics.

Nodics cache guidance covers API-response cache, DAO/schema-item cache,
search-result cache, invalidation, diagnostics, and custom cache-engine
extension. Current behavior must be verified from `nCache/cache`, active cache
configuration, and cache tests.

## Cache Ownership

Cache management is a platform capability, not a simple in-memory helper. Cache must have an owner,
configuration path, invalidation behavior, and failure rule.

When adding cache behavior, document:

- cached object or response;
- owning module and service;
- cache key shape;
- tenant/customer/principal partitioning;
- TTL and non-expiring behavior;
- invalidation trigger;
- provider capability requirements;
- fallback behavior when cache is unavailable;
- diagnostics and tests.

Never use cache as the only source of truth. A cache miss must be recoverable
from the owning source, database, provider, or runtime state.

## Cache Use Cases

Common cache use cases include:

- API response cache for stable read endpoints;
- schema or DAO item cache for repeated persistence lookups;
- search-result cache for expensive search operations;
- auth/session cache where strict distributed invalidation is available;
- runtime/configuration cache where stale values are unacceptable and guarded.

Security-sensitive caches must fail closed when the selected provider cannot
meet the required distributed behavior.

## Extension Contract

New cache engines must provide clear contracts for put, get, flush,
invalidation, diagnostics, tenant scoping, and distributed behavior. Projects
add engines through adapter modules and layered configuration, not by changing
framework call sites.

## Adding A Cache Engine

New cache engines must be implemented as adapter modules or project modules
behind the `nCache/cache` adapter contract. For example, Memcached, Aerospike,
or a cloud cache service is added by declaring truthful capabilities and
handlers, not by changing router, DAO, or search cache call sites.

The implementation path is:

1. Create an owned cache adapter module.
2. Contribute layered `cache.engines` and `cache.channels` configuration for
   activation, handler names, TTL defaults, serialization, and channel mapping.
3. Declare truthful capabilities for distribution, TTL, non-expiring TTL,
   atomic consume, prefix flush, key flush, serialization, and diagnostics.
4. Implement get, put, consume, flush, invalidate, and diagnostics behavior
   through the cache adapter contract.
5. Preserve tenant partitioning, principal-sensitive cache keys, invalidation
   transport, security fail-closed behavior, and response envelopes.
6. Add tests for adapter validation, engine startup, cache hits/misses,
   invalidation, tenant isolation, failure behavior, and later-module
   overrides.

Connection URLs, credentials, cluster topology, namespaces, and channel choices
must come from layered configuration or governed runtime layers.
