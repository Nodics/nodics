# Stock allocation foundation

Stock Allocation assigns Order demand to one or more active Stock Reservations. Order remains authoritative for the order and line; Inventory stores only stable demand references and supply-assignment evidence.

An allocation records requested, allocated, backordered, and fulfilled exact quantities. Assignments reference reservations, their Warehouses, Stock Balances, and eventual applied ISSUE movements. A line may therefore split across Warehouses without copying Stock or Order data.

Lifecycle states are `PENDING`, `ALLOCATED`, `PARTIALLY_ALLOCATED`, `BACKORDERED`, `PARTIALLY_FULFILLED`, `FULFILLED`, `RELEASED`, `CANCELLED`, and `FAILED`.

Allocation creation is idempotent. Every assignment must match one ACTIVE reservation exactly by item, Unit, and quantity. Partial allocation is controlled by `inventory.stockAllocation.allowPartial`; assignment count is bounded by `maximumAssignments`.

Cancellation and release delegate to the existing Reservation orchestration. Fulfillment is derived from applied reservation-linked Stock ISSUE evidence rather than caller claims. Generated Allocation persistence is private and hard deletion is rejected.

The module-internal service-token APIs are `/references/stock-allocations/allocate`, `/cancel`, `/release`, and `/fulfill`. Cache providers are not allocation or quantity authorities.
