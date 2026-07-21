# Product Capability Contract

Product owns Product Item, Identifier, Product Category, Item-to-Category
assignment identity, and lifecycle. It references but never copies Catalog or
Unit authority, and it never stores live Pricing or Inventory truth.

Product Categories organize Items inside one referenced Catalog; they never
replace `nCatalog` hierarchy. Parent traversal must remain bounded, acyclic, and
same-Catalog. Assignment references must resolve to a non-retired Product Item
and Category. Parents retain active children or assignments until dependants
are retired first.

Classification Classes reference Product-owned Attribute Definitions.
Definitions are declarative and bounded. Values use exactly one storage shape
matching their Definition, and localized/cardinality rules fail closed.
Integers and decimals remain canonical strings; measured values reference the
Units authority. An active class assignment requires an active Item, active
Class, active Definitions, and all required Attribute Values.

Variant Axes reference existing non-localized, single-valued Attribute
Definitions. Variant Assignments associate one base Item with one sellable
variant Item and reference Attribute Values owned by that variant. Required
axes must be complete. Canonical combinations derive from typed semantic value
content and remain unique per base Item. Variant graphs are bounded and
acyclic, and an axis retains dependent assignments until they are retired.

Relations use configured type, symmetry, cross-Catalog, ordering, effective
date, cardinality, and acyclic-graph policy. Bundle Entries keep exact positive
quantity strings, use Units references, and reject duplicate components,
positions, excessive depth, and cycles. Packaging stores exact quantities and
measurements with Units-owned Unit codes. Media References accept configured
safe URI schemes and never store binary payloads.

Staged Product business schemas are versioned only by an environment/server
schema contribution. Online schemas remain non-versioned. Workflow governs
manual or automatic approval; `nPublish` remains the publication lifecycle
authority. Product freezes an exact bounded Catalog graph, hashes an immutable
manifest, uses internal module authentication for a distinct Online target,
imports idempotently, atomically activates one Catalog pointer, records
receipts, and supports `nPublish` rollback. No direct database-copy path is
allowed.

Online reads resolve the active pointer and verify its immutable manifest
before projecting customer-safe fields. Expansions are allow-listed and
bounded. Cache keys include tenant-bound enterprise, Catalog, request context,
and release version and use `DefaultCacheService` only. Product defines search
documents while nSearch remains the index authority. Cache/search work is a
durable retryable projection job; partial failure is observable and does not
roll back a successful authoritative activation. Human diagnostics and retry
operations use separate permissions from customer reads and internal target
transport.

Every persisted Product record is tenant- and authenticated-enterprise scoped.
Internal `code` values are derived; client enterprise and internal identities
are never trusted. Identity fields are immutable, history is retired rather
than deleted, and unsupported lifecycle transitions fail closed.

Generated persistence routers stay disabled. Human intents use access tokens
and explicit Product permissions. Internal Item lookup uses service tokens and
an allow-listed projection. Projects customize through later-layer properties,
schema contributions, and named service overrides without copying an owning
authority.
