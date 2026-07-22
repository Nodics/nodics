# CMS Delivery AI Contract

- Keep `nCatalog` generic and place CMS-domain behavior in `gContent/cms`.
- Reuse Nodics authentication, router, cache, event, publishing, workflow,
  search, and import/export authorities; do not create parallel engines.
- Store logical renderer keys only. Reject executable paths, URLs, scripts, and
  consumer implementation names.
- Extend `cmsTypeCode` as the page/component type authority; do not add a
  parallel component-type registry.
- Resolve delivery graphs with tenant context, bounded breadth-first batches,
  explicit depth/size limits, and a client-safe allowlisted projection.
- Public delivery requires `publicAccess: true`; authenticated delivery uses the
  normal secured pipeline and a governed permission.
- Storefront delivery accepts only browser path plus the opaque handle,
  introspects it with module identity for the `cms` audience, and derives Site,
  locale, channel, tenant, and enterprise from the active result.
- Never decode the handle locally, trust browser scope overrides, or bypass CMS
  Online route/manifest and graph validation after introspection.
- Consumer-specific sites, catalogs, routes, templates, and content belong in
  later project modules.
- Extend through layered properties and later schema, route, service, facade,
  controller, interceptor, and test contributions.
