# Product Agent Contract

Follow the root Nodics contract and `gComm/AGENTS.md`.

- Product owns enterprise-scoped Product Item and alternate Identifier identity,
  descriptive data, Product Category hierarchy, Item-to-Category assignments,
  lifecycle, and Product-domain associations added in later approved slices.
- `code` is derived. Business users supply `catalogCode`, `itemType`,
  `itemCode`, and `identifierCode` as applicable.
- Catalog ownership and Product identities are immutable after creation. Retire
  records through governed transitions; never hard-delete Product history.
- `nCatalog` owns generic catalog hierarchy. Product references Catalog codes
  and must not copy its schema, resolver, or registry.
- Units owns Unit identity and exact conversions. Product stores Unit references
  and validates them through the configured Units provider.
- Pricing owns prices and price resolution. Inventory owns stock and
  availability. Product exposes stable item references and never copies those
  operational authorities.
- Generated Product CRUD routers remain disabled. Human callers use narrowly
  permissioned management intents; modules use the service-token-only reference
  lookup.
- Keep item types, identifier types, lifecycle transitions, limits, and
  providers configurable in `properties.js`.
- Product Categories organize Items inside one Catalog. They do not replace
  `nCatalog` sub-catalog hierarchy. Preserve same-Catalog parents, bounded
  acyclic traversal, effective dates, deterministic ordering, and dependent-
  first retirement.
- Classification Classes and Attribute Definitions are declarative Product
  metadata, never executable scripts. Preserve typed storage, locale rules,
  exact integer/decimal strings, bounded cardinality, active-reference checks,
  and dependent-first retirement.
- Measured Attribute Values reference Units and keep exact decimal strings.
  Never copy Unit conversion or use JavaScript floating-point arithmetic.
- A Product Item reference Attribute requires both `referenceItemType` and
  `referenceCode`; never resolve a polymorphic Item from code alone.
- Variant Axes reuse non-localized, single-valued Attribute Definitions.
  Variant Assignments reference Attribute Values owned by the variant Item;
  preserve required-axis coverage, semantic combination uniqueness, bounded
  acyclic graphs, sellable-variant policy, and dependent-first retirement.
- Product Relations, Bundle Entries, Packaging, and Media References remain
  Product-owned associations. Preserve configured graph bounds, exact quantity
  strings, Units authority, safe URI schemes, and external binary ownership.
- Product Staged records become versioned only in the Staged composition.
  Online remains non-versioned. Workflow owns manual/automatic approval and
  `nPublish` owns deployment lifecycle, retry, audit, and rollback orchestration.
  Product contributes only its domain graph, manifest, target interpretation,
  and replaceable post-activation projection hook.
- Online delivery reads only the active pointer's integrity-checked manifest,
  never partially imported mutable records. Cache access must use
  `DefaultCacheService`, include release identity in keys, and invalidate by
  tenant-aware resource contract. Product owns search documents but nSearch
  owns indexing. Projection failures persist as retryable Product jobs and must
  not undo successful Online activation.
- Storefront customer delivery accepts only the opaque Storefront handle and
  validates it through the Storefront-owned service-token introspection
  contract. Never decode client assertions locally, trust caller Catalog or
  enterprise fields, or make Product a second Storefront-context authority.
- Preserve tenant and authenticated-enterprise scope at API, service, query,
  provider, and persistence boundaries.
- Every extension point must remain replaceable through later-loaded modules
  and include a customization test and documentation.
- Do not claim binary media storage, price, or stock behavior until its owning slice is
  implemented and verified.
