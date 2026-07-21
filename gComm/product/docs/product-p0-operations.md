# Product Foundation, Category, Classification, And Variant Operations

## Business overview

A Product Item gives every sellable or managed offering a stable identity that
other modules can reference. A Product Item can represent a product family,
SKU, service, asset, or bundle. An Identifier adds another recognized code,
such as a barcode, manufacturer code, parcel reference, or title reference,
without changing the primary Product identity.

Product descriptions do not contain live prices or stock. Pricing and Inventory
use the Product Item reference while remaining responsible for their own data.

A Product Category organizes Items for navigation or merchandising inside one
Catalog. It is different from an `nCatalog` sub-catalog: sub-catalogs organize
Catalogs, while Product Categories organize Product Items.

## Roles and prerequisites

- A reader needs `product.backoffice.read`.
- A maintainer needs `product.backoffice.manage`.
- The authenticated user must have an enterprise context.
- The target Catalog must already exist and be active in `nCatalog`.
- A referenced base Unit must exist in Units.

The current module provides API intents for a future BackOffice client; it does
not provide a BackOffice frontend.

## Create and maintain an Item

1. Choose the owning Catalog.
2. Choose an enabled item type.
3. Enter a stable item code and name.
4. Optionally enter a description and base Unit.
5. Mark the Item sellable or stock-managed only when the configured item type
   allows it.
6. Create the Item through the Product management intent.
7. Move it through an allowed configured lifecycle transition.
8. Retire it when it must no longer be used. Do not delete it.

The system derives the internal identity from enterprise, Catalog, item type,
and item code. Those identity fields cannot be changed later.

## Add an Identifier

1. Confirm the Product Item exists and is not retired.
2. Select a configured identifier type.
3. Provide an identifier record code and its external value.
4. Mark it primary only when that meaning is appropriate for the consuming
   integration.
5. Create the Identifier through the Product management intent.

Invalid Catalogs, Units, item references, types, identities, and lifecycle
changes fail without creating or changing a record.

## Create and maintain Categories

1. Choose the Catalog that owns the Category.
2. Enter a permanent Category code and name.
3. For a child Category, select an active parent in the same Catalog.
4. Set its order, navigation flag, and optional effective dates.
5. Create the Category through the Product management intent.
6. Assign Items using an Assignment code, Category, Item type/code, position,
   primary flag, and optional effective dates.

The hierarchy rejects missing parents, retired parents, self-parenting, cycles,
and paths deeper than the configured maximum. Retire active assignments and
child Categories before retiring their parent.

## Define classifications and typed Attributes

1. Create Attribute Definitions before creating a Classification Class.
2. Choose the exact value type: text, boolean, integer, decimal, date,
   enumeration, reference, or measured.
3. Choose whether the Attribute is localized or multi-valued and set its
   minimum and maximum values.
4. For an enumeration, provide the complete allowed-value list.
5. For a measured Attribute, require a Unit. Product stores the exact decimal
   string while Units validates the Unit identity.
6. Create a Classification Class with its allowed and required Attribute codes.
7. Add typed Attribute Values to the Product Item.
8. Activate the Item-to-class assignment after all required values exist.

Localized Attributes require a valid locale on every value. Non-localized
Attributes reject locale data. A Product Item reference needs both its Item type
and Item code. Attribute Definitions and Classes cannot be retired while active
Values, Classes, or assignments still depend on them.

## Create variants

A base Product describes a family such as a shirt or phone. A variant is the
specific sellable Item selected by a customer, such as a red medium shirt. The
variant remains an ordinary Product Item, so Inventory can own its stock and
Pricing can independently target it.

1. Create and activate the base Item using a configured base Item type. The
   default is `PRODUCT`.
2. Create and activate every sellable variant Item. The defaults are `SKU` and
   `ASSET`.
3. Create non-localized, single-valued Attribute Definitions for each
   selection dimension, such as colour and size.
4. Add the matching Attribute Values to every variant Item.
5. Create ordered Variant Axes on the base Item. Mark an axis required when
   every variant must provide it.
6. Create a Variant Assignment from the base Item to each variant Item and
   select one Attribute Value for every required axis.
7. Activate the assignment only after the base Item, variant Item, axes, and
   values are active.

Nodics derives `combinationKey` from typed value content, not from the value
record code. Two records that both mean colour red and size medium are the same
combination and cannot identify two variants under one base. Callers must not
supply or modify this key.

Retire Variant Assignments before retiring an axis they use. A variant cannot
be its own base, and configured graph depth and cycle checks protect projects
that extend the default base/variant type policy.

## Add relations, bundles, packaging, and media

