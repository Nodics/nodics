# Storefront Foundation

## What problem does this solve?

An enterprise may operate `apparel.nodics.com` and `electronics.nodics.com` in the same tenant. Each hostname can select a different CMS Site, content catalog, Store, product catalog, language, currency, country, and channel. Storefront holds that customer-experience composition without copying records owned by other modules.

Configure it in this order:

1. CMS creates the Site and owns its content catalog relationship.
2. Store creates commercial or physical Store records.
3. nCatalog owns catalogs; Storefront validates product catalog codes through that existing authority.
4. Storefront creates a `storefront` record referencing one CMS Site and one or more Stores.
5. Storefront creates `storefrontEndpoint` records mapping exact hostnames to that Storefront.
6. After review, operators activate both records. A customer request can then resolve the context.

## The two records

`storefront` is tenant-local and enterprise-owned. Its stable identity is `storefrontCode`. Every default Store, product catalog, locale, currency, or channel must belong to its corresponding list. CMS Site and Store references are checked through their owning modules before persistence.

`storefrontEndpoint` is stored in the configured bootstrap tenant, `default` by default. Nodics needs this small global lookup because the hostname discovers the target tenant. It maps one normalized exact DNS hostname to `tenantCode`, `enterpriseCode`, and `storefrontCode`. Wildcards, URL strings, ports, IP addresses, user information, and single-label hosts are rejected.

Several endpoint records may point to the same Storefront. One Storefront can reference several Stores, so one CMS Site may intentionally serve those Stores without duplicating CMS ownership.

## Beginner example

Create the tenant-local Storefront through protected management:

```json
{
  "storefrontCode": "electronicsWeb",
  "name": "Electronics UAE",
  "cmsSiteCode": "electronicsSite",
  "storeCodes": ["electronicsDubai", "electronicsAbuDhabi"],
  "defaultStoreCode": "electronicsDubai",
  "productCatalogCodes": ["electronicsProduct"],
  "defaultProductCatalogCode": "electronicsProduct",
  "countryCodes": ["AE"],
  "defaultCountryCode": "AE",
  "localeCodes": ["en-AE", "ar-AE"],
  "defaultLocaleCode": "en-AE",
  "currencyCodes": ["AED"],
  "defaultCurrencyCode": "AED",
  "channelCodes": ["WEB"],
  "defaultChannelCode": "WEB",
  "status": "DRAFT"
}
```

Then create its endpoint:

```json
{
  "hostname": "electronics.nodics.com",
  "storefrontCode": "electronicsWeb",
  "canonical": true,
  "scheme": "https",
  "status": "DRAFT"
}
```

The authenticated request supplies enterprise and tenant ownership. Clients must not supply or trust `enterpriseCode`; Nodics derives it from the human access token. Activate the Storefront first, then its endpoint.

Only one non-retired endpoint may be canonical for a Storefront. Alias endpoints set `canonical` to `false`. An endpoint cannot become `ACTIVE` until its target Storefront is active. Retire every endpoint before retiring the Storefront. Invalid schemes, statuses, lifecycle transitions, and effective dates fail before persistence.

New and updated endpoints receive a derived `canonicalKey` protected by a sparse unique index. The sparse index permits an in-place upgrade from the first Storefront release; update legacy endpoint records once during deployment to backfill the key before relying on database-level race protection.

## APIs and identity separation

Human operators use access tokens and `storefront.backoffice.read` or `storefront.backoffice.manage` on `/management/storefronts` and `/management/endpoints`. Operations users use an access token with `storefront.operations.read` on `/operations/diagnostics`. Both services reject module service identities, providing defense beyond route configuration.

Customer clients use public `GET /context/resolve`. The resolver uses only the trusted HTTP request hostname. A `hostname` in query or body input is ignored. The result excludes tenant and enterprise internals and returns a client-safe Site, Store, catalog, locale, currency, country, and channel context.

### Public delivery contract and client compatibility

The resolver has an explicit, independently versioned delivery contract. A client may send `x-nodics-client-contract-version` with a positive integer. When the header is absent, Storefront assumes the configured minimum supported version. The response includes `x-nodics-storefront-contract-version` and `x-request-id`, allowing support teams to correlate a client response without exposing tenant or enterprise authority.

