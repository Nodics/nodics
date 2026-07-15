# hazelcastCache

The bundled `hazelcastCache` module is an unsupported, fail-closed Hazelcast adapter boundary. It is present so projects have a clear provider slot, but the framework does not ship a working Hazelcast client implementation.

Use this module only as the override target for a real project-owned or provider-owned Hazelcast adapter. The bundled services reject activation and cache operations by design.

## Capability Status

The bundled module:

- does not create a Hazelcast client;
- does not fall back to local cache;
- does not claim distributed guarantees;
- rejects put, get, consume, prefix flush, and key flush operations;
- rejects schema/router channel activation;
- rejects event registration.

This fail-closed behavior prevents a project from accidentally believing it has a distributed cache when no real Hazelcast adapter has been qualified.

## Source Contracts

- `src/service/engine/defaultHazelcastCacheEngineService.js` rejects activation with `ERR_CACHE_00008`.
- `src/service/cache/defaultHazelcastCacheService.js` rejects all cache operations with `ERR_CACHE_00008`.
- `config/properties.js` is the provider-local configuration contribution point.
- The provider participates in the generic cache contract owned by `gFramework/nCache/cache`.

## Extension Path

A project may enable Hazelcast only by providing a real adapter in a later active module.

That adapter must:

- provide a real Hazelcast connection service;
- provide a real cache service for put, get, consume, flush by prefix, and flush by keys;
- declare truthful capabilities for distribution, TTL, serialization, atomic consume, and invalidation;
- read endpoints, credentials, cluster names, TLS, namespaces, and retry policy from layered configuration or secrets;
- preserve tenant-aware keying;
- include deterministic adapter tests;
- include guarded live-provider tests before production activation.

## Configuration

Do not enable Hazelcast by changing only a flag. A valid implementation needs connection configuration, capability metadata, cache service behavior, event handling, and tests.

Provider selection must remain layered. A customer project should activate Hazelcast through project/environment/server/node configuration after the adapter is implemented and qualified.

## Tests

The generic cache adapter contract verifies the bundled module fails closed. A real Hazelcast adapter must add its own deterministic and live-provider tests.

Run the current fail-closed contract with:

```bash
node gFramework/nCache/cache/test/cacheAdapterContract.test.js
npm run quality:docs
```

## What To Avoid

Avoid:

- treating the bundled module as a working distributed cache;
- replacing fail-closed behavior with a local stand-in;
- enabling Hazelcast without a real client and live tests;
- claiming atomic consume, TTL, serialization, or invalidation behavior that is not implemented;
- hardcoding cluster endpoints or credentials in source code;
- bypassing the generic cache adapter contract.
