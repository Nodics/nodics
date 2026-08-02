# Product

Product is Nodics' enterprise-scoped authority for Product Item identity,
descriptive information, lifecycle, alternate identifiers, merchandising
categories, classifications, and Product variants.

The implemented capability supports configurable `PRODUCT`, `SKU`,
`SERVICE`, `ASSET`, and `BUNDLE` item types. This lets an enterprise establish
stable references for ordinary merchandise, services, uniquely identifiable
assets such as land or real-estate units, and future bundles without putting
industry-specific fields into the common model.

## Implemented capability

- tenant- and authenticated-enterprise-scoped Product Items;
- stable catalog, item-type, and item-code identity;
- alternate EAN, UPC, GTIN, ISBN, manufacturer, parcel, title, and external
  identifiers;
- Product-owned Category hierarchy inside an `nCatalog`-owned Catalog;
- ordered, effective-dated Item-to-Category assignments;
- bounded cycle-safe parent traversal and dependent-first retirement;
- declarative Classification Classes and Item-to-class assignments;
- typed text, boolean, exact integer, exact decimal, date, enumeration,
  reference, and measured Attribute Values;
- localized and multi-valued Attributes with bounded cardinality;
- required Attribute enforcement before active classification assignment;
- reusable variant axes backed by existing non-localized, single-valued
  Attribute Definitions;
- base-to-sellable-variant assignments with required-axis coverage, semantic
  combination uniqueness, and bounded cycle-safe traversal;
- configurable directional and symmetric Product relations;
- exact-quantity Bundle components with bounded nested-Bundle graphs;
- Units-backed packaging quantities, dimensions, and weights;
- ordered, localized Product media assignments that reference `nMedia` media
  items or reusable media sets without copying storage URLs;
- manual or automatic Workflow submission of exact versioned Product changes;
- immutable integrity-checked Product release manifests through `nPublish`;
- authenticated delivery to a distinct non-versioned Online runtime with
  idempotent receipts, atomic Catalog pointers, and rollback;
- direct customer Product delivery using an opaque, short-lived Storefront
  context handle with service-authenticated audience introspection;
- customer-safe reads resolved exclusively from the active immutable manifest;
- bounded locale-aware expansion of categories, attributes, classifications,
  variants, relations, bundles, packaging, and media;
- provider-neutral release-qualified caching through `DefaultCacheService`;
- Product-owned search documents indexed through the existing nSearch
  authority;
- durable cache/search projection jobs with partial-failure retry,
  reconciliation, and restricted operational diagnostics;
- Units-backed measured values and unambiguous Product Item references;
- configurable lifecycle transitions and retirement instead of deletion;
- local `nCatalog` validation without copying catalog authority;
- local or modular Unit validation through the Units-owned intent contract;
- bounded human management operations with safe response projections;
- service-token-only Product Item lookup for Inventory, Pricing, and other
  modules;
- disabled generated CRUD routers;
- later-layer policy and provider replacement.

Product does not own catalogs, prices, stock, Unit conversion, customers,
stores, tax, promotions, Workflow state, `nPublish` lifecycle, search/cache
engines, or binary media storage. Those capabilities remain with existing
authorities.

## Product media assignments

Product media is a business assignment, not a file-storage implementation.
Business users normally think in roles such as primary image, thumbnail,
gallery image, swatch, zoom image, product video, manual, or datasheet.
Product owns those roles, their order, locale, lifecycle, and relationship to
the Product Item.

The file itself belongs to `gFramework/nMedia`. A Product media assignment
stores a Product-owned `productMediaCode` plus exactly one of:

- `mediaCode`, when the assignment points to one concrete media item; or
- `mediaSetCode`, when the assignment points to a reusable media set containing
  variants such as original, thumbnail, mobile, desktop, large, and zoom.

Product must not store provider keys, local paths, cloud bucket paths, generated
delivery URLs, signed URLs, checksums, MIME policy, or upload limits. Those
remain `nMedia` authority. A customer-facing API may later resolve displayable
URLs by composing Product with `nMedia`, but Product's persisted record remains
a stable business assignment.

Before saving a Product media assignment, Product validates the configured
`mediaCode` or `mediaSetCode` through the `nMedia` reference lookup contract.
This confirms the media item or set exists and is in a usable lifecycle state
without copying storage keys, paths, provider data, or delivery URLs into the
Product module.

## Runtime requirements

Activate `product` with the framework modules required by normal generated
schema/service operation. Activate `catalog` in the same Product composition so
Product can validate catalog references. Activate `units` locally or configure
the existing Units module connection for modular validation.

Runtime policies belong in `config/properties.js`. `package.json` contains only
static module metadata.

Staged Product must run with Workflow and `nPublish`, set
`product.publication.runtimeRole` to `STAGED`, configure a distinct Online
connection, and enable versioning only through the Staged server schema layer.
Online must set the role to `ONLINE`, keep `publishEnabled` false, and keep all
Product schemas non-versioned.

## Security

Human management routes require access tokens and either
`product.backoffice.read` or `product.backoffice.manage`. The Product Item
reference route requires the existing internal service-token permission.
Service tokens cannot use human management operations, and human access tokens
cannot use the internal reference operation.

Generated Product persistence routers are disabled. Client-provided enterprise
or internal identity fields are discarded or rejected; enterprise scope comes
from authenticated context.

Online Product delivery requires an access token and `product.online.read`.
Alternatively, `GET /online/storefront/items/:itemType/:itemCode` accepts only
the opaque `x-nodics-storefront-context` handle. Product introspects it as the
`product` audience, derives tenant, enterprise, Catalog, and locale from the
active Storefront context, and ignores caller overrides for those values.
Expired, missing, wrong-audience, or unverifiable handles fail closed.
Operational diagnostics and reconciliation require
`product.operations.read` and `product.operations.manage`. Publication target
routes remain service-token-only.

## Customization

Projects customize Product in later-loaded modules by extending
`product.item.itemTypes`, `product.identifier.types`, lifecycle rules, limits,
Attribute, Classification, and Variant policies, or configured reference providers. They
may override named Product services or extend effective schemas through the
standard Nodics hierarchy.

Do not copy Catalog, Units, Pricing, Inventory, generated CRUD, or authentication
logic into Product customizations. See
`llm/examples/extend-product-item-type.md` for the smallest supported path.

## Verification

```bash
node gComm/product/test/productFoundationContract.test.js
node gComm/product/test/productCategoryContract.test.js
node gComm/product/test/productClassificationContract.test.js
node gComm/product/test/productVariantContract.test.js
node gComm/product/test/productCompositionContract.test.js
node gComm/product/test/productPublicationContract.test.js
node gComm/product/test/productOnlineDeliveryAndProjectionContract.test.js
node gComm/product/test/productStorefrontDeliveryContract.test.js
node gComm/product/test/productManagementAndReferenceContract.test.js
node gComm/product/test/productProviderAndOverrideContract.test.js
```

See Product foundation, Category, Classification, and Variant operations (canonical documentation: `capability.commerce.technical-reference`)
for business and developer procedures and
Product release-readiness evidence (canonical documentation: `capability.commerce.technical-reference`) for the
release-readiness validation matrix.

## Not yet implemented

Dedicated large-Catalog migration/import tooling and deployment-specific
capacity certification are outside the implemented Product scope. Use existing
Nodics import/export and database backup authorities; media upload/storage,
Pricing, and Inventory remain separate authorities.
