# Hazelcast Cache

**Maturity: implemented provider; disabled by default; live-cluster qualification required for production.**

The guarded live contract passed locally against a temporary Hazelcast 5.6 member on 2026-07-21. Each deployment must still run the same contract against its target cluster before enabling the provider in production.

`hazelcastCache` implements the provider-neutral `nCache` contract with the official `hazelcast-client` package. It remains disabled by default so deployments select only the provider needed by a channel.

## Capabilities

- distributed-map JSON get and put;
- per-entry TTL and non-expiring entries;
- atomic consume through map removal;
- tenant-scoped key and prefix invalidation;
- connection readiness and central shutdown;
- no redundant peer event when the selected engine is distributed.

## Configuration

Enable the `hazelcast` engine and point a channel to it through layered `cache` configuration. Under engine `options`, configure `clusterName`, `clusterMembers`, `connectionTimeoutMs`, optional TLS/security/client properties, and `mapNamePrefix`. Keep credentials in the approved secret provider, not source control.

Do not call this adapter from business modules. They must use `DefaultCacheService`. Do not enable local, Redis, and Hazelcast for the same logical channel.

## Verification

```bash
node gFramework/nCache/cache/test/cacheAdapterContract.test.js
NODICS_CACHE_HAZELCAST_MEMBERS=127.0.0.1:5701 node gFramework/nCache/hazelcastCache/test/cacheHazelcastLive.test.js --require-live
```

Normal tests use a contract double and skip the guarded live test when no cluster is configured. Production release validation must require a live target matching the deployed Hazelcast version, security, discovery, and topology.

## Continue

- Generic cache contract: [cache](../cache/README.md)
- Provider selection: [nCache](../README.md)
- Public guide: [How Cache Works](../../../gDocs/platform/how-cache-works.md)
