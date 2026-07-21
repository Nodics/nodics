# Inventory

`inventory` is the Nodics commerce capability for enterprise-scoped warehouses,
warehouse locations, Stock balances and movements, Stock Pools, and declarative
Stock Sourcing, exact Availability, operational Stock Reservations, multi-Warehouse Allocation, coordinated Stock Transfers, and governed Stock Reconciliation.

## Implemented Capabilities

The current slice implements `warehouse` and recursive `warehouseLocation`
schemas, deterministic internal identities, layered classifications and depth,
and persistence interceptors for enterprise isolation, hierarchy, lifecycle,
retirement, and no-hard-delete behavior. Generated schema services remain private.
A narrow service-token-only Warehouse reference intent route supports safe
module-to-module validation; public CRUD and BackOffice routes are not enabled.

Stock Core adds enterprise-scoped, facility/item-specific `stockBalance` state
and immutable `stockMovementRecord` evidence. Receipts, issues, adjustments,
returns, damage, corrections, and transfer legs are configured movement types.
The owning orchestration applies exact decimal-string changes with idempotency,
optimistic revisions, negative-stock policy, and replay recovery if a balance
was committed before its movement record reached a terminal state. Its
Units provider uses the same authoritative conversion contract locally
or remotely and supports same-Unit, direct-factor, and inverse-factor exact
normalization into the balance Unit.

Multi-hop conversion graphs and external integrations are not yet implemented. Stock Pool foundation is implemented through `stockPool` and
`stockPoolMember`: it groups ordered Warehouse references without copying Stock
quantities or embedding future sourcing conditions. Store management is
implemented by the separate `gComm/store` module.

Profile authentication supplies tenant and enterprise identity. Inventory does
not create enterprise, address, store, product, price, order, geography, or unit
authorities.

Layer `inventory.identity`, `inventory.warehouse`, and `inventory.location`
properties to customize classifications or hierarchy depth while preserving
fail-closed scope, stable identities, hierarchy safety, and retirement history.

## Verification

```bash
node gComm/inventory/test/inventoryWarehouseSchemaContract.test.js
node gComm/inventory/test/inventoryWarehouseFoundationService.test.js
node gComm/inventory/test/inventoryWarehouseReferenceContract.test.js
node gComm/inventory/test/stockMovementCore.test.js
node gComm/inventory/test/inventoryUnitsReferenceProvider.test.js
node gComm/inventory/test/stockPoolFoundation.test.js
node gComm/inventory/test/stockSourcingFoundation.test.js
node gComm/inventory/test/stockSourcingIntentContract.test.js
node gComm/inventory/test/stockSourcingCacheContract.test.js
node gComm/inventory/test/stockAvailabilityFoundation.test.js
node gComm/inventory/test/stockReservationFoundation.test.js
node gComm/inventory/test/stockAllocationFoundation.test.js
node gComm/inventory/test/stockTransferFoundation.test.js
node gComm/inventory/test/stockReconciliationFoundation.test.js
```

Read [the warehouse foundation contract](docs/warehouse-foundation.md) for
business operations, administrator configuration, developer behavior,
customization, failures, and troubleshooting.

Read [the Stock Core contract](docs/stock-core.md) before adding stock APIs,
reservation logic, multi-hop conversion, availability, or provider customizations.

Read [the Stock Pool foundation](docs/stock-pool-foundation.md) before adding
availability aggregation or Pool administration APIs.

Read [the Stock Sourcing foundation](docs/stock-sourcing-foundation.md) before
adding sourcing intent APIs, availability, reservation, or cached evaluation.

Read [the Stock Availability foundation](docs/stock-availability-foundation.md) before adding Availability caching or allocation promises.

Read [the Stock Reservation foundation](docs/stock-reservation-foundation.md) before extending checkout holds, expiry, or fulfillment consumption.

Read [the Stock Allocation foundation](docs/stock-allocation-foundation.md) before integrating Order demand, split fulfillment, or backorders.

Read [the Stock Transfer foundation](docs/stock-transfer-foundation.md) before moving Stock between Warehouses or extending discrepancy handling.

Read [the Stock Reconciliation foundation](docs/stock-reconciliation-foundation.md) before adding scheduled scans, findings, approvals, or repairs.

Read [Inventory Operations and Integrations](docs/inventory-operations-and-integrations.md) before exposing BackOffice reads, creating Movement checkpoints, or enabling WMS/POS connectors.
