# Store Foundation

## Business Purpose

A Store represents the customer-facing business unit through which an enterprise sells, serves, hands over, or accepts returned products. A Store can be physical, online, hybrid, a dark store, or a pickup point. A Store is not a warehouse: it may hold no inventory authority and may be served by zero, one, or many Inventory warehouses.

## Ownership Boundary

`gComm/store` owns Store identity, lifecycle, descriptive channels/capabilities, and Store-to-Warehouse assignment policy. `gComm/inventory` owns Warehouse identity and lifecycle. An assignment stores only the warehouse business code and validates it through Inventory; it does not copy warehouse details or stock.

Address, geography, product, pricing, stock, availability, reservation, sourcing, POS, and customer-channel authorities are outside this slice. `addressRef` and `channels` are descriptive references only.

## Data Contracts

### Store

Business users provide `storeCode`, `name`, type, optional country/timezone/address reference, channels, capabilities, external references, and effective dates. The persistence boundary derives `code` as `enterprise::store::storeCode` and supplies enterprise ownership from authenticated claims.

Default types are `PHYSICAL`, `ONLINE`, `HYBRID`, `DARK_STORE`, and `PICKUP_POINT`. Default states are `DRAFT`, `ACTIVE`, `SUSPENDED`, and `RETIRED`.

### Store Warehouse Assignment

An assignment connects exactly one Store to exactly one Inventory Warehouse in the same enterprise. The derived identity is `enterprise::storeWarehouse::storeCode::warehouseCode`. `purposes` is required; defaults supported by configuration are `FULFILLMENT`, `PICKUP`, `RETURNS`, and `REPLENISHMENT`. Lower `priority` values indicate earlier consideration within the same purpose, but this slice does not implement sourcing selection.

Effective dates describe intended validity. They do not start a scheduler. Consumers must apply effective-date rules when that behavior is implemented.

## Operating Procedure

1. Confirm the authenticated operator belongs to the target enterprise.
2. Create a Store in `DRAFT`; check its identity, country, timezone, address reference, and classification.
3. Activate the Store only after business review.
4. Create the required Inventory Warehouses separately. They remain authoritative in Inventory.
5. Create one assignment per Store/Warehouse pair. Select one or more purposes and a non-negative priority.
6. Activate assignments after both endpoints and effective dates are verified.
7. Suspend an assignment to stop future consumers from considering it without destroying history.
8. To retire a Store, retire all of its assignments first, then retire the Store.

Expected rejection cases include missing enterprise claims, cross-enterprise payload/query values, invalid business codes, missing or retired Store/Warehouse targets, unknown purposes, out-of-range priority, reversed effective dates, forbidden lifecycle transitions, identity changes, Store retirement with live assignments, and hard deletion.

## Configuration And Customization

Defaults live in `config/properties.js`. Later project, environment, server, node, tenant, or customer layers may extend Store types, assignment purposes, priority boundaries, and lifecycle transitions. Prefer configuration before replacing services.

If a project needs a rule configuration cannot express, override the smallest foundation service in a later module. Preserve authenticated enterprise isolation, deterministic identity, Inventory target validation, no-hard-delete behavior, and lifecycle history. Do not copy schemas, loaders, registries, or Warehouse state.

## Security And Authorization

These schemas currently expose generated internal services but no public generated routers. Authentication claims are the enterprise authority; model and query enterprise values may only confirm, never override, that claim. Future intent APIs must define explicit permissions and negative security tests before routers are enabled.

Human username/password login remains a Profile concern. Module-to-module authentication must use the existing internal token contract; Store does not create another authentication path.

## Operations, Performance, And Observability

Composite indexes scope Store codes by enterprise and assignments by enterprise plus Store/Warehouse. Consumers should query with enterprise and business keys, use bounded limits, and avoid scanning all assignments. Foundation errors use `ERR_STORE_*` codes. Do not log authentication tokens or secret external credentials; `externalReferences` is for non-secret identifiers only.

Assignment creation supports both topologies. When Inventory is co-hosted, Store uses the generated Inventory service directly. When Inventory is separately hosted, Store uses Nodics module communication and the Inventory-owned service-token-only reference intent route. The remote request carries the tenant-scoped internal bearer token and authenticated enterprise header, applies configured timeout/retry limits, and accepts only the safe Inventory projection. A failed validation is safe to retry because the lookup is read-only and no association persists before the pre-save interceptor succeeds.

Configure the target module, API version/path, timeout, maximum attempts, and local preference through `store.warehouseReference` in layered `properties.js`. Tokens and endpoint secrets do not belong in this configuration; Nodics supplies its runtime internal token and resolves the endpoint through `servers` configuration.

Back up Store and assignment collections with the tenant database. Restore both while preserving derived codes and references. Restore Inventory consistently before revalidating assignments.

## Troubleshooting

- Enterprise context required: authenticate with an enterprise-bound principal; do not add enterprise ownership only to the payload.
- Warehouse capability required or warehouse missing: start/configure Inventory and confirm the Warehouse exists in the same tenant and enterprise.
- Remote lookup unavailable: verify `servers.inventory`, Inventory routing, the internal token, enterprise header, network path, and timeout policy. Never bypass validation or copy Warehouse state into Store.
- Store cannot retire: list non-retired assignments, retire them, then retry.
- Classification rejected: inspect the effective layered Store configuration and add the classification through a later module with tests.
- Identity immutable: create a replacement record and retire the old record; do not rename identity fields in place.

## Verification

Run focused tests first:

```bash
node gComm/store/test/storeFoundationSchemaContract.test.js
node gComm/store/test/storeFoundationService.test.js
```

Then regenerate governed artifacts and run repository gates:

```bash
npm run llm:generate
npm run llm:validate
npm run quality:docs
npm run build
npm run test:basic
```

The tests cover positive creation and association, enterprise isolation, invalid codes, missing warehouses, unsupported purposes, priority boundaries, lifecycle rejection, immutable identity, safe retirement, hard-delete rejection, private routers, schema contracts, and layered classification customization.
