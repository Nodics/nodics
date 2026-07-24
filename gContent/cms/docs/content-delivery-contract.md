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

Page and component renderer metadata is resolved from the authoritative
`cmsTypeCode2Renderer` mapping. Delivery returns the logical `renderer` key and
its `rendererContractVersion`; a content-record override may change the key but
does not create another version authority. The mapping also declares supported
delivery channels, deprecation state, and an optional replacement renderer.
Delivery projects these as `rendererChannels`, `rendererDeprecated`, and
`rendererReplacement`, allowing clients to reject unsupported channels and
teams to migrate content without immediately breaking existing pages. Page
delivery also preserves the
template code and adds a client-safe `templateContract` containing only its
code, logical renderer key, and major contract version. Immutable publication
manifests project the same fields so direct and published delivery do not
diverge.

## Security

The public endpoint uses Nodics' explicit `publicAccess` route category; merely
setting `secured: false` is not sufficient. Public delivery must contain only
routes explicitly marked `ONLINE` and `PUBLIC`. New route records default to
`DRAFT` and `AUTHENTICATED`, so incomplete authoring records fail closed. The authenticated endpoint
uses the normal secured request pipeline and
`cms.delivery.authenticated.read`. Neither route is a human login route and
neither changes module-to-module authentication contracts.

The dedicated Storefront endpoint is public at the HTTP boundary, but it does
not accept browser-selected Site or tenant scope. The browser supplies an
absolute application `path` and the opaque `x-nodics-storefront-context`
handle. `DefaultCmsStorefrontContextProviderService` introspects that handle
locally or through existing module transport using a service token and the
`cms` audience. It establishes tenant, enterprise, Site, locale, and channel
before the normal CMS facade and delivery service execute.

The handle is not decoded by CMS and does not replace CMS authority. Storefront
decides only whether the short-lived context is active and which CMS routing
projection it contains. CMS still validates the absolute path, resolves one
Online route, loads the immutable publication manifest when enabled, enforces
graph bounds, and projects safe content. Missing handle, wrong audience,
expiry, cache miss/outage, Storefront outage, missing publication, and
ambiguous content fail closed.

For modular deployment, configure `cms.storefrontContext` with the Storefront
module name, API path, bootstrap tenant, timeout, attempt count, and response
bound. Redirects remain disabled. A later provider override must preserve
service authentication, audience binding, bounded transport, and override
rejection.

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
public access, Storefront introspection where selected, and secured permission
checks.

## Current Boundary

This contract provides bounded direct, authenticated, and Storefront-context
delivery. Staged-to-Online publication uses the separately documented Workflow
and nPublish manifest contract. Executable frontend rendering and binary DAM
storage remain outside CMS backend ownership; projects may add specialized
authoring experiences without bypassing the implemented delivery authorities.

## Governed Contract Migration

`cms.migration` configures a version, explicit legacy renderer mappings,
explicit route mappings, and identifier mappings requiring cascade review.
Secured preview computes tenant-scoped type, renderer, slot/order, and route
changes without writing. Apply persists the same computed change classes
through existing generated schema services and records a redacted
`cmsMigrationAudit`. Rollback restores the audited snapshot. Missing route
mappings and identifier cascades remain explicit manual actions; migration does
not invent URLs from page codes or rename primary identities blindly.