- A supported client version receives HTTP 200 and `compatibility.state: COMPATIBLE`.
- A client newer than the server receives HTTP 200 and `compatibility.state: DEGRADED`; it must use only fields it understands.
- A client older than `minimumClientContractVersion` receives HTTP 426 with stable error `ERR_STOREFRONT_00015`.
- A malformed or non-positive version receives HTTP 400 with `ERR_STOREFRONT_00012`.

Minor compatible releases may add optional fields. Removing or changing the meaning or type of an existing field requires increasing `contractVersion`; deployments must retain a suitable compatibility window by configuring `minimumClientContractVersion`. These values belong in layered `properties.js`, not `package.json`.

Successful responses use the configured `Cache-Control` policy and an ETag calculated from stable client data, excluding the per-request correlation ID. A repeated request with a matching `If-None-Match` receives HTTP 304 without a response body. HTTP 429 from nRouter and HTTP 503 from Storefront capacity protection include `Retry-After`; clients should wait that duration and then retry with bounded backoff. Exact success, error, header, compatibility, and conditional-response shapes are published in the generated OpenAPI contract.

Example request:

```http
GET /context/resolve HTTP/1.1
Host: electronics.nodics.com
x-nodics-client-contract-version: 1
If-None-Match: "previous-etag"
```

Applications should treat the Storefront response as bootstrap context. They pass only the documented routing hints to CMS, Product, Pricing, and Inventory; they never forward a tenant, enterprise, permission, human token, or internal service token from this payload. Each target module remains authoritative for trusted identity, access, and business validation.

### Opaque context access for direct module delivery

Every successful HTTP 200 resolution issues `contextAccess.handle`, its required header name, and its short lifetime. The value is cryptographically random and opaque: it is not a JWT and contains no browser-readable tenant, enterprise, permission, service token, or routing payload. The client sends it as `x-nodics-storefront-context` to a supported direct delivery endpoint. HTTP 304 does not issue a new handle; refresh the Storefront context when the previous handle expires.

The handle is a short-lived bearer reference. Opacity prevents clients from reading or editing its context, but it does not prove which browser currently possesses it. Use TLS, prevent referrer/header logging, avoid durable browser storage, apply edge controls, and keep the lifetime short. A client presenting the Apparel handle always receives Apparel-derived projections even if its payload claims Electronics values; a stolen still-active handle requires expiry or explicit cache revocation before it becomes inactive. Adding device or session binding later would require an explicit trusted binding contract, not inference inside individual domain modules.

Storefront stores the ephemeral active-state record through `DefaultCacheService`. A target module authenticates itself with the existing module service token and calls `POST /context/introspect` with the handle and its own audience. Storefront returns `active: true` only when the handle exists, is unexpired, permits that audience, and its cache state is readable. It returns only that module's context projection. Invalid syntax, expiry, wrong audience, cache miss, cache outage, and ambiguous state return inactive; the customer request then fails closed.

Product, CMS, Pricing, and Inventory are implemented consumers. Call `GET /online/storefront/items/:itemType/:itemCode` for Product, `GET /delivery/storefront/pages/resolve?path=/home` for CMS, `POST /delivery/storefront/prices/resolve` for Pricing, or `POST /delivery/storefront/stock-availability/evaluate` for Inventory with the handle. Product derives tenant, enterprise, Product Catalog, and locale; CMS derives tenant, enterprise, Site, locale, and channel; Pricing derives tenant, enterprise, Site, Store, currency, and channel; Inventory derives tenant, enterprise, Store, country, and channel. Each replaces or ignores caller scope overrides and retains its own data, identity, bounds, cache, and delivery authority.

For a single Storefront node, the local cache engine is sufficient. Multi-node or autoscaled Storefront deployments must select an enabled shared Redis or supported distributed engine for the `contextAccess` channel; otherwise a handle issued on one node may be inactive on another, safely denying traffic. Never enable cache fallback for this channel: silently moving security state to a different provider would make active-state decisions topology-dependent. Keep TLS, module authentication, rate limits, response bounds, sanitized audit records, and short timeouts enabled on introspection.

This design follows the active-state and protected-introspection model of RFC 7662 and the resource-local enforcement principle of zero-trust architecture. It is deliberately not a general OAuth access token and grants no mutation permission.

```http
GET /nodics/product/v0/online/storefront/items/SKU/IPHONE-17 HTTP/1.1
Host: product.example.internal
x-nodics-storefront-context: <opaque handle from Storefront>
```

