# How Stock Movements Work

Use Stock Movements when a business event changes the on-hand quantity of an
item in a Warehouse or Warehouse Location. Examples include receiving goods,
issuing goods, correcting a count, recording damage, or completing one leg of
a transfer.

## What A Business User Needs To Know

Every change needs:

- the enterprise and Warehouse context;
- the item being changed;
- an exact quantity and Unit;
- a movement type and business reason;
- an idempotency key supplied by the calling process; and
- the Stock Balance revision previously read by that process.

Nodics records both the new balance and evidence of the attempted change. A
repeated request with the same key does not change stock twice. Concurrent
changes cannot silently overwrite one another because only the request holding
the expected revision may update the balance.

## Quantity And Unit Rules

Quantities are stored and calculated as exact decimal strings, supporting
pieces, weight, liquid volume, land area, and other Units dimensions
without floating-point drift. A movement may use another compatible Unit: for
example, `1000 G` can be normalized into a `KG` balance. Units selects an
active direct or inverse exact factor, applies geography and enterprise scope,
and rejects incompatible, ambiguous, unavailable, or forbidden-rounding cases
before Inventory changes stock.

## Operational Recovery

If a node stops after changing a balance but before finalizing its movement
record, retry the same request with the same idempotency key. Nodics recognizes
the balance evidence and finishes the movement without applying it again.

Do not manually edit Stock Balance records. Corrections must be new movements
with a reason so the audit history remains explainable.

## Current Scope

The implemented capability is the exact on-hand ledger with modular exact Unit
conversion. Reservations, allocations, available-to-sell, sourcing, coordinated
transfers, BackOffice screens, and public Stock APIs are not part of this slice.

Developers and operators should read the Inventory module's
[Stock Core contract](../../gComm/inventory/docs/stock-core.md) for configuration,
extension rules, failure codes, and verification.

## Continue

- Inventory: [How Warehouse Management Works](how-to-manage-warehouses.md)
- Units: [How Units And Land Measurements Work](../data/how-to-use-units-and-land-measurements.md)
- Security: [How Users, Tenants, And Permissions Work](../security/how-users-tenants-and-permissions-work.md)
- Testing: [How To Test Nodics Changes](../testing/how-to-test-nodics-changes.md)
- Documentation home: [Nodics Documentation](../README.md)
