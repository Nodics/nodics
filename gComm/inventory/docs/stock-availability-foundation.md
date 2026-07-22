# Stock ON_HAND Availability Foundation

## Business Meaning

Availability reports recorded ON_HAND, active reservation holds, and `AVAILABLE_TO_SELL = ON_HAND - reservedQuantity` across Warehouses selected by Stock Sourcing. It is not an allocation, available-to-promise delivery date, or guaranteed fulfilment.

The service follows one authority path:

`request context → Stock Sourcing → active Pool memberships → Stock Balances → Units conversion → exact total and evidence`

It creates no Availability table and changes no Stock. Online Inventory remains authoritative; staged publishing applies to Inventory configuration, not operational balances.

## Operating Flow

1. Activate Warehouses, Pools, memberships, sourcing Policy, and Rules in Online Inventory.
2. A trusted module calls `POST /nodics/inventory/v0/references/stock-availability/evaluate` with context and item identity.
3. Inventory resolves ordered Pools and active/effective memberships, deduplicates Warehouses, reads matching enterprise-scoped balances, converts Units through the Units authority, and adds decimal strings exactly.
4. The response returns ON_HAND, reserved, and AVAILABLE_TO_SELL totals, Pool/Warehouse order, balance evidence, revisions, and evaluation time.
5. A zero result is valid when no Pool, Warehouse, or Balance matches.

### Direct Storefront delivery

An anonymous customer application first resolves its hostname through Storefront and receives a short-lived opaque handle. It calls `POST /nodics/inventory/v0/delivery/storefront/stock-availability/evaluate`, sends that handle in `x-nodics-storefront-context`, and supplies only item type, item code, Unit, optional target scale, and optional evaluation time.

Inventory introspects the handle for the `inventory` audience with its module service identity. The trusted projection supplies tenant, enterprise, Store, country, and channel. Browser-supplied `context`, tenant, enterprise, customer segment, zone, or fulfillment fields are not carried into sourcing. Inventory then invokes the existing cached Availability chain; it does not create another availability calculator or store.

The public projection returns item, ON_HAND, reserved, AVAILABLE_TO_SELL, Unit, type, and evaluation time. It deliberately omits enterprise identity, Pool codes, Warehouse codes, Balance identities, revisions, and evidence. Trusted modules continue using `/references/stock-availability/evaluate` when operational evidence is required. Missing, expired, wrong-audience, incomplete, or unavailable context fails with `ERR_INV_00052` rather than accepting browser scope.

## Security And Boundaries

The operational route is module-internal, uses `authSecurity.internalToken.routePermission`, and accepts only service tokens. The public Storefront route grants no mutation authority and must complete audience-bound introspection before evaluation. Enterprise identity comes from trusted authentication or introspection, never request JSON. Configured maximum Warehouses, Balances, evidence entries, target scale, and exact rounding prevent unbounded work. Human/BackOffice administration remains separately permissioned.

Availability caching is implemented through `DefaultStockAvailabilityCacheService` and provider-neutral `DefaultCacheService`. Keys include enterprise, item, Unit, scale, and normalized sourcing context while nCache partitions physical storage by tenant. Explicit historical evaluation bypasses cache by default.

Balance, Pool membership, Pool, Sourcing Policy, and Sourcing Rule writes invalidate the tenant Availability prefix. nCache propagates invalidation for local providers and avoids redundant events for shared providers. Every hit revalidates the referenced Balance revisions before serving quantities, preventing a stale repopulation race from becoming authoritative. Cache failures fall back to direct evaluation; Stock Balance always remains the authority.

Configure `inventory.stockAvailabilityCache` and `cache.inventory.channels.availability` in layered `properties.js`. Select exactly one of `local`, `redis`, or `hazelcast` for the channel.

## Customization And Operations

Layer `inventory.stockAvailability` for bounds, default scale, rounding, and service-token enforcement. Layer `inventory.storefrontContext` for introspection module, bootstrap tenant, local preference, timeout, attempts, and response-size bounds. Replace `DefaultStockAvailabilityService` only through a later module and preserve sourcing authority, enterprise isolation, Units conversion, exact arithmetic, evidence, and read-only behavior. A transport override must preserve the `inventory` audience and fail-closed behavior. Never copy balances into another availability store.

Monitor request latency, sourcing latency, Warehouse/Balance counts, conversion failures, evidence-boundary failures, and zero-result rates without logging sensitive customer context. If Units or persistence fails, fail the request rather than return a partial total.

## Verification

```bash
node gComm/inventory/test/stockAvailabilityFoundation.test.js
node gComm/inventory/test/inventoryStorefrontAvailabilityContract.test.js
npm run build
npm run test:basic
```

Tests cover sourcing order, membership deduplication, exact mixed-Unit ON_HAND/reserved/ATS aggregation, evidence, zero/limit behavior, service-token rejection, and route security.