```http
POST /nodics/pricing/v0/delivery/storefront/prices/resolve HTTP/1.1
Content-Type: application/json
x-nodics-storefront-context: <opaque handle from Storefront>

{"item":{"itemType":"SKU","itemCode":"IPHONE-17"},"quantity":"1","unitCode":"piece"}
```

```http
POST /nodics/inventory/v0/delivery/storefront/stock-availability/evaluate HTTP/1.1
Content-Type: application/json
x-nodics-storefront-context: <opaque handle from Storefront>

{"item":{"itemType":"SKU","itemCode":"IPHONE-17","unitCode":"piece"}}
```

The response also provides a `downstream` convenience projection. It maps the same resolved values to the parameter names currently consumed by CMS, Product, Pricing, and Inventory. These values are routing hints, not delegated authority: every target module continues deriving tenant and enterprise through its own trusted request pipeline and validating its own business rules.

```json
{
  "downstream": {
    "cms": { "site": "electronicsSite", "locale": "en-AE", "channel": "WEB" },
    "product": { "catalogCode": "electronicsProduct", "locale": "en-AE" },
    "pricing": { "siteCode": "electronicsSite", "storeCode": "electronicsDubai", "currencyCode": "AED", "channelCode": "WEB" },
    "inventory": { "storeCode": "electronicsDubai", "countryCode": "AE", "channelCode": "WEB" }
  }
}
```

When modules run separately, Storefront uses Nodics internal service authentication. Co-hosted deployments call the same owning services locally. `properties.js` controls module paths, timeout, attempts, and local preference; there is no second registry or direct cross-module database authority.

## Lifecycle, operations, and performance

Both records use `DRAFT`, `ACTIVE`, `SUSPENDED`, and `RETIRED`. Hard deletion is rejected so routing history remains auditable. Effective dates can further bound active records. Publish DNS or gateway changes only after records are active; suspend or retire an endpoint before taking the experience offline.

Context resolution uses Nodics `DefaultCacheService`; Storefront does not implement or call a cache provider directly. The deterministic key is an opaque SHA-256 value derived from the normalized trusted hostname. The entry is partitioned by the configured bootstrap tenant, contains a Storefront cache-contract version, and expires after a bounded TTL. By default the `context` channel uses the local NodeCache provider for 60 seconds.

After a Storefront or hostname endpoint is created or updated, schema post-interceptors flush the `storefrontContext:` prefix. The existing nCache contract propagates that invalidation to peer nodes when the selected provider is node-local and suppresses redundant propagation for shared providers. Lifecycle changes, hostname changes, composition-reference changes, and default-context changes therefore use the same invalidation path. The public router cache remains disabled because this service-level cache owns the context key and mutation contract; enabling both would introduce two stale-response paths.

Cache is an optimization, never routing authority. A miss, disabled channel, unsupported cached contract version, or provider failure falls through to database-backed endpoint and Storefront resolution. Failed authoritative resolution is not cached, so an unknown or inactive hostname cannot become a durable negative entry. The TTL bounds stale exposure if an invalidation event is lost.

Configure the provider in a later project, environment, server, or node `properties.js` layer:

```js
module.exports = {
    cache: {
        storefront: {
            channels: {
                context: { enabled: true, fallback: true, engine: 'redis', ttl: 60 }
            }
        }
    },
    storefront: {
        contextCache: { enabled: true, ttlSeconds: 60 }
    }
};
```

Use `engine: 'local'`, `engine: 'redis'`, or `engine: 'hazelcast'` only when that engine is enabled by the effective deployment. A connection URL does not enable an engine. Keep the channel TTL and `contextCache.ttlSeconds` aligned; `contextCache.ttlSeconds` controls each Storefront write. Set `contextCache.enabled: false` for direct authoritative resolution during incident diagnosis. Change `contractVersion` when a later module makes an incompatible cached-value change; older entries will be ignored and refreshed.

### Traffic resilience and runtime behavior

The public resolver uses three existing or composed protection layers:

1. nRouter `httpHardening.rateLimit` owns edge-facing per-process HTTP throttling. Storefront does not implement a second IP-address authority.
2. `DefaultStorefrontTrafficService` coalesces simultaneous requests for the same opaque hostname key and bounds distinct active/queued resolutions.
3. `DefaultModuleService` owns remote CMS/Store timeout, safe retry, connection pooling, and per-target circuit breaking.

