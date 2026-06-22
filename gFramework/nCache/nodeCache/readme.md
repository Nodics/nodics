# nodeCache

The `nodeCache` module implements the supported process-local cache adapter using `node-cache`.

It clone-stores and clone-returns values, supports TTL and explicit non-expiring entries, reports standard misses, consumes atomically within the Node.js event loop, and supports tenant-scoped prefix/key invalidation. It is not distributed; Nodics propagates invalidation events to peer module nodes when this adapter is active.

Projects may override the connection or cache services in later layers while preserving the declared adapter capabilities and operation envelopes.
