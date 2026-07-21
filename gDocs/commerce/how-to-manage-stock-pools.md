# How To Manage Stock Pools

A Stock Pool gives business operators a reusable group of Warehouses without
creating another copy of Stock. For example, an enterprise can create a
`UAE_FULFILLMENT` Pool containing Dubai and Abu Dhabi Warehouses.

## Before You Begin

- Create the Warehouses in the same enterprise.
- Decide the Pool purpose and stable code.
- Decide membership priority. Lower numbers are considered earlier by Stock Sourcing behavior.
- Remember that a Pool does not make Stock available by itself.

## Create And Activate A Pool

1. Create the Pool in `DRAFT` with its code, name, type, and optional effective dates.
2. Add each Warehouse as a `DRAFT` membership.
3. Set membership priority and review the ordering.
4. Make sure the Pool and Warehouses are `ACTIVE`.
5. Activate each membership.

The same Warehouse may participate in several Pools, but it cannot be added
twice to one Pool. A membership never moves or reserves quantity.

## Suspend Or Retire

Suspend a Pool or membership for a temporary stop. To retire a Pool, retire all
of its memberships first. Never delete Pool or membership database records;
retirement preserves operational history.

## What Comes Later

Sourcing rules will decide when an application, country, delivery zone,
channel, Store, customer segment, or item may use a Pool. Availability will
then calculate eligible Stock from the member Warehouses. Neither behavior is
part of the current Pool foundation.

For configuration, extension, security, recovery, and test details, read the
[Stock Pool foundation contract](../../gComm/inventory/docs/stock-pool-foundation.md).

## Continue

- Warehouses: [How Warehouse Management Works](how-to-manage-warehouses.md)
- Stock: [How Stock Movements Work](how-stock-movements-work.md)
- Security: [How Users, Tenants, And Permissions Work](../security/how-users-tenants-and-permissions-work.md)
- Testing: [How To Test Nodics Changes](../testing/how-to-test-nodics-changes.md)
- Documentation home: [Nodics Documentation](../README.md)
