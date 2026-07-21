# Stock allocation foundation contract

- Order owns demand; Inventory stores only demand type/code/line references.
- Inventory owns reservation-to-Warehouse assignment and fulfillment evidence.
- Assignments reference ACTIVE reservations exactly and may split one demand line across Warehouses.
- Exact allocated plus backordered quantity equals requested quantity.
- Fulfillment derives from APPLIED reservation-linked ISSUE movements.
- Cancellation and release use Reservation orchestration; generated persistence is not a mutation API.
- Module commands require service identity; cache is never authority.
