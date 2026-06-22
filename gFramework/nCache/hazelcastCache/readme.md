# hazelcastCache

The bundled `hazelcastCache` module is an unsupported, fail-closed placeholder. It does not create a local stand-in, claim distributed guarantees, or accept cache operations.

A project may enable Hazelcast only by providing a real layered connection service and cache service, setting `supported: true`, and declaring truthful capabilities for distribution, atomic consume, TTL, serialization, and invalidation. The normal cache engine validator then qualifies that implementation before activation.