Use a Product Relation for a governed association such as accessory,
compatible, replacement, substitute, cross-sell, up-sell, or related. Choose
the source, target, type, order, and optional effective dates. Product rejects
self-links, duplicates, disallowed cross-Catalog links, excessive cardinality,
and cycles for configured acyclic types. Symmetric types treat the reverse link
as the same business relation.

For a Bundle:

1. Create the owning `BUNDLE` Item and every component Item.
2. Add each component with a stable Entry code, exact positive quantity,
   Units-owned Unit code, order, and optional flag.
3. Retain finite nested-Bundle depth. Product rejects duplicate components,
   duplicate positions, self-components, cycles, and scientific notation.

For Packaging, record package type, contained quantity and Unit, and optional
length, width, height, and weight. All three dimensions must be supplied
together with one dimension Unit. Weight requires its own Unit. Product stores
exact strings; Units remains responsible for conversion.

For Media, record only an external URI plus type, role, locale, order, and alt
text. The default accepts HTTPS. Product rejects credentials embedded in a URI
and never uploads or stores the binary.

## Approve and publish Product changes

The Staged and Online runtimes use different databases. A business user never
copies Product records directly to Online.

1. Create or update Product data in the versioned Staged runtime.
2. Submit a Product publication with a stable submission code, root Product
   Item and exact version, approval mode, and the exact changed-item versions.
3. Workflow creates either the configured manual review action or automatic
   path. A flow may contain manual and automatic actions; mode selects the
   supplied default flow, not a second Workflow engine.
4. A reviewer approves or rejects manual work. Rejection leaves Online
   unchanged.
5. The terminal automatic action calls the existing `nPublish` lifecycle.
6. Product freezes only the bounded business-active Catalog graph at exact versions, builds
   and hashes an immutable manifest, and sends it with an internal service
   token to the configured distinct Online Product connection.
7. Online verifies integrity and contract version, imports records
   idempotently, atomically activates the Catalog pointer, and records a
   receipt. Duplicate delivery returns the already active release.
8. Rollback through `nPublish` reactivates a previously accepted manifest.

The previous pointer remains authoritative if validation or target delivery
fails before activation. Operators should correct the dependency, connection,
token, size, or contract issue and retry the governed publication rather than
writing Online data manually.

## Read and operate Online Product delivery

Authenticated customers call the Product Online item operation with Catalog,
Item type, Item code, optional locale, and an allow-listed comma-separated
expansion list. The service first resolves the enterprise-scoped active Catalog
pointer, loads and verifies its immutable manifest, and projects only safe
fields. It never reads a partly imported release.

Supported expansions are identifiers, categories, attributes,
classifications, variants, relations, bundles, packaging, and media. Limits in
`product.delivery` bound expansion count and records. A missing Item returns a
stable `found: false` response for the active release; a missing or corrupt
release fails closed.

Product delivery caching uses `DefaultCacheService`. The key contains trusted
enterprise, Catalog, Item, locale, expansions, and active release. Select
NodeCache, Redis, or Hazelcast through the one active nCache channel provider;
never call those adapters from Product. A cache outage falls back to the
verified manifest.

After activation or rollback, Product creates a durable projection job. Cache
invalidation and nSearch indexing run independently. A failed search operation
records `PARTIAL` state while the Product release remains Online; retry resumes
only incomplete work. Search is a discoverability projection and never Product
authority.

Operators with `product.operations.read` can inspect active/previous release,
pointer revision, manifest hash/version/record count, receipts, correlation ID,
and projection states. Operators with `product.operations.manage` can run a
bounded reconciliation retry. Customer reads, human operations, and internal
publication transport retain separate permissions and token types.

## Failure and recovery

- Missing enterprise: authenticate in the correct enterprise context.
- Unknown Catalog: create or activate it through `nCatalog`; do not create a
  duplicate Catalog record in Product.
- Unknown Unit: correct the Unit through Units or configure the proper Units
  module connection.
- Provider unavailable: restore the authoritative module or its configured
  connection, then retry the same intent.
- Invalid lifecycle transition: choose an allowed next state. A retired record
  cannot be reactivated under the default policy.
- Category retirement blocked: retire its active Item assignments and child
  Categories first.
- Attribute value rejected: verify its Definition type, locale, ordinal,
  cardinality, enumeration value, exact-number syntax, and Unit.
- Classification activation rejected: add all required active Attribute Values
  and confirm the Item, Class, and Definitions are active.
- Variant axis rejected: use an active non-localized, single-valued Attribute
  Definition and a unique axis position and Attribute for that base Item.
- Variant assignment rejected: confirm the variant is sellable, all required
  axes have values owned by that variant, and the semantic combination is new.