All Storefront policies are read from effective `CONFIG` at operation time. A runtime property activation can therefore change TTL, negative TTL, concurrency, queue size, coalescing, timeout, attempts, response bounds, provider preference, readiness requirements, and alert thresholds without changing Storefront source. Existing runtime configuration preview, approval, audit, activation, rollback, and tenant governance remain authoritative; do not add a Storefront-specific configuration database or loader.

```js
module.exports = {
    storefront: {
        traffic: {
            enabled: true,
            requireHttpRateLimit: true,
            coalescingEnabled: true,
            maximumConcurrentResolutions: 64,
            maximumQueuedResolutions: 256,
            maximumInFlightKeys: 512
        },
        contextCache: {
            negativeCachingEnabled: true,
            negativeTtlSeconds: 5
        },
        cmsSiteReference: {
            requestTimeoutMs: 2000,
            maximumAttempts: 2,
            maximumResponseBytes: 262144
        },
        storeReference: {
            requestTimeoutMs: 2000,
            maximumAttempts: 2,
            maximumResponseBytes: 262144
        }
    }
};
```

An unknown or inactive valid hostname receives `ERR_STOREFRONT_00009`. When enabled, that result is cached for only `negativeTtlSeconds` to suppress repeated database scans during invalid-host traffic. Invalid hostname syntax is rejected before cache access and is never cached. Creating, activating, suspending, retiring, or changing an endpoint flushes the same `storefrontContext:` namespace, so activating a previously unknown hostname removes its negative entry. Keep negative TTL lower than the positive TTL.

When capacity is exhausted, excess distinct-host work receives `ERR_STOREFRONT_00014` with HTTP 503. Requests already executing continue. Identical-host requests share one promise and every success or failure removes its in-flight key. Operators may raise or lower concurrency at runtime; queued work uses the latest effective value when the scheduler drains. Large increases must follow database, cache, CMS, Store, connection-pool, and event-loop capacity testing.

Remote reference POSTs are read-only and carry an internal idempotency key, allowing `DefaultModuleService` to apply bounded retry safely. The shared `serviceCommunication.retry` policy decides retryable status/error codes and backoff; `storefront.cmsSiteReference.maximumAttempts` and `storefront.storeReference.maximumAttempts` cap attempts for these calls. The shared circuit breaker prevents repeated network calls during target outages. Redirects are disabled and response sizes are bounded.

The Nodics request pipeline supplies the trusted normalized `request.host`. Query and body hostnames are ignored. `X-Forwarded-Host` is ignored unless both the Storefront `host.trustForwardedHost` policy and deployment proxy trust are deliberately enabled. A forwarded-host policy with disabled nRouter proxy trust is configuration-invalid. Configure the trusted proxy boundary at the environment/server layer; never enable it only to make an individual request work.

Monitor success and `ERR_STOREFRONT_*` by hostname, correlation ID, module, and status code. Use nCache diagnostics for Storefront `context` hit, miss, put, error, and prefix-flush outcomes. Never log access tokens, internal tokens, full customer headers, or unhashed cache-key material. Alert on a falling hit ratio, repeated provider errors, failed invalidation, missing active contexts, CMS/Store reference failures, and latency approaching reference timeouts.

### Production diagnostics and readiness

Storefront registers these checks with the existing secured nSystem readiness details:

- `storefrontConfiguration`: required; validates cache key, TTL, contract-version, and observability thresholds.
- `storefrontCmsReferenceProvider`: required; confirms the CMS Site reference provider service is loaded.
- `storefrontStoreReferenceProvider`: required; confirms the Store reference provider service is loaded.
- `storefrontContextCache`: optional by default because cache failure falls back to authoritative resolution. Set `observability.readiness.cacheRequired: true` only when the deployment intentionally requires cache for traffic readiness.

`GET /operations/diagnostics` returns a `READY`, `DEGRADED`, or `NOT_READY` assessment, stable alert codes, provider availability, observed CMS/Store success and failure counters, aggregate resolution latency and outcomes, and tenant-redacted nCache operation totals. It never returns hostnames, tenant codes, enterprise codes, principals, tokens, dependency URLs, physical cache keys, cached values, or downstream payloads.

Example response shape:

