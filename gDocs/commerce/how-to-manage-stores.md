# How To Manage Stores

## What A Store Means

A Store is the business unit customers buy from or interact with. It may be a physical shop, an online storefront, a combined physical-and-online operation, a dark store, or a pickup point.

A Store and a Warehouse are different:

- The Store represents the customer-facing sales or service context.
- The Warehouse represents the Inventory-owned place or logical authority that holds stock.
- One Store may have no Warehouse, one Warehouse, or several Warehouses.
- One Warehouse may serve several Stores.

The foundation records these identities and relationships. It also connects Stores to CMS Sites so that separate businesses, brands, countries, or channels can use different content catalogs and website experiences. It does not calculate stock availability, reserve products, choose a warehouse, or render a website.

## Before You Begin

You need an authenticated identity associated with the correct enterprise. Create any Warehouse you intend to assign through the Inventory capability first. Confirm the Store code and Warehouse code with the responsible business teams because they cannot be renamed after creation.

BackOffice frontend screens are not implemented yet. Approved Store management APIs are implemented for a future BackOffice or another human client: readers need `store.backoffice.read`, writers need `store.backoffice.manage`, and both require a human access token. Store validates Warehouses and CMS Sites locally when co-hosted or through secured service-token module reference routes when separately hosted.

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

## Connect Stores To Website Experiences

For the full requirement-to-model guide and developer payloads, read [How To Model Stores And Website Experiences](how-to-model-stores-and-websites.md).

Suppose one enterprise sells Electronics and Apparel from two websites with different designs and content:

1. Create `electronics` and `apparel` as Stores.
2. In CMS, create `electronicsSite` linked to the Electronics content catalog.
3. In CMS, create `apparelSite` linked to the Apparel content catalog.
4. Create Site binding `electronicsWeb` with `cmsSiteCode: electronicsSite` and `storeCodes: [electronics]`.
5. Create Site binding `apparelWeb` with `cmsSiteCode: apparelSite` and `storeCodes: [apparel]`.
6. Review and activate each binding.

A CMS Site may serve several Stores: put their unique codes in one `storeCodes` list. One Store may use several CMS Sites: create one binding per Site, for example web/mobile or country-specific experiences. Optionally set `primaryStoreCode`; it must be one of the listed Stores. Channels, country codes, locale codes, priority, and effective dates can narrow business applicability, but the consuming frontend must apply the final selection/rendering behavior.

The Store module never copies pages, templates, components, or catalogs. CMS remains responsible for those records. If a Site is already bound, update that binding instead of creating another registry or duplicate Site.

## Suspend Or Retire

Use `SUSPENDED` for a temporary operational stop. Use `RETIRED` when a Store or assignment will no longer be used. Records are retained for history and cannot be hard-deleted.

Before retiring a Store:

1. Find every assignment that is not retired.
2. Find every CMS Site binding that references the Store and is not retired.
3. Retire each assignment and Site binding.
4. Confirm no live dependencies remain.
5. Retire the Store.

If retirement fails, complete the dependent assignment retirement and retry. Never delete database records manually.

## What Developers Can Customize

Projects can extend Store types, assignment purposes, priority bounds, Site-binding bounds/applicability, lifecycle transitions, and local/remote reference settings through later-layer `properties.js` configuration. More complex rules can replace the smallest validation/provider service through Nodics layering.

Customizations must keep enterprise isolation, derived identities, Inventory/CMS reference validation, human-versus-service authentication, and historical records. Do not create a second Store, Warehouse, or CMS Site registry or copy owning-module state into Store.

For technical details, read the [Store module guide](../../gComm/store/docs/store-foundation.md) and [Store, CMS Site, and Integration](../../gComm/store/docs/store-site-and-integration.md).

## Continue

- Inventory: [How Warehouse Management Works](how-to-manage-warehouses.md)
- Architecture: [How Nodics Is Organized](../architecture/how-nodics-is-organized.md)
- Security: [How Users, Tenants, And Permissions Work](../security/how-users-tenants-and-permissions-work.md)
- Development: [How To Customize And Extend Nodics](../development/how-to-customize-and-extend-nodics.md)
- Testing: [How To Test Nodics Changes](../testing/how-to-test-nodics-changes.md)
- Documentation home: [Nodics Documentation](../README.md)
