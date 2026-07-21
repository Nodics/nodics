# How Warehouse Management Works

This guide explains the implemented Nodics warehouse foundation for business
owners, warehouse administrators, operators, and developers who customize the
out-of-the-box capability.

## Current Capability

Nodics can now persist enterprise-owned warehouses and optional recursive
warehouse locations with protected identity, hierarchy, lifecycle, and
enterprise isolation. This foundation does not yet include stock quantities,
units of measure, stores, sourcing, reservations, transfers, public APIs, or a
BackOffice page. Those capabilities must not be assumed from this guide.

## Business Terms

- A **warehouse** is the logical facility that will later own stock.
- A **warehouse location** is an optional place inside a warehouse, such as
  receiving, storage, aisle, rack, bin, pickup, returns, or quarantine.
- A **business code** is the code employees recognize. Nodics creates a separate
  internal identity so two enterprises can use the same business code safely.
- **Retire** means preserve the record and history but stop using it. Warehouse
  records are not deleted.

## Plan A Warehouse

Before creating a warehouse, decide:

1. Which enterprise owns it.
2. Its stable `warehouseCode` and business name.
3. Whether it is physical, virtual, a store stockroom, dark store, distribution
   center, supplier, dropship, returns, or transit facility.
4. Its purposes and supported capabilities.
5. Country, timezone, and approved address reference where applicable.
6. Whether stock will be tracked only at warehouse level or at internal
   locations.

Codes cannot be renamed later. Choose stable codes that do not include spaces
or transient organizational labels.

## Plan Locations

Start with the smallest hierarchy the business needs. A small organization may
use no locations. A larger facility might use:

```text
Receiving
Storage
└── Zone A
    └── Aisle 01
        └── Rack 01
            └── Bin 01
Pickup
Returns
Quarantine
```

Create parents before children. A location cannot reference itself, another
warehouse, another enterprise, a missing parent, or a retired parent.

## Activate, Suspend, And Retire

1. Create the warehouse and locations as `DRAFT`.
2. Verify business identity, hierarchy, country, timezone, and capabilities.
3. Activate parents before children.
4. Use `SUSPENDED` for temporary operational unavailability.
5. To retire, retire child locations from the deepest level upward.
6. Retire root locations and then the warehouse.

Retirement is permanent under the OOTB policy. A retired identity is historical
evidence and is not reused for a different facility.

## Expected Validation Messages

Nodics rejects missing authentication, cross-enterprise access, invalid codes,
unknown classifications, invalid transitions, missing/cyclic/deep parents,
identity changes, hard deletion, and unsafe retirement order. Correct the
request or approved layered configuration; do not bypass validation.

## Administrator And Developer Configuration

Warehouse/location classifications, transitions, identity format, and maximum
depth come from `inventory` properties. Customize them in a later project,
environment, server, node, tenant, or customer layer. Do not edit OOTB
inventory.

Generated schema services are private in this release. Developers integrate
through generated services and persistence interceptors; they must not call the
database provider directly. Public or BackOffice administration requires a
later intent-API slice with human permissions and negative security tests.

See the module-level
[Warehouse Foundation contract](../../gComm/inventory/docs/warehouse-foundation.md)
for exact fields, properties, services, interceptors, errors, customization,
recovery, and test commands.

## Verify The Foundation

```bash
node gComm/inventory/test/inventoryWarehouseSchemaContract.test.js
node gComm/inventory/test/inventoryWarehouseFoundationService.test.js
```

The tests prove successful configuration and hierarchy behavior as well as
missing enterprise, enterprise mismatch, invalid identity, invalid transition,
immutable identity, missing/self parent, depth, retirement, deletion, and OOTB
classification-extension boundaries.

## What Comes Later

The separately governed Units authority and Store foundation are now
implemented. Stock balance, immutable movement evidence, and Stock Pools are
also implemented, together with declarative Stock Sourcing. Remaining approved slices add sourcing APIs/caching, availability,
reservations, allocations, transfers, reconciliation, and external WMS/POS providers. Permanent documentation will
expand only when each behavior is implemented and verified.

## Continue

- Architecture: [How Nodics Is Organized](../architecture/how-nodics-is-organized.md)
- Security: [How Users, Tenants, And Permissions Work](../security/how-users-tenants-and-permissions-work.md)
- Development: [How To Customize And Extend Nodics](../development/how-to-customize-and-extend-nodics.md)
- Testing: [How To Test Nodics Changes](../testing/how-to-test-nodics-changes.md)
- Documentation home: [Nodics Documentation](../README.md)
