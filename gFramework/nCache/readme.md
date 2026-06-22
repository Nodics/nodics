# nCache

`nCache` groups the cache orchestration module and its Local, Redis, and Hazelcast adapter modules.

- `cache` defines the layered adapter, tenancy, security, and invalidation contracts.
- `nodeCache` is the supported process-local implementation.
- `redisCache` is the supported distributed implementation.
- `hazelcastCache` remains unsupported until a real project-provided adapter overrides it.

Applications customize cache behavior through module configuration and service overrides; they do not modify Nodics core code.
