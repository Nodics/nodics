# Storefront

Storefront is the backend experience boundary that answers: “Which website experience applies to this hostname?” It maps an exact hostname to one tenant-owned Storefront, then composes references owned by CMS and Store. It does not own CMS content, Store records, prices, stock, or a frontend application.

Start with [the beginner and developer guide](docs/storefront-foundation.md). The public resolver is `GET /context/resolve`; protected human management is under `/management/:resource` for `storefronts` and `endpoints`.

The module reuses CMS Site and Store reference contracts. Browser clients never receive internal module tokens, and query or body input cannot override the HTTP hostname.

Public context resolution reuses Nodics `DefaultCacheService`. The default `context` channel uses NodeCache for 60 seconds; a deployment can select Redis or Hazelcast through layered `properties.js` without changing Storefront code. Storefront and endpoint mutations invalidate the bootstrap-tenant context cache across applicable nodes. Cache misses and provider outages fall through to authoritative resolution.

Production observability composes with the existing `nSystem` readiness and nCache diagnostics authorities. Authorized human operators can inspect sanitized resolution, latency, cache, and CMS/Store reference counters at `GET /operations/diagnostics` with `storefront.operations.read`; hostname, tenant, token, URL, principal, and payload values are never returned.

Traffic resilience reuses nRouter HTTP rate limiting and `DefaultModuleService` timeout, retry, connection-pool, and circuit-breaker behavior. Storefront adds runtime-configurable identical-host request coalescing, concurrency/queue bounds, and short negative caching for unknown active hostnames. Endpoint changes invalidate positive and negative entries through the same nCache path.

The public API publishes an explicit versioned delivery contract. Clients may send `x-nodics-client-contract-version`; responses expose the effective Storefront contract version, correlation ID, cache policy, and ETag. Compatible conditional requests receive HTTP 304, while unsupported older clients receive HTTP 426. Capacity and rate-limit responses include `Retry-After`.

Successful HTTP 200 resolution also issues an opaque, short-lived context handle. Customer applications send it in `x-nodics-storefront-context` to supported direct delivery routes. The handle contains no readable tenant, enterprise, token, permission, or routing data. Target modules use the service-token-only `/context/introspect` contract, receive only their audience projection, and keep their own domain validation. Missing, expired, wrong-audience, unavailable-cache, and unavailable-Storefront cases fail closed.

The cross-module journey contract proves that Apparel and Electronics hostnames in one tenant and enterprise retain distinct CMS, Product, Pricing, and Inventory context in co-hosted and modular transport modes. Because the handle is a short-lived bearer reference, protect it with TLS, never log or persist it in application storage, and refresh it after expiry; payload overrides cannot combine one handle with another website's scope.

## Verification

```bash
node gExp/storefront/test/storefrontContract.test.js
node gExp/storefront/test/storefrontApiContract.test.js
node gExp/storefront/test/storefrontContextCacheContract.test.js
node gExp/storefront/test/storefrontContextAccessContract.test.js
node gExp/storefront/test/storefrontCrossModuleJourneyContract.test.js
node gExp/storefront/test/storefrontDownstreamHandoffContract.test.js
node gExp/storefront/test/storefrontObservabilityContract.test.js
node gExp/storefront/test/storefrontPerformanceContract.test.js
node gExp/storefront/test/storefrontTrafficResilienceContract.test.js
node gExp/storefront/test/storefrontReferenceTransportContract.test.js
node gExp/storefront/test/storefrontProductionHardeningContract.test.js
node gExp/storefront/test/storefrontPersistenceIntegration.test.js
```
