This is a sample readme file for your cache module

Authentication refresh sessions use the layered cache `consume` contract for
atomic read-and-delete semantics. Cache engine modules must implement this
operation atomically and fail closed when the backend cannot guarantee
single-use consumption.

Cache engine metadata declares `distributed` and `atomicConsume` capabilities.
Strict authentication accepts only an engine where both are true and local
fallback is disabled. Redis is currently the supported shared auth engine. The
existing Hazelcast-named module remains explicitly non-distributed until it is
backed by a real Hazelcast client and atomic map removal operation.
