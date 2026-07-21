# Inventory Agent Contract

Follow the root Nodics contract and `gComm/AGENTS.md`.

- Warehouse and warehouse location records are always tenant- and authenticated-enterprise scoped.
- `code` is a derived internal primary identity. Business users supply `warehouseCode` or `locationCode`.
- Warehouse/location identity and parentage are immutable after creation.
- Retire records through governed state transitions; do not hard-delete them.
- Keep stores, products, prices, orders, geography, addresses, and units of measure in their authoritative modules.
- Inventory owns Stock Balance identity and Stock Movement evidence. Units owns units, dimensions, exact arithmetic, and conversion policy.
- Change on-hand Stock through `DefaultStockMovementService`; change reserved quantity through `DefaultStockReservationOrchestrationService`. Never expose generated persistence services as public mutation paths.
- Preserve idempotency, optimistic revision checks, exact decimal-string arithmetic, and partial-write recovery when customizing Stock.
- Stock conversion must use `DefaultInventoryUnitsReferenceProviderService`, which delegates locally or remotely to the Units-owned intent contract. Never copy Unit or conversion authority into Inventory.
- Reconciliation owns immutable runs/findings, not Stock truth. Use existing Nodics Workflow actions for configurable manual or automatic handling, preserve the corresponding human or service identity, and repair only through existing Stock Movement authority.
- Keep external providers out until their approved slice.
- Stock Pools group Warehouse references only; they never store Stock quantities, product/channel/zone conditions, availability results, or executable sourcing policy.
- Retire every Pool membership before retiring its Pool. Pool and membership identities are immutable and historical records are never hard-deleted.
- Stock Sourcing owns declarative request-context matching and ordered Pool references. It must not execute scripts, accept database-shaped query operators, calculate availability, mutate Stock, reserve quantities, or copy Pool membership.
- Retire every sourcing Rule before retiring its Policy. Sourcing identities are immutable and historical records are never hard-deleted.
- The Stock Sourcing intent route is module-internal and service-token-only. Keep request/result bounds configurable, validate enterprise scope at both transport and evaluator boundaries, and never expose generated sourcing CRUD or Policy criteria through the safe projection.
- Stock Sourcing caching must use provider-neutral `DefaultCacheService`; never call local, Redis, or Hazelcast adapters directly. Preserve tenant/enterprise isolation, effective-date-safe TTL, direct-evaluation fallback, and cross-node invalidation after Pool, membership, Policy, or Rule changes.
- Availability composes Sourcing, Pool membership, Stock Balance, Units conversion, and exact arithmetic without persistence or mutation. Cache only computed responses through `DefaultStockAvailabilityCacheService`; preserve revision validation and mutation invalidation.
- BackOffice-facing operations are bounded allow-listed projections. Never expose generated Inventory CRUD or database-shaped filters.
- Movement checkpoints are immutable on-hand reconstruction baselines. Do not claim Reservation reconstruction from Movement history.
- External WMS/POS providers use configured Nodics module transport, service tokens, idempotency, and durable evidence. Provider responses never bypass Stock Movement authority.
- Reservation holds are operational Online state, use Stock Balance revision compare-and-set, retain evidence, and never use cache as quantity authority. `CONSUMED` remains held until a matching Stock ISSUE commits both on-hand and reserved deltas.
- Use the existing CronJob module to invoke bounded reservation expiry; never add an Inventory-owned scheduler.
- Order owns demand. Inventory Allocation stores stable demand references only, assigns active Reservations across Warehouses, and derives fulfillment from applied reservation-linked ISSUE movements.
- Stock Transfer coordinates existing TRANSFER_OUT/TRANSFER_IN movements. Never edit balances directly, fabricate movements for discrepancies, or rewrite completed history for returns.
- The internal Warehouse reference route may expose only an allow-listed projection, must require a service token, and must never become generic Warehouse CRUD.
- Put classifications and depth limits in `properties.js`; do not hardcode project classifications in services.
- Every slice requires low-level business, operator, developer, customization, failure/recovery, and verification documentation.