```json
{
  "assessment": { "state": "READY", "alerts": [], "checkedAt": "2026-07-22T12:00:00.000Z" },
  "dependencies": {
    "cmsSiteReferenceProvider": { "status": "AVAILABLE", "observations": { "attempts": 120, "successes": 120, "failures": 0 } },
    "storeReferenceProvider": { "status": "AVAILABLE", "observations": { "attempts": 120, "successes": 119, "failures": 1 } },
    "contextCache": { "status": "AVAILABLE" }
  },
  "resolution": { "resolutions": 1000, "successes": 998, "failures": 2, "cacheHitPercent": 88.4, "averageLatencyMs": 7.6 },
  "cache": { "available": true, "totalOperations": 1120, "operations": {} }
}
```

Counters are process-local and reset on process restart. An environment may override `DefaultStorefrontObservabilityService` to export them to its monitoring platform, but it must retain the same sanitized boundary and must not replace nCache or nSystem as the cache and readiness authorities.

Default operational alerts are:

- `RESOLUTION_FAILURE_RATE`
- `CACHE_ERROR_RATE`
- `CMS_REFERENCE_FAILURE_RATE`
- `STORE_REFERENCE_FAILURE_RATE`
- `AVERAGE_LATENCY_HIGH`
- `MAXIMUM_LATENCY_HIGH`
- `TRAFFIC_CAPACITY_REJECTED`
- configuration failures such as `CACHE_TTL_INVALID`

Tune `storefront.observability.thresholds` through environment or server `properties.js`. Evaluate rate alerts only after `minimumSamples`; this prevents noisy alerts during startup. Threshold changes do not require new services, loaders, or metric stores.

`storefrontPerformanceContract.test.js` supplies repeatable process-level evidence for the cache-hit and diagnostics paths. Its iteration count and budgets come from `storefront.observability.performance`, so capacity-test environments can tighten them without editing the test. This micro-benchmark protects accidental hot-path regressions; it does not replace gateway, network, database, cache-cluster, or full workload capacity testing.

The standard Nodics basic/full test governance includes the Storefront suite automatically. It verifies public schemas and headers, compatibility boundaries, ETag behavior, target-module handoff ownership, cache and invalidation, dependency transport, observability, resilience, persistence integration, and performance. Developers may run the focused suite through `node gFramework/nTooling/bin/nodics-tool.js test:suite --suite=storefront` before the broader repository regression.

`storefrontCrossModuleJourneyContract.test.js` resolves Apparel and Electronics in one tenant and enterprise, issues distinct opaque handles, and proves CMS Site, Product Catalog, Pricing Store/currency, and Inventory Store/country/channel isolation. It repeats the four consumers through Nodics modular transport, verifies service authentication and audience binding, replaces hostile payload scope, and fails closed on expiry or security-state cache outage. This is an integration contract over existing authorities; it does not add a backend-for-frontend or compose domain responses.

Back up bootstrap-tenant endpoints and tenant-local Storefront records. Restore tenant dependencies before enabling endpoint traffic. Deployment health should confirm CMS and Store reference contracts when modules are separate.

## Production activation checklist

1. Create and activate the CMS Site, Stores, and nCatalog catalogs in the target tenant.
2. Create the Storefront in `DRAFT`; verify every default belongs to its configured list.
3. Create one canonical endpoint in `DRAFT`, plus optional non-canonical aliases.
4. Activate the Storefront, then activate its endpoints.
5. Configure DNS and TLS at the edge. Preserve the original `Host` header. Do not trust `X-Forwarded-Host` unless a later deployment module explicitly replaces the resolver behind a trusted-proxy policy.
6. Call `GET /context/resolve` through the real gateway hostname and confirm the resolved values.
7. Resolve the hostname twice and confirm an nCache miss/put followed by a hit. Update a harmless Storefront value and confirm prefix invalidation followed by a refreshed result.
8. Exercise direct CMS, Product, Pricing, and Inventory calls with `downstream`; confirm every target module rejects foreign or invalid context.
9. Test a cache-provider outage. Resolution must continue from authoritative data. Then test a CMS or Store dependency outage: uncached resolution must fail closed and recover on the next request without registry edits or process restart.
10. Call secured nSystem readiness details and `/operations/diagnostics`; confirm the four Storefront checks, sanitized dependency observations, cache totals, and expected alert state.
11. Monitor `ERR_STOREFRONT_00005`, `ERR_STOREFRONT_00009`, `ERR_STOREFRONT_00010`, cache-provider errors, invalidation outcomes, and stable operational alert codes by correlation ID.
12. For shutdown, retire aliases and the canonical endpoint before retiring the Storefront.

