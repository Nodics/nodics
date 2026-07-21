# Stock Sourcing Foundation

## Purpose And Ownership

Stock Sourcing converts an authenticated enterprise request context into an ordered list of eligible Stock Pool references. A Policy groups Rules; each Rule declares simple criteria and Pools to include or exclude.

Inventory owns this decision. Stock Pools still own only Warehouse membership, Stock Balance owns quantities, and later Availability and Reservation slices consume the result. This foundation does not read or change quantities, promise fulfilment, reserve Stock, call external WMS systems, or execute a workflow or script.

## Business Workflow

1. Create a Policy in `DRAFT`, assign a lower numeric priority when it should run earlier, and choose `FIRST_MATCH` or `COLLECT_MATCHES`.
2. Create Rules under it using configured criteria such as country, zone, store, channel, customer segment, fulfilment type, item type, or item.
3. Reference existing Stock Pools in business order and choose `INCLUDE` or `EXCLUDE`.
4. Activate Pools, Policy, and Rules. An active Rule requires its Policy and every Pool to be active.
5. Evaluate a request. Matching Rules return Pool codes, not Stock promises. An `EXCLUDE` Rule removes and blocks its Pool for that evaluation.
6. Suspend for temporary rollback. Retire every Rule before its Policy. History cannot be deleted.

Example: an INCLUDE Rule for `{countryCode: 'AE', channelCode: ['WEB','APP']}` selects `uae-fulfilment`; a later EXCLUDE Rule for `{fulfillmentType: 'DELIVERY'}` can remove `pickup-only`.

## Data, Matching, And Lifecycle

- `stockSourcingPolicy` owns enterprise identity, Policy code, name, priority, selection mode, status, and effective dates.
- `stockSourcingRule` owns Policy/Rule identity, priority, outcome, declarative criteria, ordered Pool codes, status, and effective dates.
- Identities and parent Policy are immutable. Default states are `DRAFT`, `ACTIVE`, `SUSPENDED`, and `RETIRED`.
- Generated persistence is private and interceptor-protected. The only API is the module-internal sourcing intent described below; no public or BackOffice CRUD exists.
- Criterion values are strings, numbers, booleans, or non-empty arrays. All criteria match; arrays match by overlap.
- Unknown keys, `$` operators, nested objects, and scripts are rejected. Priority plus stable identity makes results deterministic.

## Configuration And Customization

Layer `inventory.stockSourcing` in project, environment, server, node, tenant, or customer `properties.js`. It owns statuses, transitions, selection modes, outcomes, context keys, priority bounds, and maximum Pools per Rule.

To add `projectQualifier`, extend `contextKeys` in a later module. Do not copy the evaluator, accept database queries, embed JavaScript, duplicate Pool membership, or bypass persistence interceptors. A project may replace `DefaultStockSourcingEvaluationService` through service layering while preserving enterprise isolation, deterministic output, and side-effect-free evaluation.

## Security, Operations, Performance, And Recovery

Enterprise identity comes only from authenticated claims. Human and anonymous tokens are rejected.

`POST /nodics/inventory/v0/references/stock-sourcing/evaluate` accepts `context` and optional ISO `at`. It uses `authSecurity.internalToken.routePermission`, `apiExposure: moduleInternal`, and requires `tokenType: service`. The transport bounds request bytes, context keys, values per key, value length, and result count. It returns only enterprise code, ordered Pool codes, matched Rule codes, evaluation time, and an optional server-derived correlation identifier. It never accepts enterprise identity in the body or returns Policy records, criteria, Warehouse membership, balances, or availability.

Correct rejected Policy, Rule, Pool lifecycle, criterion, priority, or date data and retry. Suspension is the operational rollback. Include Policy and Rule history in database backup/restore. Future API observability should record correlation and matched identifiers without logging sensitive customer context by default.

The evaluator fetches active Policies and active Rules per Policy. `DefaultStockSourcingCacheService` caches only its safe result through `DefaultCacheService`; Inventory never imports a provider adapter. The default `cache.inventory.channels.sourcing.engine` is `local`. Projects may select `redis`, or a compliant Hazelcast adapter, through normal cache layering without changing Inventory.

The bundled Hazelcast adapter is implemented with the official client but remains disabled by default. Enable and live-qualify it only for deployments selecting Hazelcast. If a configured cache read or write fails at request time, sourcing evaluates directly. Inventory does not silently activate another provider.

Keys contain a SHA-256 digest of normalized context plus authenticated enterprise identity and remain tenant-partitioned by `nCache`. Explicit historical `at` requests bypass cache by default. TTL never crosses the next known Policy/Rule effective-date boundary. Successful Pool, Pool membership, Policy, and Rule saves/updates flush the tenant sourcing prefix; `nCache` propagates invalidation to peer nodes for local providers and avoids redundant peer events for distributed providers. Invalidation failure is surfaced because silently retaining stale sourcing is unsafe.

Use existing `nCache` diagnostics for hit, miss, error, latency, resource, layer, module, channel, and tenant evidence. Context and key material are never used as metric dimensions. Configure enablement, TTL, maximum key length, explicit-time caching, channel, and module name through `inventory.stockSourcingCache`; configure the provider through `cache.inventory.channels.sourcing`.

## Verification

```bash
node gComm/inventory/test/stockSourcingFoundation.test.js
node gComm/inventory/test/stockSourcingIntentContract.test.js
node gComm/inventory/test/stockSourcingCacheContract.test.js
npm run build
npm run test:basic
```

The tests cover creation, dependencies, matching, ordering, exclusion, no-match behavior, unsupported/operator criteria, immutable identity, retirement ordering, enterprise mismatch, customization, no hard delete, route security, bounded transport, safe projection, result scope, controller delegation, cache hit/miss/failure fallback, tenant/enterprise key isolation, effective-date TTL, invalidation hooks, and provider-neutral selection.
