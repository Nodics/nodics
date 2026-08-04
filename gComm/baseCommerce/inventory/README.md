# Inventory

`inventory` is the Nodics commerce capability for enterprise-scoped warehouses,
warehouse locations, Stock balances and movements, Stock Pools, and declarative
Stock Sourcing, exact Availability, operational Stock Reservations,
multi-Warehouse Allocation, Inventory Promises for preorder/backorder/overbooking
capacity, coordinated Stock Transfers, and governed Stock Reconciliation.

Read the group-level
[Commerce Checkout Foundation](../llm/contracts/commerce-checkout-foundation-contract.md)
for the beginner checkout model and how Inventory Promises connect to cart and
order delivery/payment allocations.

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
implemented by the separate `gComm/baseCommerce/store` module.

Profile authentication supplies tenant and enterprise identity. Inventory does
not create enterprise, address, store, product, price, order, geography, or unit
authorities.

Customer applications call `POST /delivery/storefront/stock-availability/evaluate` with the opaque handle issued by Storefront. Inventory introspects it for the `inventory` audience, derives tenant, enterprise, Store, country, and channel, and delegates to the same authoritative sourcing, Stock Balance, Units, exact-arithmetic, and cache chain. The public response contains customer-safe totals only; operational Pool, Warehouse, Balance, revision, and enterprise evidence remains available only through the service-token intent.

Inventory Promises add a sellable-capacity layer above physical Stock. `inventoryPromise`
records model configured capacity for `STOCK`, `PRE_ORDER`, `BACKORDER`,
`PERPETUAL`, `DROP_SHIP`, `MADE_TO_ORDER`, or `DIGITAL` demand. They carry
exact decimal-string `promisedQuantity`, `reservedQuantity`, optional
`overbookingQuantity`, and the commercial policy hook that checkout/payment
uses when overbooking requires an advance, deposit, full payment, or balance
capture. `inventoryPromiseReservation` records link cart/order demand lines or
allocation codes to either the standard promise bucket or an overbooked bucket.
`DefaultInventoryPromiseReservationOrchestrationService` reserves and releases
this promise capacity with idempotency and revision-guarded counter updates when
the promise is finite and counter-managed. `PERPETUAL` promises are unbounded,
while `DIGITAL`, `DROP_SHIP`, and `MADE_TO_ORDER` promises are on-demand and can
carry provider/provisioning policy evidence. These counterless promises still
create reservation rows for audit and checkout continuity, but they do not
consume finite Promise counters. Promise reservations do not mutate physical
Stock Balance; physical reservation, allocation, issue, serialized-unit binding,
and fulfillment evidence remain owned by the Stock Reservation, Stock
Allocation, Serialized Inventory, and Fulfillment services.

Serialized Inventory adds an optional identity layer for businesses that must
track individual units by serial number, asset tag, or external WMS/ERP unit
reference. `serializedStockUnit` records link one trackable unit to the owning
aggregate `stockBalance` and, when applicable, the current `stockReservation`,
`stockAllocation`, demand line, and last Stock Movement evidence. This model is
not the quantity authority: Stock Balance and Stock Movement still own on-hand,
reserved, and issued quantity math. Customer modules can extend the serialized
unit lifecycle or metadata through configuration and services without changing
Cart, Order, or Fulfillment models.

Return disposition movement execution is implemented through
`DefaultReturnDispositionMovementService`. Fulfillment records safe return
disposition intent, and reverse checkout Workflow calls Inventory to convert
RESTOCK, REPAIR, or SCRAP intent into idempotent Stock Movement evidence.
Inventory resolves Stock from Stock Allocation and Stock Balance evidence,
applies exact quantities through `DefaultStockMovementService`, and preserves
compare-and-set revision protection. Fulfillment and Order never mutate Stock
counters directly.

Inventory also owns return-disposition recovery review. The same
`DefaultReturnDispositionMovementService` exposes `reviewDispositionRecovery`
so Order reverse Workflow can ask whether the idempotent Stock Movement already
exists or whether Inventory operators must review/adjust the movement through
Inventory-owned capabilities. The review does not mutate Stock Balance, Stock
Allocation, or Stock Movement records.

Approved Order cancellation uses
`DefaultStockAllocationCancellationOrchestrationService` through the
service-token-only `cancel-quantity` intent. Inventory creates a private
`stockAllocationCancellation` checkpoint before releasing any hold, selects
only unfulfilled assignment quantities, and calls partial Reservation release
with a stable cancellation/Reservation identity. Reservation release updates
`stockBalance.reservedQuantity` through its existing compare-and-set boundary
and records remaining/released quantities so retries cannot decrement twice.