## Cache recovery and troubleshooting

- Old values after a management update: verify the post-interceptor completed, inspect nCache prefix-flush diagnostics, and confirm peer invalidation is configured for local cache nodes. Do not manually edit cache storage as a normal operating procedure.
- Cache engine unavailable: keep the database and CMS/Store references healthy; Storefront falls through automatically. Disable `storefront.contextCache.enabled` temporarily only through a governed configuration layer if provider errors are affecting latency.
- Poor hit ratio: verify the edge preserves a stable normalized hostname, confirm TTL is positive, and check that unrelated bulk management updates are not repeatedly flushing the channel.
- Diagnostics show `CMS_REFERENCE_FAILURE_RATE` or `STORE_REFERENCE_FAILURE_RATE`: inspect correlated module transport logs and target module readiness. Diagnostics intentionally omit target URLs and business identifiers.
- Readiness shows the cache down but traffic still succeeds: this is expected when `cacheRequired` is false; authoritative resolution remains available. Make cache required only after capacity testing proves the deployment needs it.
- `TRAFFIC_CAPACITY_REJECTED`: check active, queued, and in-flight counts; identify invalid-host traffic at the trusted gateway; tune nRouter rate limits before increasing Storefront concurrency.
- A newly activated hostname still appears missing: confirm endpoint post-update invalidation succeeded on every local-cache node. A negative entry is never valid beyond its configured short TTL.
- CMS/Store circuit open: restore the target module and allow the shared recovery timeout to enter half-open state. Do not bypass the circuit with a direct transport call.
- Deployment changes cached payload shape: increment `storefront.contextCache.contractVersion`. Existing entries become misses and are safely replaced.
- Restore: restore tenant-local Storefronts and bootstrap-tenant endpoints first, then flush the Storefront context prefix or wait for TTL expiry before reopening traffic.

## Repeatable Electronics and Apparel setup

Use the existing Nodics import authority or the protected management APIs; do not add a Storefront-specific loader.

| Hostname | Storefront | CMS Site | Default Store | Product catalog |
| --- | --- | --- | --- | --- |
| `electronics.nodics.com` | `electronicsWeb` | `electronicsSite` | `electronicsDubai` | `electronicsProduct` |
| `apparel.nodics.com` | `apparelWeb` | `apparelSite` | `apparelDubai` | `apparelProduct` |

Create or import tenant-local Storefront records first. Create hostname endpoints in the configured bootstrap tenant only after their target Storefronts exist. Keep both record types in `DRAFT` during review; activation remains a governed operation rather than an import side effect.

## Extension rules

- Reuse an owning module reference API before adding a lookup.
- Store only customer-experience choices here; do not copy mutable CMS, Store, Product, Pricing, or Inventory data.
- Put application policy in layered `properties.js`, not `package.json`.
- Keep `defaultSampleService.js` as the untouched generator placeholder.
- Add positive, negative, boundary, contract, integration, and regression tests for each new dimension.
- Document implemented behavior here; keep future action plans in ignored root `docs/`.

## Verification

```bash
node gExp/storefront/test/storefrontContract.test.js
node gExp/storefront/test/storefrontApiContract.test.js
node gExp/storefront/test/storefrontContextCacheContract.test.js
node gExp/storefront/test/storefrontCrossModuleJourneyContract.test.js
node gExp/storefront/test/storefrontDownstreamHandoffContract.test.js
node gExp/storefront/test/storefrontObservabilityContract.test.js
node gExp/storefront/test/storefrontPerformanceContract.test.js
node gExp/storefront/test/storefrontTrafficResilienceContract.test.js
node gExp/storefront/test/storefrontReferenceTransportContract.test.js
node gExp/storefront/test/storefrontProductionHardeningContract.test.js
node gExp/storefront/test/storefrontPersistenceIntegration.test.js
node gContent/cms/test/cmsSiteReferenceContract.test.js
node gComm/store/test/storeManagementContract.test.js
node gComm/pricing/test/pricingStoreReferenceProviderContract.test.js
```