- Axis retirement blocked: retire all Variant Assignments using that axis,
  then retry the axis retirement.
- Publication rejected before Workflow: verify the root Item and every
  associated schema/code/version, permission, enterprise, and configured mode.
- Manifest rejected Online: investigate size, contract version, or integrity;
  never edit and resend a signed manifest under the same identity.
- Online unavailable: restore the configured distinct module connection and
  retry through `nPublish`; do not point Staged at the Online database.
- Pointer conflict: reload target status and let the governed lifecycle retry
  or reconcile; do not overwrite the pointer outside its revision contract.
- Duplicate or ambiguous record: investigate identity/data quality; never
  bypass validation with generated persistence APIs.

Creation and updates are safe to retry only according to the normal persistence
contract of the calling integration. Product management does not add a separate
bulk-import idempotency contract.

## Developer architecture

`productItem`, `productIdentifier`, `productCategory`, and
`productCategoryAssignment`, `productAttributeDefinition`,
`productAttributeValue`, `productClassificationClass`, and
`productClassificationAssignment`, `productVariantAxis`, and
`productVariantAssignment` are Product-owned schemas with generated
internal services and disabled generated routers. Schema interceptors add
authenticated enterprise scope, derive identities, validate references, enforce
immutable fields, validate lifecycle transitions, and reject hard deletion.

`DefaultProductManagementService` exposes allow-listed human operations and
safe fields. `DefaultProductItemReferenceService` exposes a service-token-only
projection. `DefaultProductCatalogReferenceProviderService` composes the local
`DefaultCatalogService`. `DefaultProductUnitsReferenceProviderService` composes
the local or modular Units intent. `DefaultProductCategoryService` validates
same-Catalog hierarchy, graph bounds, assignments, and safe retirement.
`DefaultProductClassificationService` enforces typed storage, locale and
cardinality rules, exact numbers, Unit references, required Class values, and
classification dependency retirement.
`DefaultProductVariantService` composes those existing Product authorities to
validate axes and assignments. It derives canonical combinations, enforces
sellable-variant and cardinality policy, traverses the association graph with a
configured bound, and blocks unsafe axis retirement. It does not copy
Attribute Values into a second value model.
`DefaultProductCompositionService` validates relations, Bundle Entries,
Packaging, and Media References. Publication services implement Product's
domain adapter, immutable manifest, version provider, internal-token transport,
Online target, Workflow bridge, and replaceable projection hook while
delegating lifecycle to `nPublish`.

All limits, types, lifecycle transitions, and provider selections are layered
under `product` in `properties.js`. Projects can override individual service
methods or extend the effective schema in a later module.

## Deployment and observability

Product can run in a consolidated composition or its own modular composition.
Catalog must currently be co-hosted with Product; Units may be local or remote.
Health/readiness should treat missing mandatory Product dependencies as a
composition error before business traffic is admitted.

Use existing Nodics request, error, authentication, module-call, and database
observability. Preserve correlation and authenticated actor context. Product
does not introduce a new logger, registry, scheduler, cache engine, search
engine, or event bus.

For high-volume variant families, keep `maximumAxesPerBase`,
`maximumVariantsPerBase`, and `maximumHierarchyDepth` finite. The validation
path performs bounded reads by enterprise, Catalog, base Item, axis, variant
Item, and combination. Monitor validation latency and conflict error rates
using the existing request and database telemetry.

For publication, monitor Workflow carrier, publication code, correlation ID,
source version, dependency count, manifest bytes/hash, delivery attempts,
target receipt, pointer revision, and rollback result. Back up Staged version
history and the Online manifest, receipt, pointer, and non-versioned Product
records using the configured database provider. Restore and reconciliation
must preserve tenant and enterprise boundaries.

## Backup, migration, and troubleshooting

Back up Product records using the configured database provider's governed
backup process. Preserve both Items and Identifiers and their enterprise and
Catalog scope. Import/export must use existing Nodics data capabilities; no
Product-specific parallel importer exists.

Before changing identity rules, inventory all persisted references from
Pricing, Inventory, and integrations. Product identity fields are immutable, so
identity migration requires an explicitly designed migration rather than an
ordinary update.

## Verification

Run the focused tests listed in the module README, including
`productCategoryContract.test.js` and
`productClassificationContract.test.js` and
`productVariantContract.test.js`,
`productCompositionContract.test.js` and
`productPublicationContract.test.js`, and
`productOnlineDeliveryAndProjectionContract.test.js`. Then regenerate schema
artifacts and run generated, configuration, documentation, and basic regression tests at the
integration boundary.
