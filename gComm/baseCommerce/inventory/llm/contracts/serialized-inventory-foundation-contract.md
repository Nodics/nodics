# Serialized Inventory foundation contract

Serialized Inventory is the optional Inventory-owned layer for businesses that
must track a specific physical or digital unit by serial number, asset tag, or
external WMS/ERP identity.

## Beginner model

Most inventory systems keep a fast aggregate count:

- 10 phones available in Warehouse A
- 2 phones reserved for checkout
- 1 phone allocated to Order 123

That aggregate count is still owned by `stockBalance`, `stockReservation`,
`stockAllocation`, and `stockMovementRecord`.

Serialized Inventory adds the extra question:

- Which exact phone was reserved?
- Which serial number was allocated?
- Which asset moved through a transfer, return, repair, or quarantine process?

For that, Inventory owns `serializedStockUnit`.

## Ownership

Inventory owns:

- `serializedStockUnit` schema identity, state, and evidence.
- enterprise scoping and deterministic `code` generation.
- lifecycle guards and no-hard-delete behavior.
- links to aggregate Stock Balance, Reservation, Allocation, demand evidence,
  and last Stock Movement evidence.

Inventory does not own:

- Product definitions, SKU attributes, or variant authority.
- Cart or Order entry lifecycle.
- Shipment/carrier lifecycle.
- WMS/ERP secrets or raw provider payloads.

Cart and Order may preserve selected serial evidence for checkout display or
order history, but reusable framework code must validate and bind serial
identity through Inventory-owned services.

## Implemented model

`serializedStockUnit` is a first-class schema with generated service enabled
and generated router disabled. Axis and BackOffice can inspect it through
module-owned `backofficeCapabilities` metadata, while mutation remains guarded
by Inventory policy and interceptors.

Important fields:

- `serializedUnitCode`: stable business code for the tracked unit.
- `serialNumber`: manufacturer, supplier, or business-facing serial number.
- `assetTag`: optional internal scan or asset tag.
- `externalReference`: optional WMS, ERP, supplier, or marketplace unit id.
- `stockCode`: owning aggregate Stock Balance reference.
- `warehouseCode` and `locationCode`: current facility evidence.
- `itemType` and `itemCode`: owning product/catalog authority reference.
- `quantity` and `scale`: fixed to one individual unit by default.
- `state`: governed lifecycle state.
- `reservationCode` and `allocationCode`: optional demand-hold evidence.
- `demandType`, `demandCode`, and `demandLineCode`: optional cart/order links.
- `lastMovementCode`: last aggregate movement evidence.
- `conditionCode`: optional sellable, damaged, repair, or quarantine evidence.

## Lifecycle states

The default serialized-unit states are configuration-backed:

- `REGISTERED`: the serial or asset is known but not yet available.
- `AVAILABLE`: the unit can be reserved or allocated.
- `RESERVED`: a reservation currently holds the unit.
- `ALLOCATED`: the unit is assigned to demand.
- `IN_TRANSIT`: the unit is moving between facilities or through shipment.
- `FULFILLED`: the unit has been issued or delivered.
- `RETURNED`: the unit came back from customer or partner flow.
- `QUARANTINED`: the unit is blocked for inspection, damage, compliance, or repair.
- `RETIRED`: the unit identity is no longer operationally usable.

Customer modules may extend this state list through layered Inventory
configuration and replace the serialized-unit policy service, but they must
preserve enterprise scope, deterministic identity, aggregate quantity authority,
and no hard delete.

## Quantity rule

`serializedStockUnit` represents one trackable unit. It does not replace
aggregate Stock Balance math.

The default policy enforces:

- `quantity: "1"`
- `scale: 0`

Businesses that need serialized sub-quantities, license seats, meter units, or
asset bundles should add a customer module extension and clearly document how
that extension reconciles to aggregate Stock Balance.

## Axis and BackOffice behavior

Inventory publishes backend-driven metadata for a `Serialized Units` workspace:

- route: `/commerce/operations/stock/serialized-units`
- module: `inventory`
- schema: `serializedStockUnit`
- default columns: unit code, serial number, item, warehouse, state, reservation,
  and allocation.
- detail sections: Identity, Stock Evidence, and Demand Links.

`stockBalance` and `stockAllocation` workspaces can declare detail panels that
show related serialized units without creating page-specific frontend logic.

## Customization

A customer module can:

- add new states such as `LEASED`, `INSTALLED`, `REPAIR_PENDING`, or `SCRAPPED`;
- add customer metadata under `attributes`;
- replace `DefaultSerializedStockUnitPolicyService` with a stricter policy;
- add WMS/ERP synchronization through Inventory external-provider services;
- add a Workflow for serial assignment approval, repair, quarantine, or recall.

A customer module must not:

- mutate Stock Balance directly from a serial unit update;
- expose generated serialized-unit CRUD routes publicly;
- store secrets or raw WMS/ERP provider payloads in serialized-unit records;
- make Cart, Order, or Fulfillment the source of truth for serial lifecycle.

## Failure and recovery

Common failure cases:

- missing authenticated enterprise context;
- caller supplies a derived `code` that does not match `serializedUnitCode`;
- unsupported lifecycle state;
- quantity other than one;
- missing aggregate `stockCode` reference;
- hard delete attempt.

Recovery should happen through Inventory-owned operations:

- review serial-unit state and links in Axis/BackOffice;
- reconcile aggregate Stock Balance through Stock Movement/Reconciliation;
- repair WMS/ERP drift through provider-operation evidence;
- use Workflow for human approval when unit lifecycle or ownership is disputed.

## Verification

Run:

```bash
node gComm/baseCommerce/inventory/test/serializedStockUnitFoundation.test.js
node gComm/baseCommerce/inventory/test/inventoryOperationsContract.test.js
node gComm/test/commerceOperationsBackofficeNavigationContract.test.js
```

Regenerate source-derived context after changes:

```bash
npm run module:metadata
npm run llm:generate
npm run llm:validate
```
