# How To Create And Identify Products

Product gives an enterprise a dependable identity for anything it offers or
manages. The same foundation can represent a product family, a sellable SKU, a
service, a unique asset such as a land parcel, or a future bundle.

## What you need first

Ask an administrator to confirm:

1. Your user has Product read or maintenance permission.
2. You are working in the correct enterprise.
3. The required Product Catalog exists and is active.
4. Any base Unit you plan to use exists in Units.

## Create a Product Item

1. Choose the owning Catalog.
2. Choose the appropriate Item type.
3. Enter a permanent Item code and a clear business name.
4. Optionally add a description and base Unit.
5. Select sellable or stock-managed only when allowed for that Item type.
6. Submit the Item through the Product management operation.
7. Review the returned Item. Nodics creates its internal identity automatically.

Do not enter prices or stock quantities in Product. Pricing and Inventory own
those values and use the Product Item code as a reference.

## Add another recognized identifier

Use an Identifier when partners, scanners, legal records, or external systems
know the Item by another value such as GTIN, EAN, UPC, manufacturer code,
parcel number, or title reference.

1. Confirm the Item exists and is not retired.
2. Choose the Identifier type.
3. Enter a stable Identifier record code and external value.
4. Submit it through the Identifier management operation.

## Organize Items into Categories

Product Categories organize Items within a Product Catalog. They do not create
or replace Catalogs.

1. Create a root Category with a stable code and name.
2. Create child Categories by selecting a parent in the same Catalog.
3. Use order and effective dates to control deterministic presentation data.
4. Assign an Item to one or more Categories and choose its position.
5. Retire assignments and child Categories before retiring their parent.

Nodics rejects missing or retired parents, hierarchy cycles, excessive depth,
invalid Item references, and assignments across Catalog boundaries.

## Describe different Product types without changing the core model

Classification Classes let a business describe phones, property, farmland,
equipment, services, and other domains using governed Attribute Definitions.

1. Define each Attribute and select its value type.
2. Mark it localized when each language needs a separate value.
3. Mark it multi-valued and set cardinality when several values are permitted.
4. Provide allowed choices for enumeration Attributes.
5. Use a measured Attribute with a Units-owned Unit for area, weight, length,
   volume, or another exact measurement.
6. Group Attributes into a Classification Class.
7. Add values to an Item and activate its Class assignment after required
   values are complete.

Nodics stores integer and decimal values as exact strings. It rejects scientific
notation, excess precision, wrong storage fields, unknown enumeration values,
invalid locales, missing Units, excessive cardinality, and incomplete required
classifications.

## Create sellable variants

Use variants when customers choose a specific combination such as colour and
size:

1. Create the base Product Item, such as `shirt`.
2. Create a sellable Item for each offered combination, such as
   `shirt-red-medium`.
3. Define non-localized, single-valued Attributes for colour and size.
4. Add the matching Attribute Values to each sellable Item.
5. Add ordered Variant Axes to the base Product and mark mandatory axes as
   required.
6. Assign each sellable Item to the base and select its values.

Nodics rejects missing required values, values belonging to another Item,
duplicate variants, duplicate business combinations, excessive graph depth,
and cycles. Inventory remains responsible for the sellable variant's stock;
Pricing remains responsible for its price.

## Add related products, bundles, packaging, and media

- Use Relations for accessories, compatibility, replacements, substitutes,
  cross-sells, up-sells, and related Items.
- Use Bundle Entries to add ordered components with exact quantities and
  Units-owned Units. Product does not reserve component stock or calculate a
  bundle price.
- Use Packaging for contained quantity, dimensions, and weight. Enter exact
  decimal strings and select existing Units.
- Use Media References for ordered HTTPS links, type, role, locale, and alt
  text. Upload and binary storage remain outside Product.

Nodics rejects self-links, duplicates, configured graph cycles, unsafe media
URIs, incomplete measurements, and unknown Units or Items.

## Publish approved Product changes

Product authoring happens in a versioned Staged runtime. Online is a different,
non-versioned runtime and database.

1. Select the changed Product records and their exact versions.
2. Submit them with a root Product Item and choose the configured manual or
   automatic approval flow.
3. Complete any manual Workflow actions. Automatic actions continue without a
   person when configured.
4. After approval, the terminal action delegates to `nPublish`.
5. Nodics validates and hashes the Product Catalog snapshot, delivers it using
   module authentication, and atomically activates it Online.

Rejection or pre-activation failure leaves the previous Online release active.
Operators retry or roll back through the governed publication lifecycle; they
must never copy Staged records directly into the Online database.

## Read Products Online

An authenticated customer application supplies Catalog, Item type, Item code,
optional locale, and only the expansions it needs. Product reads the active
Online release and can include identifiers, categories, attributes,
classifications, variants, relations, bundles, packaging, and media.

The response includes the active release version. If that pointer changes, the
next cache key changes automatically. Product uses the configured nCache
channel, so an operator may select NodeCache, Redis, or Hazelcast without
changing Product code. Only one provider should serve the logical channel at a
time.

Product search documents are sent through nSearch after activation. Search and
cache are projections: if either fails, the verified Product release remains
authoritative and Online. A durable projection job records the failure so an
operator can retry incomplete work.

## Diagnose Online publication

An authorized operator can view the active and previous release, pointer
revision, manifest hash and record count, deployment receipts, correlation ID,
and cache/search projection status. When a projection is incomplete, the
operator can run bounded reconciliation. Do not republish, edit Online records,
or change the active pointer merely to repair search or cache.

## Correct or retire information

Names, descriptions, flags, and other permitted fields can be corrected through
the update intent. Enterprise, Catalog ownership, Item type, Item code, and
Identifier identity cannot be changed through an ordinary update.

Retire obsolete records instead of deleting them. This preserves historical
references from Pricing, Inventory, orders, and integrations.

## Common problems

- **Catalog rejected:** select an existing active Catalog.
- **Unit rejected:** select a Unit defined by the Units capability.
- **Type/flag rejected:** the selected type does not permit the requested
  sellable or stock-managed behavior.
- **Enterprise rejected:** sign in under the enterprise that owns the record.
- **Internal reference rejected:** human sessions cannot call module-to-module
  Product lookup; that operation requires a service identity.

Dedicated large-Catalog migration utilities and deployment-specific capacity
certification are outside the implemented Product scope. Product data, the
active release pointer, and accepted manifest remain authoritative over cache
and search. Operators should validate representative production volume using
their selected database, network, cache, and search providers.

Developers and operators can find the complete implemented contract in the
[Product module guide](../../gComm/product/README.md).

## Continue

- [How To Configure And Operate Pricing](how-to-configure-and-operate-pricing.md)
- [How To Operate And Integrate Inventory](how-to-operate-and-integrate-inventory.md)
- [How Store Management Works](how-to-manage-stores.md)
- [How To Customize And Extend Nodics](../development/how-to-customize-and-extend-nodics.md)
- [Nodics Documentation](../README.md)