Allocation projection is updated only after every Reservation checkpoint is
safe. A full cancellation is the same operation when exact remaining quantity
reaches zero. Serialized cancellation additionally requires each serial to
match active assignment evidence and the exact quantity to equal the unique
serial count. Failures after partial persistence enter
`RECONCILIATION_REQUIRED`; callers must not fall back to whole-allocation close.

Layer `inventory.identity`, `inventory.warehouse`, and `inventory.location`
properties to customize classifications or hierarchy depth while preserving
fail-closed scope, stable identities, hierarchy safety, and retirement history.

## Verification

```bash
node gComm/baseCommerce/inventory/test/inventoryWarehouseSchemaContract.test.js
node gComm/baseCommerce/inventory/test/inventoryWarehouseFoundationService.test.js
node gComm/baseCommerce/inventory/test/inventoryWarehouseReferenceContract.test.js
node gComm/baseCommerce/inventory/test/stockMovementCore.test.js
node gComm/baseCommerce/inventory/test/inventoryUnitsReferenceProvider.test.js
node gComm/baseCommerce/inventory/test/stockPoolFoundation.test.js
node gComm/baseCommerce/inventory/test/stockSourcingFoundation.test.js
node gComm/baseCommerce/inventory/test/stockSourcingIntentContract.test.js
node gComm/baseCommerce/inventory/test/stockSourcingCacheContract.test.js
node gComm/baseCommerce/inventory/test/stockAvailabilityFoundation.test.js
node gComm/baseCommerce/inventory/test/inventoryStorefrontAvailabilityContract.test.js
node gComm/baseCommerce/inventory/test/stockReservationFoundation.test.js
node gComm/baseCommerce/inventory/test/stockAllocationFoundation.test.js
node gComm/baseCommerce/inventory/test/stockAllocationCancellationContract.test.js
node gComm/baseCommerce/inventory/test/serializedStockUnitFoundation.test.js
node gComm/baseCommerce/inventory/test/returnDispositionMovementContract.test.js
node gComm/baseCommerce/inventory/test/inventoryPromiseFoundation.test.js
node gComm/baseCommerce/inventory/test/stockTransferFoundation.test.js
node gComm/baseCommerce/inventory/test/stockReconciliationFoundation.test.js
```

Read the warehouse foundation contract (canonical documentation: `capability.commerce.technical-reference`) for
business operations, administrator configuration, developer behavior,
customization, failures, and troubleshooting.

Read the Stock Core contract (canonical documentation: `capability.commerce.technical-reference`) before adding stock APIs,
reservation logic, multi-hop conversion, availability, or provider customizations.

Read the Stock Pool foundation (canonical documentation: `capability.commerce.technical-reference`) before adding
availability aggregation or Pool administration APIs.

Read the Stock Sourcing foundation (canonical documentation: `capability.commerce.technical-reference`) before
adding sourcing intent APIs, availability, reservation, or cached evaluation.

Read the Stock Availability foundation (canonical documentation: `capability.commerce.technical-reference`) before adding Availability caching or allocation promises.

Read the Stock Reservation foundation (canonical documentation: `capability.commerce.technical-reference`) before extending checkout holds, expiry, or fulfillment consumption.

Read the Stock Allocation foundation (canonical documentation: `capability.commerce.technical-reference`) before integrating Order demand, split fulfillment, or backorders.

Read the [Serialized Inventory foundation](llm/contracts/serialized-inventory-foundation-contract.md) (canonical documentation: `capability.commerce.technical-reference`) before binding cart/order serial-number evidence to Inventory-owned serial or asset records.

Read the Inventory Promise foundation (canonical documentation: `capability.commerce.technical-reference`) before extending preorder, backorder, overbooking, commercial-payment requirements, checkout promise reservations, or promise counter orchestration.

Read the Stock Transfer foundation (canonical documentation: `capability.commerce.technical-reference`) before moving Stock between Warehouses or extending discrepancy handling.

Read the Stock Reconciliation foundation (canonical documentation: `capability.commerce.technical-reference`) before adding scheduled scans, findings, approvals, or repairs.

Read Inventory Operations and Integrations (canonical documentation: `capability.commerce.technical-reference`) before exposing BackOffice reads, creating Movement checkpoints, or enabling WMS/POS connectors.
