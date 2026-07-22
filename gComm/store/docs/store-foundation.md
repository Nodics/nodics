# Store Foundation

## Business Purpose

A Store represents the customer-facing business unit through which an enterprise sells, serves, hands over, or accepts returned products. A Store can be physical, online, hybrid, a dark store, or a pickup point. A Store is not a warehouse: it may hold no inventory authority and may be served by zero, one, or many Inventory warehouses.

## Ownership Boundary

`gComm/store` owns Store identity, lifecycle, descriptive channels/capabilities, Store-to-Warehouse assignment policy, and the commercial association between Stores and CMS Sites. `gComm/inventory` owns Warehouse identity and lifecycle. `gContent/cms` owns Site, content-catalog, page, template, component, and content state. Store records references and validates them through their owning modules; it does not copy Warehouse or CMS state.

Address, geography, product, stock, availability, reservation, sourcing, POS, and customer-channel authorities are outside this slice. Pricing owns Price Lists and validates Store-scoped assignments through Store. `addressRef`, `channels`, country codes, and locale codes remain references/applicability metadata, not copied master data.

## Data Contracts

### Store

Business users provide `storeCode`, `name`, type, optional country/timezone/address reference, channels, capabilities, external references, and effective dates. The persistence boundary derives `code` as `enterprise::store::storeCode` and supplies enterprise ownership from authenticated claims.

Default types are `PHYSICAL`, `ONLINE`, `HYBRID`, `DARK_STORE`, and `PICKUP_POINT`. Default states are `DRAFT`, `ACTIVE`, `SUSPENDED`, and `RETIRED`.

### Store Warehouse Assignment

An assignment connects exactly one Store to exactly one Inventory Warehouse in the same enterprise. The derived identity is `enterprise::storeWarehouse::storeCode::warehouseCode`. `purposes` is required; defaults supported by configuration are `FULFILLMENT`, `PICKUP`, `RETURNS`, and `REPLENISHMENT`. Lower `priority` values indicate earlier consideration within the same purpose, but this slice does not implement sourcing selection.

Effective dates describe intended validity. They do not start a scheduler. Consumers must apply effective-date rules when that behavior is implemented.

### Store Content Site Binding

A binding connects one CMS-owned Site to a bounded, unique list of Store codes inside one authenticated enterprise. This supports one Store with several country/channel Sites and one shared Site serving several Stores. `cmsSiteCode` is uniquely claimed by one binding in the tenant, so it cannot silently become a cross-enterprise authority path. A primary Store may be selected only from `storeCodes`.

The derived identity is `enterprise::storeSite::bindingCode`. Optional channels, countries, locales, priority, and effective dates describe applicability. Store retirement is rejected while a non-retired Site binding still references that Store. The binding does not select pages or execute templates; CMS and the separate frontend retain those responsibilities.

## Operating Procedure

1. Confirm the authenticated operator belongs to the target enterprise.
2. Create a Store in `DRAFT`; check its identity, country, timezone, address reference, and classification.
3. Activate the Store only after business review.
4. Create the required Inventory Warehouses separately. They remain authoritative in Inventory.
5. Create one assignment per Store/Warehouse pair. Select one or more purposes and a non-negative priority.
6. Activate assignments after both endpoints and effective dates are verified.
7. Suspend an assignment to stop future consumers from considering it without destroying history.
8. To retire a Store, retire all of its assignments first, then retire the Store.
9. Create required CMS Sites/catalogs in CMS, then create and activate Store Site bindings.
10. Retire all live Site bindings before retiring a referenced Store.

Expected rejection cases include missing enterprise claims, cross-enterprise payload/query values, invalid business codes, missing or retired Store/Warehouse targets, missing CMS Sites, duplicate Site ownership, invalid/duplicate Store lists, an invalid primary Store, unknown purposes, out-of-range priority, reversed effective dates, forbidden lifecycle transitions, identity changes, Store retirement with live dependencies, and hard deletion.

## Configuration And Customization

Defaults live in `config/properties.js`. Later layers may extend Store types, assignment purposes, priority boundaries, lifecycle transitions, management limits, and local/remote Warehouse reference settings. Prefer configuration before replacing services.

If a project needs a rule configuration cannot express, override the smallest foundation/provider service in a later module. Preserve enterprise isolation, deterministic identity, owning-module reference validation, no-hard-delete behavior, and lifecycle history. Do not copy schemas, loaders, registries, or Warehouse state. Storefront, not Store, owns website composition.

## Security And Authorization

Generated schema routers remain disabled. Explicit `/management/:resource` intent routes accept human access tokens and require `store.backoffice.read` or `store.backoffice.manage`. The `/references/stores/resolve` intent accepts service tokens only. Authentication claims are the enterprise authority; payload/query values may never override them.

Human username/password login remains a Profile concern. Module-to-module authentication must use the existing internal token contract; Store does not create another authentication path.

## Operations, Performance, And Observability

Composite indexes scope Store codes by enterprise and assignments by enterprise plus Store/Warehouse. Consumers should query with enterprise and business keys, use bounded limits, and avoid scanning all assignments. Foundation errors use `ERR_STORE_*` codes. Do not log authentication tokens or secret external credentials; `externalReferences` is for non-secret identifiers only.

Warehouse validation supports both topologies. Co-hosted modules use the generated Inventory service locally. Separately hosted modules use Nodics module communication and Inventory's service-token-only reference route. Remote requests carry a tenant-scoped internal bearer token and authenticated enterprise header, use configured timeout/retry limits, and accept bounded projections. No association persists before pre-save validation succeeds.

Configure Inventory through `store.warehouseReference`, management limits through `store.management`, and Store reference policy through `store.referenceLookup`. Tokens and endpoint secrets do not belong there; Nodics supplies runtime internal tokens and resolves endpoints through `servers` configuration.

Back up Store and assignment collections with the tenant database. Restore both while preserving derived codes and references. Restore Inventory consistently before revalidating assignments.

## Troubleshooting

- Enterprise context required: authenticate with an enterprise-bound principal; do not add enterprise ownership only to the payload.
- Warehouse capability required or warehouse missing: start/configure Inventory and confirm the Warehouse exists in the same tenant and enterprise.
- Remote lookup unavailable: verify `servers.inventory`, Inventory routing, the internal token, enterprise header, network path, and timeout policy. Never bypass validation or copy Warehouse state into Store.
- Store cannot retire: list non-retired Warehouse assignments, retire them, then retry. Storefront references should be handled by the Storefront lifecycle before a Store is retired.
- Classification rejected: inspect the effective layered Store configuration and add the classification through a later module with tests.
- Identity immutable: create a replacement record and retire the old record; do not rename identity fields in place.

## Verification

Run focused tests first:

```bash
node gComm/store/test/storeFoundationSchemaContract.test.js
node gComm/store/test/storeFoundationService.test.js
node gComm/store/test/storeManagementContract.test.js
```

Then regenerate governed artifacts and run repository gates:

```bash
npm run llm:generate
npm run llm:validate
npm run quality:docs
npm run build
npm run test:basic
```

The tests cover positive creation and associations, multi-Store Site binding, enterprise isolation, human/service auth boundaries, bounded projections, invalid codes/lists, missing references, duplicate Site ownership, priority/lifecycle rejection, immutable identity, safe retirement, hard-delete rejection, private generated routers, explicit intent routes, local/remote transport, and layered customization.
