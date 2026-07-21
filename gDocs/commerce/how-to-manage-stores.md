# How To Manage Stores

## What A Store Means

A Store is the business unit customers buy from or interact with. It may be a physical shop, an online storefront, a combined physical-and-online operation, a dark store, or a pickup point.

A Store and a Warehouse are different:

- The Store represents the customer-facing sales or service context.
- The Warehouse represents the Inventory-owned place or logical authority that holds stock.
- One Store may have no Warehouse, one Warehouse, or several Warehouses.
- One Warehouse may serve several Stores.

The current foundation records these identities and relationships. It does not yet calculate stock availability, reserve products, or choose the best warehouse for an order.

## Before You Begin

You need an authenticated identity associated with the correct enterprise. Create any Warehouse you intend to assign through the Inventory capability first. Confirm the Store code and Warehouse code with the responsible business teams because they cannot be renamed after creation.

Public Store APIs and BackOffice screens are not implemented in this slice. Administrators and developers use the governed internal service/import paths of the deployed project until approved intent APIs are added. Store validates Warehouses locally when co-hosted or through Inventory's secured module-to-module reference lookup when separately hosted.

## Create And Activate A Store

1. Choose a stable `storeCode`, such as `dubaiMall` or `uaeOnline`.
2. Enter the business name.
3. Select the type: physical, online, hybrid, dark store, or pickup point.
4. Add country, timezone, address reference, channels, and capabilities when applicable.
5. Save the Store in `DRAFT`.
6. Review the result. The system derives the internal identity and enterprise ownership.
7. Move the Store to `ACTIVE` after review.

If creation is rejected, verify the authenticated enterprise, code format, effective dates, and effective configuration. Do not work around rejection by changing the internal `code` or enterprise field.

## Assign Warehouses

1. Confirm the Store and Warehouse both exist and are not retired.
2. Create one assignment for the Store/Warehouse pair.
3. Choose one or more purposes: fulfilment, pickup, returns, or replenishment.
4. Enter a priority. Lower numbers are considered earlier by future sourcing behavior; priority does not itself move stock or route an order today.
5. Save in `DRAFT`, review, then activate.
6. Repeat for each additional Warehouse that may serve the Store.

An assignment is rejected when the Store or Warehouse is missing/retired, belongs to another enterprise, has an unsupported purpose, uses an invalid priority, or has reversed effective dates.

## Suspend Or Retire

Use `SUSPENDED` for a temporary operational stop. Use `RETIRED` when a Store or assignment will no longer be used. Records are retained for history and cannot be hard-deleted.

Before retiring a Store:

1. Find every assignment that is not retired.
2. Retire each assignment.
3. Confirm no live assignments remain.
4. Retire the Store.

If retirement fails, complete the dependent assignment retirement and retry. Never delete database records manually.

## What Developers Can Customize

Projects can extend Store types, assignment purposes, priority bounds, and lifecycle transitions through later-layer `properties.js` configuration. More complex rules can replace the smallest validation service through Nodics layering.

Customizations must keep enterprise isolation, derived identities, Inventory warehouse validation, and historical records. Do not create a second Store/Warehouse registry or copy Warehouse state into Store.

For technical details, read the [Store module guide](../../gComm/store/docs/store-foundation.md).

## Continue

- Inventory: [How Warehouse Management Works](how-to-manage-warehouses.md)
- Architecture: [How Nodics Is Organized](../architecture/how-nodics-is-organized.md)
- Security: [How Users, Tenants, And Permissions Work](../security/how-users-tenants-and-permissions-work.md)
- Development: [How To Customize And Extend Nodics](../development/how-to-customize-and-extend-nodics.md)
- Testing: [How To Test Nodics Changes](../testing/how-to-test-nodics-changes.md)
- Documentation home: [Nodics Documentation](../README.md)
