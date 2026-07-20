# CMS Content Delivery Contract

## Ownership

`gContent/cms` owns reusable content schemas, route resolution, bounded graph
assembly, delivery projection, and CMS mutation hooks. `nCatalog` remains a
generic catalog foundation. Authentication, routing, caching, events, search,
import/export, publishing, and workflow remain owned by their existing Nodics
capabilities.

Consumer and project modules own concrete sites, catalogs, routes, templates,
renderer implementations, and content. CMS stores logical renderer keys but
does not store executable frontend code, filesystem paths, scripts, or remote
renderer URLs.

## Models

- `cmsPageRoute` uniquely scopes a path by site, locale, and channel.
- `cmsPageTemplate` declares a logical renderer contract and owned slots.
- `cmsSlotDefinition` constrains slot cardinality and allowed component types.
- `cmsTypeCode` remains the single page/component type authority and declares
  its kind, contract version, and optional declarative property schema.
- `cmsComponentDetail` orders a target component within a source and slot.

The component-association composite identity is `source + target + slot`.
`DefaultCmsContractValidationService` separately rejects an occupied
`source + slot + index` position. Reordering multiple items should use a future
atomic authoring operation rather than uncoordinated CRUD calls.

## Delivery Resolution

The resolver requires tenant context plus `site` and `path`. Locale and channel
come from the request or layered defaults. It resolves exactly one active route
and page, loads associations and components in breadth-first batches, rejects
ambiguous identities, and enforces `cms.delivery.maxDepth` and
`cms.delivery.maxComponents`.

The response contract version is `1`. Only explicitly projected delivery
properties are returned. Internal persistence, audit, authorization, and
authoring metadata are not copied into the response.

## Security

The public endpoint uses Nodics' explicit `publicAccess` route category; merely
setting `secured: false` is not sufficient. Public delivery must contain only
routes explicitly marked `ONLINE` and `PUBLIC`. New route records default to
`DRAFT` and `AUTHENTICATED`, so incomplete authoring records fail closed. The authenticated endpoint
uses the normal secured request pipeline and
`cms.delivery.authenticated.read`. Neither route is a human login route and
neither changes module-to-module authentication contracts.

## Caching And Invalidation

The routes use Nodics router caching. CMS mutations call the existing
tenant-aware `DefaultCacheService.invalidateResource` contract for the
`cmsDelivery` router resource. This intentionally uses the active cache engine,
channel mapping, and cross-node invalidation behavior instead of creating a CMS
cache implementation.

## Customization

Later-loaded modules may override schemas, route definitions, layered
`cms.delivery` and `cms.renderer` properties, controller/facade members,
resolver methods, validation methods, and cache-invalidation methods. Overrides
must preserve tenant isolation, safe projection, bounded resolution, explicit
public access, and secured permission checks.

## Current Boundary

This contract provides the Phase 0 correctness and Phase 1 delivery foundation.
Draft/Online publication, preview authorization, workflow integration, atomic
authoring/reorder APIs, structured content, DAM, and dependency-aware selective
invalidation are not claimed as implemented here.

## Governed Contract Migration

`cms.migration` configures a version, explicit legacy renderer mappings,
explicit route mappings, and identifier mappings requiring cascade review.
Secured preview computes tenant-scoped type, renderer, slot/order, and route
changes without writing. Apply persists the same computed change classes
through existing generated schema services and records a redacted
`cmsMigrationAudit`. Rollback restores the audited snapshot. Missing route
mappings and identifier cascades remain explicit manual actions; migration does
not invent URLs from page codes or rename primary identities blindly.
