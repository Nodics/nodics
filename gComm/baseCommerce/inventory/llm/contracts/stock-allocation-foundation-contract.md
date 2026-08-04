# Stock allocation foundation contract

- Order owns demand; Inventory stores only demand type/code/line references.
- Inventory owns reservation-to-Warehouse assignment and fulfillment evidence.
- Assignments reference ACTIVE reservations exactly and may split one demand line across Warehouses.
- Exact allocated plus backordered quantity equals requested quantity.
- Fulfillment derives from APPLIED reservation-linked ISSUE movements.
- Cancellation and release use Reservation orchestration; generated persistence is not a mutation API.
- Partial cancellation uses a private `stockAllocationCancellation` checkpoint and `DefaultStockAllocationCancellationOrchestrationService`; it must never close the whole Allocation for a smaller approved quantity.
- Assignment planning is exact and deterministic. Fulfilled assignments are excluded, serialized selections bind to active serial evidence, and Allocation revision guards apply after Reservation release.
- `RECONCILIATION_REQUIRED` is durable recovery evidence when Reservation release may have committed before Allocation projection; retries reuse the cancellation identity.
- Module commands require service identity; cache is never authority.
