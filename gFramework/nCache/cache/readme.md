# cache

The `cache` module owns Nodics cache orchestration: layered channel and engine configuration, tenant-partitioned physical keys, API/item/search key creation, adapter dispatch, runtime configuration events, and cross-node invalidation.

## Adapter contract

Every supported engine declares `contractVersion`, `supported`, handlers, and truthful capabilities for distribution, atomic consume, TTL, non-expiring TTL, prefix flush, key flush, and serialization. The existing dispatcher validates these declarations before connecting; projects extend the same path by overriding engine metadata and services in later module layers.

TTL `0` means non-expiring. Positive values are seconds. Undefined TTL resolves through channel, engine, then engine-option defaults. Negative and non-numeric values fail with `ERR_CACHE_00009`. Cache misses use `ERR_CACHE_00001`.

## Tenancy and invalidation

API, item, and search operations pass the resolved tenant into storage. Physical keys are partitioned by channel, module, and tenant, so tenant-scoped flushes cannot remove another tenant's entries. Write, update, and remove pipelines call `invalidateResource`, which resolves layered channel mappings instead of hardcoding an engine or channel.

Shared adapters such as Redis invalidate the shared store directly. Process-local adapters publish the configured `cacheInvalidation` event to peer module nodes; listeners suppress republication to prevent loops.

## Security and customization

Public mutation routes require `runtimeConfigAdminUserGroup` plus `cache.flush`, `cache.configuration.router.update`, or `cache.configuration.item.update`. Flush routes use `DELETE`; configuration routes use `POST`. Service-level validation rejects tenant or module scope changes even when the service is called outside the router.

Projects may override channel mappings, engine selection, capabilities, handlers, invalidation transport, and permissions through normal hierarchy layers. Overrides must preserve tenant isolation, capability honesty, response envelopes, diagnostics, and fail-closed security behavior.
