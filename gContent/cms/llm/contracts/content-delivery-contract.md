# CMS Delivery AI Contract

- Keep `nCatalog` generic and place CMS-domain behavior in `gContent/cms`.
- Reuse Nodics authentication, router, cache, event, publishing, workflow,
  search, and import/export authorities; do not create parallel engines.
- Store logical renderer keys only. Reject executable paths, URLs, scripts, and
  consumer implementation names.
- Extend `cmsTypeCode` as the page/component type authority; do not add a
  parallel component-type registry.
- Model WCMS BackOffice authoring concepts through backend-owned schemas and
  configuration: `cmsComponentTypeGroup` groups existing `cmsTypeCode`
  component types, `cmsNavigationNode` owns site-scoped navigation trees,
  `cmsRestrictionType` owns declarative restriction contracts, and
  `cmsRestriction` assigns configured restrictions to pages, components, slots,
  navigation nodes, or routes.
- Keep WCMS schemas configuration-first and customer-customizable through later
  module layers. Axis may render these records and provide authoring UX, but it
  must not hardcode customer page types, component groups, slot rules,
  restrictions, navigation behavior, or publication logic.
- Restriction type `propertySchema` and evaluator keys are declarative backend
  contracts only. Do not store executable predicates, scripts, client component
  imports, or frontend implementation paths in CMS data.
- Resolve delivery graphs with tenant context, bounded breadth-first batches,
  explicit depth/size limits, and a client-safe allowlisted projection.
- Invalidate the configured effective delivery router prefixes through
  `DefaultCacheService.invalidateResource`; never flush an invented group name
  or bypass nCache after CMS import and mutation.
- Public delivery requires `publicAccess: true`; authenticated delivery uses the
  normal secured pipeline and a governed permission.
- Storefront delivery accepts only browser path plus the opaque handle,
  introspects it with module identity for the `cms` audience, and derives Site,
  locale, channel, tenant, and enterprise from the active result.
- Never decode the handle locally, trust browser scope overrides, or bypass CMS
  Online route/manifest and graph validation after introspection.
- Preserve client-safe delivery status mappings: invalid input `400`, access
  denial `403`, missing content `404`, and graph-bound violations `422`. Never
  collapse expected delivery failures into generic internal errors.
- Define every delivery failure in the module-owned `ERR_CMS_*` status
  catalogue. Do not use unregistered symbolic codes outside Nodics' `ERR_`
  convention because they fall back to the generic system error.
- Consumer-specific sites, catalogs, routes, templates, and content belong in
  later project modules.
- Extend through layered properties and later schema, route, service, facade,
  controller, interceptor, and test contributions.
